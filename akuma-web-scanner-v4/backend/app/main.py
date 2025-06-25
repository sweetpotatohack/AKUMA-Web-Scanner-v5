"""
AKUMA WEB SCANNER - Backend API
Legendary Cyberpunk Vulnerability Scanner with Web Interface
By AKUMA & Феня - The Cyber Gods 🔥💀
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import asyncio
import json
import uuid
import logging
from datetime import datetime, timedelta
import os
from pathlib import Path

from .database import get_db, engine
from .models import Base, ScanJob, Vulnerability, Target, User
from .schemas import (
    ScanJobCreate, ScanJobResponse, VulnerabilityResponse,
    TargetCreate, TargetResponse, UserCreate, UserResponse,
    ScanConfig, ScanStats
)
from .auth import create_access_token, verify_password, get_current_user, hash_password
from .scanner_engine import AkumaScannerEngine
from .celery_app import celery_app
from .websocket_manager import ConnectionManager

# Инициализация FastAPI приложения
app = FastAPI(
    title="AKUMA Web Scanner",
    description="🔥 Legendary Cyberpunk Vulnerability Scanner 🔥",
    version="3.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS настройки
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене указать конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Создание таблиц в БД
Base.metadata.create_all(bind=engine)

# WebSocket менеджер
manager = ConnectionManager()

# Security
security = HTTPBearer()

# Логирование
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ==================== AUTHENTICATION ====================

@app.post("/api/auth/register", response_model=UserResponse)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    """Регистрация нового пользователя"""
    # Проверяем, что пользователь не существует
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Создаем нового пользователя
    hashed_password = hash_password(user.password)
    db_user = User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password,
        is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    logger.info(f"🎉 New user registered: {user.email}")
    return db_user

@app.post("/api/auth/login")
async def login(email: str, password: str, db: Session = Depends(get_db)):
    """Авторизация пользователя"""
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    access_token = create_access_token(data={"sub": user.email})
    logger.info(f"🔐 User logged in: {email}")
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username
        }
    }

# ==================== SCAN MANAGEMENT ====================

@app.post("/api/scans", response_model=ScanJobResponse)
async def create_scan(
    scan_job: ScanJobCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Создание нового скан-задания"""
    
    # Создаем скан в БД
    db_scan = ScanJob(
        name=scan_job.name,
        description=scan_job.description,
        targets=json.dumps(scan_job.targets),
        scan_config=json.dumps(scan_job.config.dict()) if scan_job.config else "{}",
        user_id=current_user.id,
        status="pending"
    )
    db.add(db_scan)
    db.commit()
    db.refresh(db_scan)
    
    # Запускаем скан через Celery
    task = celery_app.send_task(
        'scanner.run_scan',
        args=[db_scan.id, scan_job.targets, scan_job.config.dict() if scan_job.config else {}]
    )
    
    # Обновляем task_id в БД
    db_scan.task_id = task.id
    db.commit()
    
    logger.info(f"🚀 New scan created: {db_scan.id} by {current_user.email}")
    
    # Уведомляем через WebSocket
    await manager.broadcast({
        "type": "scan_created",
        "scan_id": db_scan.id,
        "message": f"Scan '{scan_job.name}' created and queued"
    })
    
    return db_scan

@app.get("/api/scans", response_model=List[ScanJobResponse])
async def get_scans(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получение списка сканов пользователя"""
    scans = db.query(ScanJob)\
        .filter(ScanJob.user_id == current_user.id)\
        .offset(skip)\
        .limit(limit)\
        .all()
    return scans

@app.get("/api/scans/{scan_id}", response_model=ScanJobResponse)
async def get_scan(
    scan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получение детальной информации о скане"""
    scan = db.query(ScanJob)\
        .filter(ScanJob.id == scan_id, ScanJob.user_id == current_user.id)\
        .first()
    
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    return scan

@app.delete("/api/scans/{scan_id}")
async def delete_scan(
    scan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Удаление скана"""
    scan = db.query(ScanJob)\
        .filter(ScanJob.id == scan_id, ScanJob.user_id == current_user.id)\
        .first()
    
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    # Останавливаем задачу если она выполняется
    if scan.task_id and scan.status in ["running", "pending"]:
        celery_app.control.revoke(scan.task_id, terminate=True)
    
    # Удаляем из БД
    db.delete(scan)
    db.commit()
    
    logger.info(f"🗑️ Scan deleted: {scan_id} by {current_user.email}")
    
    return {"message": "Scan deleted successfully"}

@app.post("/api/scans/{scan_id}/stop")
async def stop_scan(
    scan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Остановка выполняющегося скана"""
    scan = db.query(ScanJob)\
        .filter(ScanJob.id == scan_id, ScanJob.user_id == current_user.id)\
        .first()
    
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    if scan.status not in ["running", "pending"]:
        raise HTTPException(status_code=400, detail="Scan is not running")
    
    # Останавливаем задачу
    if scan.task_id:
        celery_app.control.revoke(scan.task_id, terminate=True)
    
    # Обновляем статус
    scan.status = "stopped"
    scan.finished_at = datetime.utcnow()
    db.commit()
    
    logger.info(f"⏹️ Scan stopped: {scan_id} by {current_user.email}")
    
    await manager.broadcast({
        "type": "scan_stopped",
        "scan_id": scan_id,
        "message": f"Scan '{scan.name}' stopped by user"
    })
    
    return {"message": "Scan stopped successfully"}

# ==================== VULNERABILITIES ====================

@app.get("/api/scans/{scan_id}/vulnerabilities", response_model=List[VulnerabilityResponse])
async def get_vulnerabilities(
    scan_id: int,
    severity: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получение уязвимостей для скана"""
    # Проверяем доступ к скану
    scan = db.query(ScanJob)\
        .filter(ScanJob.id == scan_id, ScanJob.user_id == current_user.id)\
        .first()
    
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    # Запрос уязвимостей
    query = db.query(Vulnerability).filter(Vulnerability.scan_id == scan_id)
    
    if severity:
        query = query.filter(Vulnerability.severity == severity)
    
    vulnerabilities = query.offset(skip).limit(limit).all()
    return vulnerabilities

@app.get("/api/vulnerabilities/{vuln_id}", response_model=VulnerabilityResponse)
async def get_vulnerability(
    vuln_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получение детальной информации об уязвимости"""
    vuln = db.query(Vulnerability)\
        .join(ScanJob)\
        .filter(Vulnerability.id == vuln_id, ScanJob.user_id == current_user.id)\
        .first()
    
    if not vuln:
        raise HTTPException(status_code=404, detail="Vulnerability not found")
    
    return vuln

# ==================== REPORTS ====================

@app.get("/api/scans/{scan_id}/report/html")
async def get_html_report(
    scan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Генерация HTML отчета"""
    scan = db.query(ScanJob)\
        .filter(ScanJob.id == scan_id, ScanJob.user_id == current_user.id)\
        .first()
    
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    # Путь к файлу отчета
    report_path = f"/app/scan_results/{scan_id}/turbo_cyber_report.html"
    
    if os.path.exists(report_path):
        return FileResponse(
            report_path,
            media_type="text/html",
            filename=f"akuma_scan_{scan_id}_report.html"
        )
    else:
        raise HTTPException(status_code=404, detail="Report not found")

@app.get("/api/scans/{scan_id}/report/json")
async def get_json_report(
    scan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Генерация JSON отчета"""
    scan = db.query(ScanJob)\
        .filter(ScanJob.id == scan_id, ScanJob.user_id == current_user.id)\
        .first()
    
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    # Получаем уязвимости
    vulnerabilities = db.query(Vulnerability)\
        .filter(Vulnerability.scan_id == scan_id)\
        .all()
    
    # Статистика
    stats = {
        "total_vulnerabilities": len(vulnerabilities),
        "critical": len([v for v in vulnerabilities if v.severity == "critical"]),
        "high": len([v for v in vulnerabilities if v.severity == "high"]),
        "medium": len([v for v in vulnerabilities if v.severity == "medium"]),
        "low": len([v for v in vulnerabilities if v.severity == "low"]),
        "info": len([v for v in vulnerabilities if v.severity == "info"])
    }
    
    return {
        "scan": {
            "id": scan.id,
            "name": scan.name,
            "status": scan.status,
            "created_at": scan.created_at,
            "finished_at": scan.finished_at,
            "targets": json.loads(scan.targets)
        },
        "statistics": stats,
        "vulnerabilities": [
            {
                "id": v.id,
                "title": v.title,
                "severity": v.severity,
                "target": v.target,
                "description": v.description,
                "proof_of_concept": v.proof_of_concept,
                "recommendation": v.recommendation,
                "cvss_score": v.cvss_score,
                "cve_id": v.cve_id
            } for v in vulnerabilities
        ]
    }

# ==================== FILE UPLOAD ====================

@app.post("/api/uploads/targets")
async def upload_targets_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Загрузка файла с целями для сканирования"""
    if not file.filename.endswith(('.txt', '.csv')):
        raise HTTPException(
            status_code=400,
            detail="Only .txt and .csv files are supported"
        )
    
    # Читаем содержимое файла
    content = await file.read()
    targets = []
    
    try:
        lines = content.decode('utf-8').split('\n')
        for line in lines:
            line = line.strip()
            if line and not line.startswith('#'):
                targets.append(line)
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="Invalid file encoding")
    
    logger.info(f"📁 File uploaded: {file.filename}, {len(targets)} targets by {current_user.email}")
    
    return {
        "filename": file.filename,
        "targets_count": len(targets),
        "targets": targets[:100]  # Возвращаем первые 100 для предпросмотра
    }

# ==================== STATISTICS ====================

@app.get("/api/dashboard/stats")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Статистика для дашборда"""
    # Общая статистика пользователя
    total_scans = db.query(ScanJob)\
        .filter(ScanJob.user_id == current_user.id)\
        .count()
    
    completed_scans = db.query(ScanJob)\
        .filter(ScanJob.user_id == current_user.id, ScanJob.status == "completed")\
        .count()
    
    running_scans = db.query(ScanJob)\
        .filter(ScanJob.user_id == current_user.id, ScanJob.status == "running")\
        .count()
    
    # Уязвимости
    total_vulns = db.query(Vulnerability)\
        .join(ScanJob)\
        .filter(ScanJob.user_id == current_user.id)\
        .count()
    
    critical_vulns = db.query(Vulnerability)\
        .join(ScanJob)\
        .filter(ScanJob.user_id == current_user.id, Vulnerability.severity == "critical")\
        .count()
    
    # Последние сканы
    recent_scans = db.query(ScanJob)\
        .filter(ScanJob.user_id == current_user.id)\
        .order_by(ScanJob.created_at.desc())\
        .limit(5)\
        .all()
    
    return {
        "total_scans": total_scans,
        "completed_scans": completed_scans,
        "running_scans": running_scans,
        "total_vulnerabilities": total_vulns,
        "critical_vulnerabilities": critical_vulns,
        "recent_scans": [
            {
                "id": scan.id,
                "name": scan.name,
                "status": scan.status,
                "created_at": scan.created_at,
                "targets_count": len(json.loads(scan.targets))
            } for scan in recent_scans
        ]
    }

# ==================== WEBSOCKET ====================

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    """WebSocket соединение для real-time обновлений"""
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Обработка различных типов сообщений
            if message.get("type") == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
            elif message.get("type") == "subscribe_scan":
                scan_id = message.get("scan_id")
                await manager.add_to_room(client_id, f"scan_{scan_id}")
                
    except WebSocketDisconnect:
        manager.disconnect(client_id)

# ==================== HEALTH CHECK ====================

@app.get("/api/health")
async def health_check():
    """Проверка состояния сервиса"""
    return {
        "status": "healthy",
        "version": "3.0",
        "timestamp": datetime.utcnow(),
        "services": {
            "database": "connected",
            "redis": "connected",
            "celery": "running"
        }
    }

# ==================== STARTUP EVENT ====================

@app.on_event("startup")
async def startup_event():
    """Инициализация при запуске"""
    logger.info("🔥 AKUMA Web Scanner started! 🔥")
    logger.info("🚀 Ready to hack the matrix! 💀")

@app.on_event("shutdown")
async def shutdown_event():
    """Очистка при завершении"""
    logger.info("👋 AKUMA Web Scanner shutting down...")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

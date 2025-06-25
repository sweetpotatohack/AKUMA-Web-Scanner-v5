from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uuid
import asyncio
import logging
import json
from datetime import datetime
import requests
import os
import aiofiles
import tempfile

# Import notification system
from notifications import notification_manager, notify_scan_started, notify_scan_completed, notify_critical_vulnerability

app = FastAPI(
    title="AKUMA Web Scanner v6.5",
    description="🚀 Ultimate Security Arsenal with Notifications",
    version="6.5.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# In-memory storage (replace with actual database in production)
scans_db = {}
users_db = {}

# Models
class ScanRequest(BaseModel):
    name: str
    targets: List[str]
    scan_type: str = "ultimate"
    scan_options: Optional[Dict[str, Any]] = {}

class NotificationSettings(BaseModel):
    telegram_chat_id: Optional[str] = None
    email: Optional[str] = None
    enable_telegram: bool = False
    enable_email: bool = False
    enable_critical_alerts: bool = True

class User(BaseModel):
    id: str
    username: str
    email: str
    notification_settings: NotificationSettings = NotificationSettings()

class Vulnerability(BaseModel):
    id: str
    title: str
    severity: str
    cvss: float
    description: str
    tool: str

class Scan(BaseModel):
    id: str
    name: str
    targets: List[str]
    status: str
    created_at: str
    progress: int
    vulnerabilities: List[Vulnerability]
    scan_type: str
    scan_options: Dict[str, Any]
    tools_used: List[str]

# Health check
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "AKUMA Backend v6.5"}

@app.get("/")
async def root():
    return {"message": "🚀 AKUMA Web Scanner v6.5 - Ultimate Security Arsenal with Notifications"}

# Notification endpoints
@app.post("/api/notifications/settings")
async def update_notification_settings(settings: NotificationSettings):
    """Update notification settings"""
    try:
        if settings.enable_telegram and settings.telegram_chat_id:
            notification_manager.add_telegram_chat(settings.telegram_chat_id)
        
        if settings.enable_email and settings.email:
            notification_manager.add_email_recipient(settings.email)
        
        return {"message": "Notification settings updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/notifications/test")
async def test_notifications():
    """Test notification system"""
    try:
        test_message = f"""
🧪 <b>AKUMA Test Notification</b>

This is a test message from AKUMA Web Scanner v6.5

<b>Time:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
<b>Status:</b> ✅ Notifications are working!

<i>Ready to hack the planet! 🔥💀</i>
"""
        
        telegram_result = await notification_manager.send_telegram_message(test_message)
        email_result = await notification_manager.send_email(
            "🧪 AKUMA Test Notification", 
            "This is a test email from AKUMA Web Scanner v6.5"
        )
        
        return {
            "telegram": "success" if telegram_result else "failed",
            "email": "success" if email_result else "failed",
            "message": "Test notifications sent"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Existing scan endpoints with notification integration
@app.post("/api/scans")
async def create_scan(request: ScanRequest):
    scan_id = str(uuid.uuid4())[:8]
    
    scan = {
        "id": scan_id,
        "name": request.name,
        "targets": request.targets,
        "status": "queued",
        "created_at": datetime.now().isoformat(),
        "progress": 0,
        "vulnerabilities": [],
        "scan_type": request.scan_type,
        "scan_options": request.scan_options,
        "tools_used": []
    }
    
    scans_db[scan_id] = scan
    
    # Send notification
    asyncio.create_task(notify_scan_started(scan_id, request.name, request.targets))
    
    # Trigger scanner
    try:
        scanner_response = requests.post(
            "http://akuma-scanner-v6:5000/scan",
            json={
                "scan_id": scan_id,
                "targets": request.targets,
                "scan_type": request.scan_type,
                "scan_options": request.scan_options
            },
            timeout=30
        )
        
        if scanner_response.status_code == 200:
            scan["status"] = "running"
            scans_db[scan_id] = scan
            logger.info(f"Scan {scan_id} started successfully")
        else:
            scan["status"] = "failed"
            scans_db[scan_id] = scan
            raise HTTPException(status_code=500, detail="Failed to start scan")
            
    except Exception as e:
        scan["status"] = "failed"
        scans_db[scan_id] = scan
        logger.error(f"Failed to start scan {scan_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Scanner error: {str(e)}")
    
    return scan

@app.get("/api/scans")
async def get_scans():
    return list(scans_db.values())

@app.get("/api/scans/{scan_id}")
async def get_scan(scan_id: str):
    if scan_id not in scans_db:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scans_db[scan_id]

@app.delete("/api/scans/{scan_id}")
async def delete_scan(scan_id: str):
    if scan_id not in scans_db:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    del scans_db[scan_id]
    return {"message": f"Scan {scan_id} deleted successfully"}

@app.post("/api/scans/upload")
async def upload_targets(file: UploadFile = File(...)):
    """Upload target file and parse targets"""
    try:
        content = await file.read()
        targets = []
        
        if file.filename.endswith('.txt'):
            targets = content.decode('utf-8').strip().split('\n')
        elif file.filename.endswith('.csv'):
            import csv
            import io
            csv_reader = csv.reader(io.StringIO(content.decode('utf-8')))
            for row in csv_reader:
                if row:
                    targets.extend(row)
        
        # Clean and validate targets
        targets = [target.strip() for target in targets if target.strip()]
        
        return {"targets": targets, "count": len(targets)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File processing error: {str(e)}")

# Webhook endpoint for scanner updates
@app.post("/api/scans/{scan_id}/update")
async def update_scan(scan_id: str, update_data: dict):
    """Update scan progress and results"""
    if scan_id not in scans_db:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    scan = scans_db[scan_id]
    
    # Update scan data
    scan.update(update_data)
    
    # Check for critical vulnerabilities and send immediate alerts
    if "vulnerabilities" in update_data:
        for vuln in update_data["vulnerabilities"]:
            if vuln.get("severity") == "critical":
                asyncio.create_task(notify_critical_vulnerability(scan_id, vuln))
    
    # Send completion notification if scan is completed
    if update_data.get("status") == "completed":
        vulnerabilities = scan.get("vulnerabilities", [])
        vuln_counts = {
            "critical": len([v for v in vulnerabilities if v.get("severity") == "critical"]),
            "high": len([v for v in vulnerabilities if v.get("severity") == "high"]),
            "medium": len([v for v in vulnerabilities if v.get("severity") == "medium"]),
            "low": len([v for v in vulnerabilities if v.get("severity") == "low"])
        }
        
        asyncio.create_task(notify_scan_completed(
            scan_id, 
            scan["name"], 
            len(vulnerabilities),
            vuln_counts["critical"],
            vuln_counts["high"],
            vuln_counts["medium"],
            vuln_counts["low"]
        ))
    
    scans_db[scan_id] = scan
    return {"message": "Scan updated successfully"}

@app.get("/api/stats")
async def get_stats():
    """Get dashboard statistics"""
    total_scans = len(scans_db)
    running_scans = len([s for s in scans_db.values() if s.get("status") == "running"])
    completed_scans = len([s for s in scans_db.values() if s.get("status") == "completed"])
    
    all_vulnerabilities = []
    for scan in scans_db.values():
        all_vulnerabilities.extend(scan.get("vulnerabilities", []))
    
    total_vulnerabilities = len(all_vulnerabilities)
    critical_vulnerabilities = len([v for v in all_vulnerabilities if v.get("severity") == "critical"])
    
    return {
        "total_scans": total_scans,
        "running_scans": running_scans,
        "completed_scans": completed_scans,
        "total_vulnerabilities": total_vulnerabilities,
        "critical_vulnerabilities": critical_vulnerabilities
    }

# Grafana integration endpoint
@app.get("/api/grafana/config")
async def get_grafana_config():
    """Get Grafana configuration for unified auth"""
    return {
        "grafana_url": "http://localhost:3000",
        "auth_enabled": True,
        "auto_login": True
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

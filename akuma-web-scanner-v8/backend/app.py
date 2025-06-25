#!/usr/bin/env python3
"""
AKUMA Scanner v8 Backend
Полнофункциональная версия с 6-этапным сканированием
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import subprocess
import os
import json
import uuid
import tempfile
from datetime import datetime
import asyncio
import xml.etree.ElementTree as ET
import re
import threading
import time

app = FastAPI(title="AKUMA Scanner v8 API", version="8.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Результаты сканирования в памяти (в продакшне должна быть БД)
scan_results = {}
scan_statuses = {}

# ==================== MODELS ====================

class ScanCreate(BaseModel):
    name: str
    targets: List[str]
    modules: List[str] = ["nmap", "httpx", "whatweb", "nuclei"]

class ScanResponse(BaseModel):
    id: str
    name: str
    targets: List[str]
    modules: List[str]
    status: str
    created_at: str

# ==================== ROUTES ====================

@app.post("/upload-targets")
async def upload_targets(file: UploadFile = File(...)):
    """Загрузка файла с таргетами"""
    try:
        content = await file.read()
        targets = []
        
        # Парсим файл (строка = один таргет)
        lines = content.decode('utf-8').strip().split('\n')
        for line in lines:
            line = line.strip()
            if line and not line.startswith('#'):
                targets.append(line)
        
        return {"targets": targets}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Ошибка обработки файла: {str(e)}")

@app.post("/scans", response_model=ScanResponse)
async def create_scan(scan: ScanCreate, background_tasks: BackgroundTasks):
    """Создание нового скана"""
    try:
        scan_id = str(uuid.uuid4())
        
        # Сохраняем информацию о скане
        scan_info = {
            "id": scan_id,
            "name": scan.name,
            "targets": scan.targets,
            "modules": scan.modules,
            "status": "starting",
            "created_at": datetime.now().isoformat(),
            "results": {},
            "progress": "Инициализация..."
        }
        
        scan_results[scan_id] = scan_info
        scan_statuses[scan_id] = "starting"
        
        # Запускаем сканирование в отдельном потоке
        thread = threading.Thread(target=run_full_scan_pipeline, args=(scan_id, scan.targets, scan.modules))
        thread.daemon = True
        thread.start()
        
        return ScanResponse(**scan_info)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка создания скана: {str(e)}")

@app.get("/scans/{scan_id}")
async def get_scan(scan_id: str):
    """Получение статуса и результатов скана"""
    if scan_id not in scan_results:
        raise HTTPException(status_code=404, detail="Скан не найден")
    
    return scan_results[scan_id]

@app.get("/scans")
async def list_scans():
    """Список всех сканов"""
    return list(scan_results.values())

@app.get("/stats")
async def get_stats():
    """Статистика сканирования"""
    total_scans = len(scan_results)
    active_scans = len([s for s in scan_results.values() if s["status"] == "running"])
    completed_scans = len([s for s in scan_results.values() if s["status"] == "completed"])
    
    # Подсчет уязвимостей
    total_vulns = 0
    for scan in scan_results.values():
        for target_result in scan.get("results", {}).values():
            nuclei_results = target_result.get("nuclei", {})
            if "vulnerabilities" in nuclei_results:
                total_vulns += len(nuclei_results["vulnerabilities"])
    
    # Подсчет целей
    total_targets = sum(len(scan.get("targets", [])) for scan in scan_results.values())
    
    return {
        "total_scans": total_scans,
        "active_scans": active_scans,
        "completed_scans": completed_scans,
        "total_vulnerabilities": total_vulns,
        "total_targets": total_targets
    }

# ==================== SCANNING FUNCTIONS ====================

def run_full_scan_pipeline(scan_id: str, targets: List[str], modules: List[str]):
    """Полный пайплайн сканирования - 6 этапов"""
    try:
        scan_results[scan_id]["status"] = "running"
        scan_results[scan_id]["progress"] = "Запуск сканирования..."
        results = {}
        
        for i, target in enumerate(targets):
            print(f"🎯 Начинаем сканирование {target} ({i+1}/{len(targets)})")
            scan_results[scan_id]["progress"] = f"Сканируем {target} ({i+1}/{len(targets)})"
            
            target_results = {}
            
            # Этап 1: Ping сканирование (опционально)
            scan_results[scan_id]["progress"] = f"Ping {target}..."
            ping_alive = ping_scan(target)
            target_results["ping"] = {"status": "alive" if ping_alive else "dead"}
            
            # Продолжаем сканирование даже если ping не прошел!
            print(f"🔍 Запускаем nmap для {target} (ping: {'✅' if ping_alive else '❌'})")
            
            # Этап 2: Nmap сканирование (всегда запускаем)
            if "nmap" in modules:
                scan_results[scan_id]["progress"] = f"Nmap сканирование {target}..."
                nmap_results = run_nmap_scan(target)
                target_results["nmap"] = nmap_results
                print(f"🔍 Nmap завершен для {target}: {len(nmap_results.get('open_ports', []))} открытых портов")
                
                # Этап 3: HTTPx для поиска веб-сервисов
                if "httpx" in modules:
                    scan_results[scan_id]["progress"] = f"HTTPx сканирование {target}..."
                    print(f"🌐 Запускаем httpx для {target}")
                    httpx_results = run_httpx_scan(target, nmap_results.get("open_ports", []))
                    target_results["httpx"] = httpx_results
                    web_services = httpx_results.get("web_services", [])
                    print(f"🌐 HTTPx завершен для {target}: найдено {len(web_services)} веб-сервисов")
                    
                    # Этап 4: WhatWeb для определения технологий
                    if "whatweb" in modules and web_services:
                        scan_results[scan_id]["progress"] = f"WhatWeb анализ {target}..."
                        print(f"🔎 Запускаем whatweb для {target}")
                        whatweb_results = run_whatweb_scan(web_services)
                        target_results["whatweb"] = whatweb_results
                        
                        # Этап 5: Nuclei сканирование
                        if "nuclei" in modules:
                            scan_results[scan_id]["progress"] = f"Nuclei сканирование {target}..."
                            print(f"💥 Запускаем nuclei для {target}")
                            nuclei_results = run_nuclei_scan(web_services)
                            target_results["nuclei"] = nuclei_results
                            vulns = nuclei_results.get("vulnerabilities", [])
                            print(f"💥 Nuclei завершен для {target}: найдено {len(vulns)} уязвимостей")
                            
                            # Этап 6: Специализированные сканеры (Bitrix/WordPress)
                            scan_results[scan_id]["progress"] = f"Специализированное сканирование {target}..."
                            run_specialized_scans(target, whatweb_results, target_results)
            
            results[target] = target_results
            # Обновляем результаты по ходу
            scan_results[scan_id]["results"] = results
        
        # Завершаем сканирование
        scan_results[scan_id]["results"] = results
        scan_results[scan_id]["status"] = "completed"
        scan_results[scan_id]["progress"] = "Сканирование завершено"
        print(f"🎉 Сканирование {scan_id} завершено!")
        
    except Exception as e:
        print(f"💥 Ошибка в сканировании {scan_id}: {str(e)}")
        scan_results[scan_id]["status"] = "error"
        scan_results[scan_id]["error"] = str(e)
        scan_results[scan_id]["progress"] = f"Ошибка: {str(e)}"

def ping_scan(target: str) -> bool:
    """Этап 1: Ping сканирование"""
    try:
        result = subprocess.run(['ping', '-c', '1', '-W', '3', target], 
                              capture_output=True, text=True, timeout=10)
        return result.returncode == 0
    except:
        return False

def run_nmap_scan(target: str) -> Dict:
    """Этап 2: Nmap сканирование"""
    try:
        # Создаем директорию для результатов
        os.makedirs("/tmp/akuma_results", exist_ok=True)
        
        # Упрощенное сканирование для тестирования
        cmd = [
            'nmap', '-sV', '-Pn', '-T4', 
            '--top-ports', '1000', '--open', 
            '--min-rate=1000', '--max-retries=1',
            '--script=http-title,ssl-cert',
            '-oX', f'/tmp/akuma_results/nmap_{target.replace(".", "_")}.xml',
            target
        ]
        
        print(f"🔍 Запускаем команду: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
        
        # Парсим XML результат
        open_ports = []
        xml_file = f'/tmp/akuma_results/nmap_{target.replace(".", "_")}.xml'
        
        if os.path.exists(xml_file):
            try:
                tree = ET.parse(xml_file)
                root = tree.getroot()
                
                for host in root.findall('host'):
                    for port in host.findall('.//port'):
                        if port.find('state').get('state') == 'open':
                            port_num = port.get('portid')
                            service = port.find('service')
                            service_name = service.get('name') if service is not None else 'unknown'
                            open_ports.append({
                                'port': int(port_num),
                                'service': service_name
                            })
            except Exception as parse_error:
                print(f"Ошибка парсинга XML: {parse_error}")
        
        return {
            "status": "completed" if result.returncode == 0 else "error",
            "open_ports": open_ports,
            "command": ' '.join(cmd),
            "output": result.stdout[:500] if result.stdout else "",
            "error": result.stderr[:500] if result.stderr else ""
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}

def run_httpx_scan(target: str, open_ports: List[Dict]) -> Dict:
    """Этап 3: HTTPx сканирование"""
    try:
        web_services = []
        
        # Проверяем стандартные веб-порты и найденные открытые порты
        ports_to_check = [80, 443, 8080, 8443]
        for port_info in open_ports:
            port = port_info['port']
            if port not in ports_to_check:
                ports_to_check.append(port)
        
        for port in ports_to_check:
            for scheme in ['http', 'https']:
                url = f"{scheme}://{target}:{port}"
                try:
                    cmd = ['httpx', '-u', url, '-silent', '-status-code', '-title', '-timeout', '10']
                    result = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
                    
                    if result.returncode == 0 and result.stdout.strip():
                        web_services.append({
                            'url': url,
                            'status': 'active',
                            'details': result.stdout.strip()
                        })
                        print(f"✅ Найден веб-сервис: {url}")
                except Exception as e:
                    print(f"❌ Ошибка httpx для {url}: {e}")
                    continue
        
        return {
            "status": "completed",
            "web_services": web_services
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}

def run_whatweb_scan(web_services: List[Dict]) -> Dict:
    """Этап 4: WhatWeb сканирование"""
    try:
        technologies = {}
        
        for service in web_services:
            url = service['url']
            try:
                cmd = ['whatweb', '--color=never', '--quiet', '--no-errors', url]
                result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
                
                if result.returncode == 0:
                    technologies[url] = {
                        'status': 'completed',
                        'technologies': result.stdout.strip()
                    }
                    print(f"🔎 WhatWeb для {url}: {result.stdout.strip()[:100]}")
                else:
                    technologies[url] = {'status': 'error', 'error': result.stderr}
            except Exception as e:
                technologies[url] = {'status': 'error', 'error': str(e)}
        
        return {
            "status": "completed",
            "technologies": technologies
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}

def run_nuclei_scan(web_services: List[Dict]) -> Dict:
    """Этап 5: Nuclei сканирование"""
    try:
        vulnerabilities = []
        
        if not web_services:
            return {"status": "completed", "vulnerabilities": []}
        
        # Создаем временный файл со списком URL
        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.txt') as f:
            for service in web_services:
                f.write(service['url'] + '\n')
            targets_file = f.name
        
        try:
            # Упрощенная команда nuclei
            cmd = [
                'nuclei', '-l', targets_file, '-silent', '-jsonl',
                '-severity', 'critical,high,medium',
                '-rate-limit', '10', '-timeout', '5'
            ]
            
            # Проверяем, есть ли шаблоны nuclei
            templates_paths = ['/root/nuclei-templates/', '/usr/share/nuclei-templates/', './nuclei-templates/']
            for templates_path in templates_paths:
                if os.path.exists(templates_path):
                    cmd.extend(['-t', templates_path])
                    break
            
            print(f"💥 Запускаем nuclei: {' '.join(cmd)}")
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
            
            # Парсим JSON результаты
            if result.stdout:
                for line in result.stdout.strip().split('\n'):
                    if line.strip():
                        try:
                            vuln = json.loads(line)
                            vulnerabilities.append({
                                'template_id': vuln.get('template-id', 'unknown'),
                                'info': vuln.get('info', {}),
                                'matched_at': vuln.get('matched-at', ''),
                                'severity': vuln.get('info', {}).get('severity', 'unknown')
                            })
                        except json.JSONDecodeError:
                            continue
        finally:
            try:
                os.unlink(targets_file)
            except:
                pass
        
        return {
            "status": "completed",
            "vulnerabilities": vulnerabilities,
            "command": ' '.join(cmd)
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}

def run_specialized_scans(target: str, whatweb_results: Dict, target_results: Dict):
    """Этап 6: Специализированные сканеры"""
    try:
        # Проверяем, есть ли Bitrix или WordPress
        for url, tech_info in whatweb_results.get("technologies", {}).items():
            tech_output = tech_info.get("technologies", "").lower()
            
            # Bitrix сканирование
            if "bitrix" in tech_output:
                print(f"🟠 Найден Bitrix на {url}, запускаем специализированное сканирование")
                target_results["bitrix_scan"] = run_bitrix_scan(url)
            
            # WordPress сканирование
            if "wordpress" in tech_output or "wp-" in tech_output:
                print(f"🔵 Найден WordPress на {url}, запускаем WPScan")
                target_results["wordpress_scan"] = run_wordpress_scan(url)
                
    except Exception as e:
        print(f"Ошибка специализированного сканирования: {e}")

def run_bitrix_scan(url: str) -> Dict:
    """Bitrix специализированное сканирование"""
    try:
        # Здесь должна быть интеграция с check_bitrix
        return {
            "status": "completed",
            "url": url,
            "scan_type": "bitrix",
            "note": "Bitrix scanner integration needed - добавить check_bitrix"
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}

def run_wordpress_scan(url: str) -> Dict:
    """WordPress сканирование через WPScan"""
    try:
        cmd = [
            'wpscan', '--url', url, '-e', 'vp',
            '--api-token', '7xSvi2jEhfZyHeEnOLXeWxmskjQbwsOCTHXlrzzq6Is',
            '--format', 'json', '--no-banner'
        ]
        
        print(f"🔵 Запускаем WPScan: {' '.join(cmd[:4])}...")
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        
        if result.returncode == 0:
            try:
                wp_results = json.loads(result.stdout)
                return {
                    "status": "completed",
                    "url": url,
                    "scan_type": "wordpress",
                    "results": wp_results
                }
            except json.JSONDecodeError:
                return {
                    "status": "completed",
                    "url": url,
                    "scan_type": "wordpress",
                    "raw_output": result.stdout[:1000]
                }
        else:
            return {"status": "error", "error": result.stderr[:500]}
            
    except Exception as e:
        return {"status": "error", "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

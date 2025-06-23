#!/usr/bin/env python3
"""
AKUMA Enhanced Scanner v5.0 FIXED - Быстрый тест
"""

import asyncio
import json
import logging
import os
import subprocess
import uuid
import xml.etree.ElementTree as ET
from datetime import datetime
from pathlib import Path
import requests
import shutil

class AKUMAEnhancedScannerV5Fixed:
    def __init__(self):
        self.logger = self._setup_logging()
        self.scan_id = str(uuid.uuid4())[:8]
        self.results_dir = Path("/tmp/akuma_results")
        self.results_dir.mkdir(exist_ok=True)
        
        # ИСПРАВЛЕНИЕ: Правильные пути для Grafana
        self.grafana_data_dir = Path("/root/nmap-did-what/data")
        self.grafana_data_dir.mkdir(parents=True, exist_ok=True)
        
        self.tools = {
            'nmap': '/usr/bin/nmap'
        }
        
        self.vulnerabilities = []
        self.scan_stats = {
            'start_time': datetime.now().isoformat(),
            'tools_used': [],
            'grafana_integration': False,
            'webhook_generated': False
        }

    def _setup_logging(self):
        logging.basicConfig(level=logging.INFO, 
                          format='%(asctime)s - %(levelname)s - %(message)s')
        return logging.getLogger('AKUMAScanner_v5_Fixed')

    async def generate_webhook_url(self) -> str:
        """Генерация webhook URL"""
        try:
            self.logger.info("🔗 Генерируем webhook URL...")
            response = requests.post('https://webhook.site/token', timeout=10)
            if response.status_code == 201:
                data = response.json()
                webhook_uuid = data['uuid']
                webhook_url = f"https://webhook.site/{webhook_uuid}"
                self.scan_stats['webhook_generated'] = True
                self.logger.info(f"✅ Webhook создан: {webhook_url}")
                return webhook_url
            else:
                webhook_url = "https://webhook.site/fallback-endpoint"
                self.logger.warning("⚠️ Используем fallback webhook URL")
                return webhook_url
        except Exception as e:
            self.logger.error(f"❌ Ошибка создания webhook: {e}")
            return "https://webhook.site/fallback-endpoint"

    async def scan_target(self, target: str) -> dict:
        """Основная функция сканирования"""
        self.logger.info(f"🚀 Начинаем сканирование цели: {target}")
        
        results = {
            'target': target,
            'scan_id': self.scan_id,
            'start_time': datetime.now().isoformat(),
            'vulnerabilities': [],
            'ports': [],
            'services': [],
            'grafana_integration': False,
            'webhook_info': {}
        }

        try:
            # 1. Генерируем webhook
            webhook_url = await self.generate_webhook_url()
            results['webhook_info'] = {
                'url': webhook_url,
                'generated_at': datetime.now().isoformat()
            }
            
            # 2. Запускаем Nmap сканирование
            self.logger.info("📡 Запускаем Nmap сканирование...")
            nmap_results = await self._run_nmap_scan_fixed(target)
            results['ports'] = nmap_results.get('ports', [])
            results['services'] = nmap_results.get('services', [])
            
            # 3. Интеграция с Grafana
            if await self._integrate_with_grafana_fixed():
                results['grafana_integration'] = True
                self.scan_stats['grafana_integration'] = True
                self.logger.info("📊 Grafana интеграция выполнена успешно")
            
            results['end_time'] = datetime.now().isoformat()
            results['scan_stats'] = self.scan_stats
            
            self.logger.info(f"✅ Сканирование завершено!")
            return results
            
        except Exception as e:
            self.logger.error(f"❌ Ошибка при сканировании: {e}")
            results['error'] = str(e)
            return results

    async def _run_nmap_scan_fixed(self, target: str) -> dict:
        """ИСПРАВЛЕННОЕ Nmap сканирование с правильным сохранением"""
        self.scan_stats['tools_used'].append('nmap')
        
        # ИСПРАВЛЕНИЕ: Правильные пути
        grafana_xml_path = self.grafana_data_dir / "nmap_result.xml"
        local_xml_path = self.results_dir / f"nmap_{self.scan_id}.xml"
        
        # Убеждаемся что директория существует
        self.grafana_data_dir.mkdir(parents=True, exist_ok=True)
        
        # Быстрое сканирование для теста
        nmap_cmd = [
            self.tools['nmap'],
            '-sV', '-Pn', '--top-ports=1000',
            '--max-rate=2000',
            '--host-timeout=300s',
            '-oX', str(grafana_xml_path),  # ИСПРАВЛЕНО: Сохраняем для Grafana
            target
        ]
        
        try:
            self.logger.info(f"⚡ Запускаем Nmap для {target}")
            self.logger.info(f"📄 XML будет сохранен в: {grafana_xml_path}")
            
            process = await asyncio.create_subprocess_exec(
                *nmap_cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await process.communicate()
            
            # Проверяем результат
            if grafana_xml_path.exists():
                file_size = grafana_xml_path.stat().st_size
                self.logger.info(f"📄 Nmap XML создан: {grafana_xml_path} (размер: {file_size} байт)")
                
                if file_size > 0:
                    # Копируем для локального использования
                    shutil.copy2(grafana_xml_path, local_xml_path)
                    return self._parse_nmap_xml(str(local_xml_path))
                else:
                    self.logger.warning("⚠️ Nmap XML файл пустой")
                    return {'ports': [], 'services': []}
            else:
                self.logger.warning("⚠️ Nmap XML файл не создан")
                return {'ports': [], 'services': []}
                
        except Exception as e:
            self.logger.error(f"❌ Ошибка Nmap сканирования: {e}")
            return {'ports': [], 'services': []}

    async def _integrate_with_grafana_fixed(self) -> bool:
        """ИСПРАВЛЕННАЯ интеграция с Grafana"""
        try:
            grafana_xml_path = self.grafana_data_dir / "nmap_result.xml"
            
            self.logger.info(f"🔄 Проверяем файлы для Grafana...")
            self.logger.info(f"📄 XML файл: {grafana_xml_path} (существует: {grafana_xml_path.exists()})")
            
            if not grafana_xml_path.exists():
                self.logger.warning("⚠️ nmap_result.xml не найден для Grafana")
                return False
                
            if grafana_xml_path.stat().st_size == 0:
                self.logger.warning("⚠️ nmap_result.xml пустой")
                return False
            
            # Создаем базовый конвертер
            converter_script = self.grafana_data_dir / "nmap-to-sqlite.py"
            if not converter_script.exists():
                self._create_basic_converter()
            
            # Запускаем конвертер
            self.logger.info("🔄 Конвертируем nmap результаты в SQLite...")
            
            process = await asyncio.create_subprocess_exec(
                'python3', str(converter_script),
                cwd=str(self.grafana_data_dir),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await process.communicate()
            
            if process.returncode == 0:
                self.logger.info("✅ Grafana конвертация выполнена успешно")
                if stdout:
                    self.logger.info(f"Вывод: {stdout.decode()}")
                
                # Проверяем БД
                db_path = self.grafana_data_dir / "nmap_results.db"
                if db_path.exists():
                    db_size = db_path.stat().st_size
                    self.logger.info(f"📊 База данных Grafana: {db_path} (размер: {db_size} байт)")
                    return True
                    
            self.logger.error(f"❌ Ошибка конвертации (код: {process.returncode})")
            if stderr:
                self.logger.error(f"Stderr: {stderr.decode()}")
            return False
                
        except Exception as e:
            self.logger.error(f"❌ Ошибка интеграции с Grafana: {e}")
            return False

    def _create_basic_converter(self):
        """Создает базовый конвертер"""
        converter_content = '''#!/usr/bin/env python3
import sqlite3
import xml.etree.ElementTree as ET
from pathlib import Path

def convert_nmap_to_sqlite():
    xml_file = Path("nmap_result.xml")
    db_file = Path("nmap_results.db")
    
    if not xml_file.exists():
        print("nmap_result.xml не найден")
        return
    
    try:
        conn = sqlite3.connect(str(db_file))
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS scans (
                id INTEGER PRIMARY KEY,
                start_time TEXT,
                command_line TEXT
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS hosts (
                id INTEGER PRIMARY KEY,
                scan_id INTEGER,
                ip TEXT,
                hostname TEXT,
                status TEXT
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS ports (
                id INTEGER PRIMARY KEY,
                host_id INTEGER,
                port INTEGER,
                protocol TEXT,
                state TEXT,
                service TEXT,
                version TEXT
            )
        """)
        
        tree = ET.parse(str(xml_file))
        root = tree.getroot()
        
        cursor.execute("INSERT INTO scans (start_time, command_line) VALUES (?, ?)",
                      (root.get('start'), root.get('args', '')))
        scan_id = cursor.lastrowid
        
        for host in root.findall('host'):
            address = host.find('address')
            if address is not None:
                ip = address.get('addr')
                
                status_elem = host.find('status')
                status = status_elem.get('state') if status_elem is not None else 'unknown'
                
                cursor.execute("INSERT INTO hosts (scan_id, ip, hostname, status) VALUES (?, ?, ?, ?)",
                              (scan_id, ip, '', status))
                host_id = cursor.lastrowid
                
                ports_elem = host.find('ports')
                if ports_elem is not None:
                    for port in ports_elem.findall('port'):
                        port_num = port.get('portid')
                        protocol = port.get('protocol')
                        
                        state_elem = port.find('state')
                        state = state_elem.get('state') if state_elem is not None else 'unknown'
                        
                        service_elem = port.find('service')
                        service_name = ''
                        service_version = ''
                        if service_elem is not None:
                            service_name = service_elem.get('name', '')
                            service_version = service_elem.get('version', '')
                        
                        cursor.execute("""
                            INSERT INTO ports (host_id, port, protocol, state, service, version) 
                            VALUES (?, ?, ?, ?, ?, ?)
                        """, (host_id, int(port_num), protocol, state, service_name, service_version))
        
        conn.commit()
        conn.close()
        print(f"Конвертация завершена: {xml_file} -> {db_file}")
        
    except Exception as e:
        print(f"Ошибка конвертации: {e}")

if __name__ == "__main__":
    convert_nmap_to_sqlite()
'''
        
        converter_path = self.grafana_data_dir / "nmap-to-sqlite.py"
        with open(converter_path, 'w') as f:
            f.write(converter_content)
        os.chmod(converter_path, 0o755)
        self.logger.info("✅ Создан базовый nmap-to-sqlite.py")

    def _parse_nmap_xml(self, xml_file: str) -> dict:
        """Парсинг XML результатов Nmap"""
        try:
            tree = ET.parse(xml_file)
            root = tree.getroot()
            
            ports = []
            services = []
            
            for host in root.findall('host'):
                for port_elem in host.findall('.//port'):
                    port_num = port_elem.get('portid')
                    protocol = port_elem.get('protocol')
                    
                    state_elem = port_elem.find('state')
                    state = state_elem.get('state') if state_elem is not None else 'unknown'
                    
                    service_elem = port_elem.find('service')
                    if service_elem is not None:
                        service_name = service_elem.get('name', 'unknown')
                        service_version = service_elem.get('version', '')
                        service_product = service_elem.get('product', '')
                        
                        port_info = {
                            'port': int(port_num),
                            'protocol': protocol,
                            'state': state,
                            'service': service_name,
                            'version': service_version,
                            'product': service_product
                        }
                        ports.append(port_info)
                        
                        if service_name != 'unknown':
                            services.append({
                                'port': int(port_num),
                                'service': service_name,
                                'version': f"{service_product} {service_version}".strip()
                            })
            
            self.logger.info(f"📊 Найдено портов: {len(ports)}, сервисов: {len(services)}")
            return {'ports': ports, 'services': services}
            
        except Exception as e:
            self.logger.error(f"❌ Ошибка парсинга XML: {e}")
            return {'ports': [], 'services': []}

    def save_results(self, results: dict) -> str:
        """Сохранение результатов"""
        results_file = f"{self.results_dir}/scan_results_{self.scan_id}.json"
        with open(results_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        self.logger.info(f"📄 Результаты сохранены в {results_file}")
        return results_file

async def main():
    if len(os.sys.argv) < 2:
        print("Использование: python3 enhanced_scanner_v5_fixed.py <target>")
        return
        
    target = os.sys.argv[1]
    scanner = AKUMAEnhancedScannerV5Fixed()
    
    print(f"🔥 AKUMA Enhanced Scanner v5.0 FIXED")
    print(f"🎯 Цель: {target}")
    print(f"📅 Время запуска: {datetime.now()}")
    print("=" * 60)
    
    results = await scanner.scan_target(target)
    results_file = scanner.save_results(results)
    
    print("=" * 60)
    print(f"✅ Сканирование завершено!")
    print(f"📊 Найдено портов: {len(results['ports'])}")
    print(f"🔗 Webhook URL: {results['webhook_info']['url']}")
    print(f"📊 Grafana интеграция: {'✅' if results['grafana_integration'] else '❌'}")
    print(f"📁 Результаты: {results_file}")

if __name__ == "__main__":
    asyncio.run(main())

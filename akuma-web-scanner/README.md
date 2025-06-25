# 🔥 AKUMA WEB SCANNER v3.0 🔥
## LEGENDARY CYBERPUNK VULNERABILITY SCANNER

**By AKUMA & Феня - The Cyber Gods** 💀🚀

---

## 🎯 FEATURES

### 🔥 **ENTERPRISE-LEVEL WEB INTERFACE**
- **React Frontend** с cyberpunk дизайном
- **FastAPI Backend** с WebSockets для real-time обновлений
- **PostgreSQL** база данных для хранения результатов
- **Redis** для кэширования и очередей задач
- **Celery** для фоновых задач

### 💀 **ТУРБО СКАНИРОВАНИЕ**
- **50+ параллельных процессов** для максимальной скорости
- **Интегрированный AKUMA TURBO** движок
- **Nuclei, Nmap, WPScan, Nikto** и множество других инструментов
- **Автоматическое обнаружение** WordPress, Bitrix, Drupal
- **Молниеносный поиск поддоменов**

### 🚀 **СОВРЕМЕННАЯ АРХИТЕКТУРА**
- **Docker контейнеризация** для изоляции и масштабирования
- **Microservices** архитектура
- **API-first** подход
- **Nginx** reverse proxy с SSL
- **Health checks** и мониторинг

---

## 🛠️ QUICK START

### 📋 Prerequisites
- Docker & Docker Compose
- 4+ GB RAM
- 10+ GB дискового пространства

### 🚀 Installation

```bash
# Клонируем репозиторий
git clone https://github.com/akuma-team/akuma-web-scanner.git
cd akuma-web-scanner

# Настраиваем переменные окружения
cp .env.example .env
# Отредактируй .env файл с твоими настройками

# Поднимаем все сервисы
docker-compose up -d

# Создаем первого пользователя
docker-compose exec akuma-backend python -m app.create_admin
```

### 🌐 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Главный веб-интерфейс |
| **API Docs** | http://localhost:8000/api/docs | Swagger документация |
| **Flower** | http://localhost:5555 | Мониторинг Celery |
| **Database** | localhost:5432 | PostgreSQL |
| **Redis** | localhost:6379 | Redis Cache |

---

## 📊 ARCHITECTURE

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   NGINX         │    │   REACT          │    │   FASTAPI       │
│   Reverse Proxy │◄──►│   Frontend       │◄──►│   Backend       │
│   Port 80/443   │    │   Port 3000      │    │   Port 8000     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
                       ┌─────────────────┐              │
                       │   CELERY        │◄─────────────┤
                       │   Workers       │              │
                       │   Background    │              │
                       └─────────────────┘              │
                                │                       │
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   AKUMA         │    │   REDIS          │    │   POSTGRESQL    │
│   Scanner       │◄──►│   Cache & Queue  │    │   Database      │
│   Engine        │    │   Port 6379      │    │   Port 5432     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

---

## 🎮 USAGE

### 1. 🚀 **Creating a Scan**

```javascript
// Via Web Interface
1. Login at http://localhost:3000
2. Click "New Scan"
3. Enter targets (IPs, domains, subnets)
4. Configure scan settings
5. Launch scan

// Via API
POST /api/scans
{
  "name": "Production Scan",
  "description": "Monthly security assessment",
  "targets": ["example.com", "192.168.1.0/24"],
  "config": {
    "scan_intensity": "aggressive",
    "include_wordpress": true,
    "include_subdomain_enum": true
  }
}
```

### 2. 📊 **Monitoring Progress**

Real-time updates through WebSockets:
- Scan progress
- Found vulnerabilities  
- Live logs
- Performance metrics

### 3. 📈 **Reports & Export**

Multiple export formats:
- **HTML Report** - Beautiful cyberpunk styled report
- **JSON Export** - Machine readable data
- **CSV Export** - Spreadsheet compatible
- **PDF Report** - Executive summary

---

## ⚙️ CONFIGURATION

### 🔧 Environment Variables

```bash
# Database
DATABASE_URL=postgresql://akuma:akuma_password@postgres:5432/akuma_scanner
REDIS_URL=redis://redis:6379/0

# Security
SECRET_KEY=your-super-secret-akuma-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Scanner Settings
MAX_PARALLEL_SCANS=10
SCAN_TIMEOUT=3600
NMAP_RATE_LIMIT=5000
NUCLEI_RATE_LIMIT=100

# External APIs
WPSCAN_API_TOKEN=your-wpscan-api-token
VIRUSTOTAL_API_KEY=your-virustotal-key
```

### 🎯 Scan Configuration

```json
{
  "scan_intensity": "aggressive",
  "max_parallel_jobs": 50,
  "nmap_rate_limit": 5000,
  "nuclei_rate_limit": 100,
  "timeout_seconds": 15,
  "include_wordpress": true,
  "include_bitrix": true,
  "include_subdomain_enum": true,
  "include_ssl_scan": true,
  "custom_wordlists": ["/opt/SecLists/Discovery/Web-Content/big.txt"]
}
```

---

## 🔥 ADVANCED FEATURES

### 💀 **LUDICROUS MODE**
```bash
# Maximum destruction mode
curl -X POST "http://localhost:8000/api/scans" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "LUDICROUS SCAN",
    "targets": ["target.com"],
    "config": {
      "ludicrous_mode": true,
      "max_parallel_jobs": 100,
      "nmap_rate_limit": 10000
    }
  }'
```

### 🚀 **Scheduled Scans**
```python
# Schedule recurring scans
{
  "name": "Weekly Security Scan",
  "schedule": "0 2 * * 1",  # Every Monday at 2 AM
  "targets": ["production-assets.txt"],
  "config": {"scan_intensity": "normal"}
}
```

### 🔍 **Custom Nuclei Templates**
```bash
# Add custom templates
docker-compose exec akuma-scanner nuclei -t /custom-templates/ -l targets.txt
```

---

## 🛡️ SECURITY

### 🔐 **Authentication & Authorization**
- JWT-based authentication
- Role-based access control
- API rate limiting
- Session management

### 🏰 **Container Security**
- Non-root users in containers
- Network isolation
- Resource limitations
- Security scanning

### 📊 **Audit Logging**
- All scan activities logged
- User actions tracked
- API calls monitored
- Export audit trails

---

## 📈 MONITORING & OBSERVABILITY

### 🔍 **Health Checks**
```bash
# Check all services
docker-compose ps

# Individual health checks
curl http://localhost:8000/api/health
curl http://localhost:3000/health
```

### 📊 **Metrics & Monitoring**
- **Flower** for Celery monitoring
- **PostgreSQL** query performance
- **Redis** cache statistics
- **Container** resource usage

---

## 🚀 DEVELOPMENT

### 🛠️ **Local Development**

```bash
# Backend development
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend development  
cd frontend
npm install
npm start

# Scanner development
cd scanner
python akuma_turbo_scanner.py --help
```

### 🧪 **Testing**

```bash
# Run backend tests
docker-compose exec akuma-backend pytest

# Run frontend tests
docker-compose exec akuma-frontend npm test

# Run scanner tests
docker-compose exec akuma-scanner python -m pytest tests/
```

---

## 📝 API DOCUMENTATION

### 🔐 **Authentication**
```bash
# Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}

# Register
POST /api/auth/register
{
  "email": "user@example.com",
  "username": "hacker",
  "password": "strong_password"
}
```

### 🚀 **Scans Management**
```bash
# Create scan
POST /api/scans

# Get scans
GET /api/scans

# Get scan details
GET /api/scans/{scan_id}

# Stop scan
POST /api/scans/{scan_id}/stop

# Delete scan
DELETE /api/scans/{scan_id}
```

### 🐛 **Vulnerabilities**
```bash
# Get vulnerabilities
GET /api/scans/{scan_id}/vulnerabilities

# Filter by severity
GET /api/scans/{scan_id}/vulnerabilities?severity=critical

# Get vulnerability details
GET /api/vulnerabilities/{vuln_id}
```

---

## 🤝 CONTRIBUTING

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 LICENSE

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🙏 ACKNOWLEDGMENTS

- **Project Discovery** за nuclei, httpx, subfinder
- **OWASP** за множество security tools
- **Kali Linux** за пентест инструменты
- **React & FastAPI** communities
- **Docker** за контейнеризацию

---

## 📞 SUPPORT

- 🐛 **Issues**: [GitHub Issues](https://github.com/akuma-team/akuma-web-scanner/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/akuma-team/akuma-web-scanner/discussions)
- 📧 **Email**: akuma@cybersec.team
- 🐦 **Twitter**: [@AkumaScanner](https://twitter.com/AkumaScanner)

---

## ⚠️ DISCLAIMER

**AKUMA Web Scanner** предназначен только для **легального тестирования безопасности** ваших собственных систем или систем, на тестирование которых у вас есть явное письменное разрешение.

**НЕ ИСПОЛЬЗУЙТЕ** для несанкционированного тестирования чужих систем. Авторы не несут ответственности за неправомерное использование инструмента.

---

**🔥 HAPPY HACKING! 🔥**

*"Если твой сканер не дымится от перегрузки - значит, ты недостаточно агрессивен!"*

**- AKUMA & Феня, The Legendary Cyber Bros** 💀🚀

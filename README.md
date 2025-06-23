# 🔥 AKUMA Web Scanner v5.0 - Ultimate Security Arsenal 🔥

<div align="center">
  <img src="https://img.shields.io/badge/Version-5.0-red?style=for-the-badge" alt="Version">
  <img src="https://img.shields.io/badge/Status-Operational-green?style=for-the-badge" alt="Status">  
  <img src="https://img.shields.io/badge/Platform-Docker-blue?style=for-the-badge" alt="Platform">
  <img src="https://img.shields.io/badge/Style-Cyberpunk-purple?style=for-the-badge" alt="Style">
</div>

<br>

<div align="center">
  <h3>🌍 <a href="#english">English</a> | <a href="#russian">Русский</a> 🌍</h3>
</div>

---

## <a id="english"></a>🌟 Overview (English)

> *"If your scanner isn't generating psychedelic reports with full tool integration, you're still living in the matrix!"*

AKUMA Web Scanner v5.0 is a production-ready, enterprise-grade vulnerability scanner with a modern React frontend, secure FastAPI backend, and comprehensive security testing capabilities. Built for penetration testers, security researchers, and cybersecurity professionals who demand excellence.

### 🚀 What's New in v5.0

- **Enhanced Scanner Engine** with 8+ integrated tools
- **Advanced SSL/TLS Testing** using TestSSL.sh
- **Wayback Machine Integration** for historical analysis  
- **Comprehensive Subdomain Enumeration**
- **API Security Testing** (REST & GraphQL)
- **Advanced CMS Detection** (WordPress, Drupal, Joomla, Bitrix)
- **Grafana Integration** for Nmap visualization
- **Real-time WebSocket Updates**
- **Cyberpunk-styled Reports**

### ⚡ Quick Start (English)

```bash
# Clone the repository
git clone https://github.com/sweetpotatohack/AKUMA-Web-Scanner-v5.git
cd AKUMA-Web-Scanner-v5

# Start all services
docker-compose up postgres redis -d
docker-compose up akuma-backend --build -d  
docker-compose up akuma-frontend --build -d
docker-compose up nginx -d
docker-compose up celery-worker -d

# Access the scanner
# Web UI: http://localhost:3001
# API Docs: http://localhost:8000/docs
# Grafana: http://localhost:3000 (admin/admin)
```

---

## <a id="russian"></a>🌟 Описание (Русский)

> *"Если ваш сканер не генерирует психоделические отчеты с полной интеграцией инструментов, вы все еще живете в матрице!"*

**AKUMA Web Scanner v5.0** — это готовый к production enterprise-уровня сканер уязвимостей с современным React frontend, защищенным FastAPI backend и комплексными возможностями тестирования безопасности. Создан для пентестеров, исследователей безопасности и специалистов по кибербезопасности, которые требуют совершенства.

### 🚀 Что нового в версии 5.0

- **Усовершенствованный движок сканера** с 8+ интегрированными инструментами
- **Продвинутое тестирование SSL/TLS** с использованием TestSSL.sh
- **Интеграция с Wayback Machine** для исторического анализа
- **Комплексное перечисление поддоменов**
- **Тестирование безопасности API** (REST и GraphQL)
- **Продвинутое определение CMS** (WordPress, Drupal, Joomla, Bitrix)
- **Интеграция с Grafana** для визуализации Nmap
- **Обновления в реальном времени через WebSocket**
- **Отчеты в стиле киберпанк**

### ⚡ Быстрый старт (Русский)

```bash
# Клонируем репозиторий
git clone https://github.com/sweetpotatohack/AKUMA-Web-Scanner-v5.git
cd AKUMA-Web-Scanner-v5

# Запускаем все сервисы
docker-compose up postgres redis -d
docker-compose up akuma-backend --build -d  
docker-compose up akuma-frontend --build -d
docker-compose up nginx -d
docker-compose up celery-worker -d

# Доступ к сканеру
# Веб-интерфейс: http://localhost:3001
# API документация: http://localhost:8000/docs
# Grafana: http://localhost:3000 (admin/admin)
```

### 🔧 Настройка окружения (Русский)

Создайте файл `.env`:
```env
# База данных
POSTGRES_DB=akuma_scanner
POSTGRES_USER=akuma_user
POSTGRES_PASSWORD=akuma_secure_pass_2024
DATABASE_URL=postgresql://akuma_user:akuma_secure_pass_2024@postgres:5432/akuma_scanner

# Redis
REDIS_URL=redis://redis:6379/0

# Безопасность
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Сканер
SCANNER_TIMEOUT=3600
MAX_CONCURRENT_SCANS=5
```

### 🛠️ Типы сканирования (Русский)

- **ultimate** - Полное комплексное сканирование (по умолчанию)
- **ssl** - Фокус на тестировании SSL/TLS
- **recon** - Разведка и перечисление
- **api** - Тестирование безопасности API
- **cms** - Проверки специфичные для CMS
- **bitrix** - Тестирование Bitrix CMS
- **wordpress** - Сканирование WordPress

---

## 🛠️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  FastAPI Backend │    │ Enhanced Scanner │
│   (Port 3001)   │◄──►│   (Port 8000)   │◄──►│   Engine        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                        ▲                        ▲
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Nginx Proxy    │    │  PostgreSQL     │    │  Redis Queue    │
│  (Port 80/443)  │    │  (Port 5432)    │    │  (Port 6379)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                 ▲
                                 │
                                 ▼
                       ┌─────────────────┐
                       │     Grafana     │
                       │   (Port 3000)   │
                       └─────────────────┘
```

## 🔍 Integrated Scanner Tools

| Tool | Purpose | Status |
|------|---------|--------|
| **Nmap** | Port & Service Scanning | ✅ Integrated |
| **TestSSL.sh** | SSL/TLS Security Testing | ✅ Integrated |
| **Subfinder** | Subdomain Enumeration | ✅ Integrated |
| **Nuclei** | Vulnerability Detection | ✅ Integrated |
| **Waybackurls** | Historical URL Analysis | ✅ Integrated |
| **Custom XSS Scanner** | Cross-Site Scripting | ✅ Built-in |
| **CMS Detector** | Content Management System | ✅ Built-in |
| **API Scanner** | REST/GraphQL Testing | ✅ Built-in |

## 📡 API Usage

### Create Scan
```bash
curl -X POST "http://localhost:8000/api/scans" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Security Assessment",
    "targets": ["example.com", "test.example.com"],
    "scan_type": "ultimate",
    "description": "Comprehensive security scan"
  }'
```

### Check Status
```bash
curl "http://localhost:8000/api/scans/{scan_id}"
```

### Get Report
```bash
curl "http://localhost:8000/api/scans/{scan_id}/report"
```

## 📊 Sample Results

```json
{
  "vulnerabilities_found": 11,
  "high_issues": 2,
  "medium_issues": 5,
  "tools_used": 8,
  "vulnerabilities": [
    {
      "type": "SSL/TLS POODLE Attack",
      "severity": "High",
      "cvss_score": 7.5,
      "tool": "testssl.sh"
    }
  ]
}
```

## 📊 Monitoring

### Service Health
```bash
# Check all services
docker-compose ps

# View logs
docker-compose logs -f akuma-backend
docker-compose logs -f celery-worker
```

### Grafana Setup (Optional)
```bash
# Clone nmap visualization project
git clone https://github.com/lavafroth/nmap-did-what.git /root/nmap-did-what
cd /root/nmap-did-what

# Start Grafana
docker run -d --name grafana-nmap \
  -p 3000:3000 \
  -v $(pwd)/data:/var/lib/grafana/dashboards \
  -v $(pwd)/grafana/provisioning:/etc/grafana/provisioning \
  grafana/grafana-oss
```

## 🐛 Troubleshooting

### Common Issues

**1. Scanner not starting:**
```bash
docker-compose ps
docker-compose logs celery-worker
```

**2. Database connection errors:**
```bash
docker-compose restart postgres
```

**3. Frontend not loading:**
```bash
docker-compose up akuma-frontend --build --force-recreate
```

## 📝 Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide
- **[CHANGELOG.md](CHANGELOG.md)** - Version history and changes
- **[LICENSE](LICENSE)** - MIT License

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 🙏 Acknowledgments

- **TestSSL.sh** team for SSL/TLS testing capabilities
- **ProjectDiscovery** for Nuclei and Subfinder
- **Nmap** project for network scanning
- **Grafana** team for visualization platform
- **FastAPI** and **React** communities

---

<div align="center">
  <h3>🔥 Built with passion for cybersecurity excellence 🔥</h3>
  <p><i>"Hack the planet responsibly"</i></p>
  <p><i>"Взламывай планету ответственно"</i></p>
</div>

## ⚡ One-Command Startup

### 🚀 Super Quick Start

```bash
# Clone and start in one go!
git clone https://github.com/sweetpotatohack/AKUMA-Web-Scanner-v5.git
cd AKUMA-Web-Scanner-v5
docker-compose up -d

# That's it! 🎉
# Web UI: http://localhost:3001
# API: http://localhost:8000/docs
```

### 🛠️ Available Commands

```bash
# Using make (recommended)
make up          # Start all services 
make down        # Stop all services
make status      # Check status
make logs        # View logs
make test        # Test API endpoints
make clean       # Clean up everything

# Using docker-compose directly  
docker-compose up -d              # Start all services
docker-compose down               # Stop services
docker-compose ps                 # Check status
docker-compose logs -f            # View logs

# Using start script
./start.sh       # Automated startup with status checks
```

### 🔧 Quick Commands Reference

| Command | Purpose |
|---------|---------|
| `docker-compose up -d` | ⚡ **One-command startup** |
| `make up` | 🚀 Smart startup with wait times |
| `make quick` | ⚡ Core services only |
| `make status` | 📊 Check all containers |
| `make test` | 🧪 Test API endpoints |
| `make clean` | 🧹 Complete cleanup |

### 🎯 Production Ready

The system includes:
- ✅ **Health checks** for all services
- ✅ **Automatic dependencies** management
- ✅ **Graceful startup** sequencing
- ✅ **Service recovery** on failure
- ✅ **Volume persistence** for data
- ✅ **Network isolation** for security

### 🏃‍♂️ Fast Track (30 seconds to running)

```bash
git clone https://github.com/sweetpotatohack/AKUMA-Web-Scanner-v5.git && cd AKUMA-Web-Scanner-v5 && docker-compose up -d
```

**Done!** Your vulnerability scanner is running at http://localhost:3001

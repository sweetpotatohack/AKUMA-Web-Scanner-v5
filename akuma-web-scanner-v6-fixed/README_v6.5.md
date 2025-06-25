# 🚀 AKUMA Web Scanner v6.5 - Ultimate Security Arsenal

<div align="center">
  <img src="https://img.shields.io/badge/Version-6.5-red?style=for-the-badge&logo=skull&logoColor=white" alt="Version">
  <img src="https://img.shields.io/badge/Status-Ready_to_Hack-brightgreen?style=for-the-badge&logo=target&logoColor=white" alt="Status">
  <img src="https://img.shields.io/badge/Notifications-Telegram_&_Email-blue?style=for-the-badge&logo=telegram&logoColor=white" alt="Notifications">
</div>

## 🎯 What's New in v6.5

### 🔔 Real-Time Notifications
- **📱 Telegram Integration**: Get instant alerts on your phone
- **📧 Email Notifications**: Detailed reports in your inbox  
- **🚨 Critical Alerts**: Immediate warnings for high-risk vulnerabilities
- **📊 Scan Progress**: Real-time updates on scan completion

### 🔐 Enhanced Security Features
- **🛡️ Unified Authentication**: Seamless login across all services
- **🔑 API Key Management**: Secure access control
- **📋 Audit Logging**: Track all security events
- **⚡ Rate Limiting**: Prevent abuse and overload

### 📈 Advanced Visualization
- **🎨 Interactive Dashboards**: Real-time metrics and charts
- **🗺️ Network Mapping**: Visual representation of scan targets
- **📊 Executive Reports**: PDF/HTML summaries for management
- **🔍 Vulnerability Analysis**: Detailed breakdowns by severity

## 🚀 Quick Start

### 1. Clone and Setup
```bash
git clone https://github.com/sweetpotatohack/AKUMA_Web_Scaner.git
cd AKUMA_Web_Scaner/akuma-web-scanner-v6-fixed
```

### 2. Configure Notifications (Optional)
```bash
# Copy the environment template
cp .env.template .env

# Edit with your credentials
nano .env
```

### 3. Launch AKUMA
```bash
# Start all services
docker-compose up -d --build

# Check service status
docker-compose ps
```

### 4. Access Interfaces
- **🌐 Web Interface**: http://localhost:3001
- **📊 Grafana Dashboard**: http://localhost:3000 (admin/akuma2024)
- **🔧 API Documentation**: http://localhost:8000/docs
- **📈 Prometheus Metrics**: http://localhost:9090

## 🔔 Setting Up Notifications

### 📱 Telegram Setup
1. **Create a Bot**:
   - Message @BotFather on Telegram
   - Send: `/newbot`
   - Follow instructions and save your bot token

2. **Get Your Chat ID**:
   - Message @userinfobot
   - Save the Chat ID number

3. **Configure in AKUMA**:
   - Go to 🔔 Notifications tab
   - Enable Telegram notifications
   - Enter your Chat ID
   - Test with the "🧪 Test Notifications" button

### 📧 Email Setup (Gmail Example)
1. **Enable 2-Factor Authentication** on your Google account
2. **Generate App Password**:
   - Visit: https://myaccount.google.com/apppasswords
   - Create a new app password
3. **Configure in .env file**:
   ```bash
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-16-char-app-password
   ```
4. **Test in Web Interface**

## 🎯 Core Features

### 🔍 Scanning Capabilities
- **Nmap**: Network discovery and port scanning
- **Nuclei**: 4000+ vulnerability templates
- **Subdomain Enumeration**: Find hidden attack surfaces
- **Directory Fuzzing**: Discover hidden paths and files
- **SSL/TLS Analysis**: Security certificate validation
- **CMS Detection**: WordPress, Drupal, Joomla identification

### 📊 Monitoring & Analytics
- **Real-time Progress**: Live scan status updates
- **Vulnerability Dashboard**: Severity-based categorization
- **Historical Data**: Track security improvements over time
- **Export Options**: JSON, CSV, PDF reports

### 🛡️ Security & Compliance
- **Role-Based Access**: Multi-user support
- **Secure Storage**: Encrypted vulnerability data
- **Audit Trails**: Complete activity logging
- **API Security**: Rate limiting and authentication

## 🔧 Advanced Configuration

### 🎛️ Environment Variables
```bash
# Notification Settings
TELEGRAM_BOT_TOKEN=your_bot_token
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASSWORD=your-app-password

# Database Settings
DATABASE_URL=postgresql://user:pass@localhost:5432/akuma
REDIS_URL=redis://localhost:6379/0

# Security Settings  
JWT_SECRET=your-secret-key
API_RATE_LIMIT=100
```

### 🐳 Docker Customization
```yaml
# Add custom volumes for persistent data
volumes:
  - ./custom-configs:/app/configs
  - ./scan-results:/app/results
  
# Scale scanner workers
scanner:
  deploy:
    replicas: 3
```

## 🔥 Powerful Scanning Examples

### 🎯 Ultimate Scan
```bash
# Via Web Interface
Scan Type: Ultimate
Targets: 
- https://target.com
- 192.168.1.0/24
- subdomain.target.com

Modules: All (Nmap, Nuclei, Subdomain, Directory Fuzzing)
```

### ⚡ Quick Assessment
```bash
# API Call
curl -X POST http://localhost:8000/api/scans \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Quick Security Check",
    "targets": ["https://example.com"],
    "scan_type": "quick"
  }'
```

### 🔍 Deep Dive Analysis
```bash
# Custom Scan Configuration
{
  "name": "Deep Security Audit",
  "targets": ["target.com"],
  "scan_type": "deep",
  "scan_options": {
    "modules": ["nmap", "nuclei", "subdomain_enum"],
    "nmap_args": "-sS -sV -O --script vuln",
    "nuclei_templates": "cves,exposures,misconfigurations"
  }
}
```

## 📱 Notification Examples

### 🚀 Scan Started
```
🚀 AKUMA Scan Started

Scan ID: abc123
Name: Production Security Check  
Targets:
• https://api.company.com
• https://app.company.com

Started: 2024-06-24 15:30:45

I'll notify you when the scan completes! 🔥
```

### ✅ Scan Completed
```
✅ AKUMA Scan Completed

Scan ID: abc123
Name: Production Security Check

📊 Vulnerabilities Found:
🔴 Critical: 2
🟠 High: 5
🟡 Medium: 12
🟢 Low: 8

🚨 URGENT: Critical vulnerabilities detected!
```

### 🚨 Critical Alert
```
🚨 CRITICAL VULNERABILITY DETECTED

Scan ID: abc123
Title: SQL Injection in Login Form
CVSS Score: 9.8
Tool: Nuclei

Description:
Unauthenticated SQL injection vulnerability
allows remote code execution.

⚡ Immediate action required!
```

## 🎨 Dashboard Features

### 📊 Main Dashboard
- **📈 Real-time Statistics**: Live scan metrics
- **🎯 Quick Actions**: One-click scan creation
- **🔔 Alert Summary**: Critical issues at a glance
- **📋 Recent Activity**: Latest scans and findings

### 🔍 Scan Management
- **📝 Scan History**: Complete audit trail
- **🎛️ Configuration**: Custom scan parameters
- **📊 Progress Tracking**: Real-time status updates
- **🗑️ Cleanup Tools**: Bulk scan management

### 🛡️ Vulnerability Analysis
- **🚨 Severity Breakdown**: Critical, High, Medium, Low
- **🔧 Tool Attribution**: Which scanner found what
- **📈 Trend Analysis**: Security posture over time
- **📋 Detailed Reports**: Full vulnerability descriptions

## 🔧 Troubleshooting

### 🚫 Common Issues

**❌ Notifications not working**
```bash
# Check environment variables
docker exec akuma-backend-v6 env | grep TELEGRAM
docker exec akuma-backend-v6 env | grep SMTP

# Test configuration
curl http://localhost:8000/api/notifications/test
```

**❌ Scans stuck at 99%**
```bash
# Restart scanner service
docker-compose restart scanner

# Check scanner logs
docker logs akuma-scanner-v6
```

**❌ Grafana login issues**
```bash
# Default credentials
Username: admin
Password: akuma2024

# Reset Grafana data
docker volume rm akuma-web-scanner-v6-fixed_grafana_data
docker-compose up -d grafana
```

### 📋 Health Checks
```bash
# Check all services
docker-compose ps

# Individual service health
curl http://localhost:8000/api/health
curl http://localhost:3001/
curl http://localhost:3000/api/health
```

## 🤝 Contributing

### 🎯 Development Setup
```bash
# Clone repository
git clone https://github.com/sweetpotatohack/AKUMA_Web_Scaner.git

# Development mode
docker-compose -f docker-compose.dev.yml up

# Run tests
docker exec akuma-backend-v6 python -m pytest
```

### 🔧 Adding Features
1. **🔌 New Scanners**: Add to `scanner/modules/`
2. **📊 Custom Dashboards**: Edit Grafana configurations
3. **🔔 Notification Channels**: Extend `notifications.py`
4. **🎨 UI Components**: Modify React frontend

## 📜 License & Legal

⚠️ **Important**: This tool is for authorized security testing only. Always obtain proper permission before scanning any systems you don't own.

- **License**: MIT License
- **Purpose**: Educational and authorized penetration testing
- **Disclaimer**: Users are responsible for complying with all applicable laws

## 🎉 Acknowledgments

- **Nuclei Team**: Amazing vulnerability scanner
- **Nmap Project**: Network discovery foundation  
- **Grafana**: Visualization excellence
- **Security Community**: Continuous inspiration

---

<div align="center">
  <strong>💀 Ready to hack the planet? Let AKUMA be your digital weapon! 🚀</strong>
  
  <br><br>
  
  Made with ❤️ by the cybersecurity community
  
  <br>
  
  ⭐ Star this project if it helped secure your infrastructure!
</div>

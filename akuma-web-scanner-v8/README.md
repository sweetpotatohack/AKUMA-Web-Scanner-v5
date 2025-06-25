# 🔥 AKUMA Web Scanner v8.0 - ULTIMATE EDITION 🔥

**Professional Vulnerability Scanner & Security Assessment Tool**

![AKUMA Banner](https://img.shields.io/badge/AKUMA-v8.0-red?style=for-the-badge&logo=skull) 
![Docker](https://img.shields.io/badge/Docker-Supported-blue?style=for-the-badge&logo=docker)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## 🚀 What's New in v8.0

### 💥 Complete 6-Stage Scanning Pipeline
1. **Ping Discovery** - Identify live targets
2. **Full Nmap Scan** - `nmap -sV -Pn -p- --open --min-rate=5000 --script=http-title,ssl-cert`
3. **HTTPx Web Discovery** - Find web services on all open ports
4. **WhatWeb Technology Detection** - Identify CMSs, frameworks, and technologies
5. **Nuclei Vulnerability Scanning** - Comprehensive vulnerability assessment
6. **Specialized Scanners** - Bitrix and WordPress specific scanning

### 🎯 Advanced Target Management
- **Single Target Input** - Quick single host scanning
- **File Upload Support** - Bulk target scanning from files
- **Smart Comments Filtering** - Automatically filters comments and empty lines

### 🔧 Enhanced Backend Features
- **Real-time Progress Tracking** - Live scan status updates
- **Modular Scanning** - Choose which scan modules to run
- **Advanced Result Storage** - Structured JSON output with detailed results
- **Error Handling** - Robust error management and reporting

### 🌐 Professional Web Interface
- **Modern Dark Theme** - Professional cybersec aesthetic
- **Live Statistics Dashboard** - Real-time scan metrics
- **Interactive Results Viewer** - Detailed vulnerability analysis
- **Responsive Design** - Works on all devices

## 🛠️ Quick Start

### Prerequisites
- Docker & Docker Compose
- 4GB+ RAM recommended
- Linux/macOS/Windows with WSL2

### Installation & Launch
```bash
git clone https://github.com/sweetpotatohack/AKUMA-Web-Scanner-v.git
cd AKUMA-Web-Scanner-v/akuma-web-scanner-v8
docker-compose up -d
```

### Access URLs
- **Main Interface**: http://localhost:3001
- **API Documentation**: http://localhost:8000/docs
- **Grafana Dashboard**: http://localhost:3000 (admin/admin)

## 📊 Scanning Modules

### Core Modules
- **🔍 Nmap** - Advanced port scanning with service detection
- **🌐 HTTPx** - HTTP service discovery and enumeration
- **🔎 WhatWeb** - Web technology fingerprinting
- **💥 Nuclei** - Vulnerability scanning with 5000+ templates

### Specialized Modules
- **🟠 Bitrix Scanner** - Specialized Bitrix CMS vulnerability detection
- **🔵 WordPress Scanner** - WPScan integration with API key support
- **🔒 SSL/TLS Analysis** - Certificate and configuration analysis

## 🎯 Usage Examples

### Single Target Scan
1. Navigate to "Create Scan" tab
2. Enter target (e.g., `example.com`)
3. Select desired modules
4. Click "Start Scan"

### Bulk Target Scanning
1. Create a text file with targets (one per line):
```
example.com
test.example.org
192.168.1.100
# This is a comment - will be ignored
```
2. Use "Upload Target File" option
3. Select modules and start scan

### API Usage
```bash
# Create scan via API
curl -X POST "http://localhost:8000/scans" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Security Scan",
    "targets": ["example.com"],
    "modules": ["nmap", "httpx", "whatweb", "nuclei"]
  }'

# Check scan status
curl "http://localhost:8000/scans/{scan_id}"

# Upload targets from file
curl -X POST "http://localhost:8000/upload-targets" \
  -F "file=@targets.txt"
```

## 🔧 Configuration

### Environment Variables
```bash
# Database Configuration
POSTGRES_DB=akuma_db
POSTGRES_USER=akuma
POSTGRES_PASSWORD=akuma_password

# API Configuration
JWT_SECRET=your_secret_key

# WordPress Scanner API
WP_API_TOKEN=your_wpscan_api_token
```

### Scanner Configuration
- **Nmap**: Configured for comprehensive scanning with reasonable timeouts
- **Nuclei**: Uses latest community templates, automatically updated
- **HTTPx**: Optimized for speed with 10-second timeouts
- **WhatWeb**: Silent mode with error suppression

## 📁 Project Structure
```
akuma-web-scanner-v8/
├── backend/           # FastAPI backend
├── frontend/          # React.js web interface
├── scanner/           # Core scanning engine
├── monitoring/        # Prometheus & Grafana
├── nginx/            # Reverse proxy configuration
└── docker-compose.yml # Container orchestration
```

## 🛡️ Security Features

### Input Validation
- Target format validation (IP, domain, CIDR)
- File upload size limits and type checking
- SQL injection protection
- XSS prevention

### Scan Safety
- Rate limiting to prevent DoS
- Timeout controls for hanging scans
- Resource usage monitoring
- Network isolation options

## 🔍 Supported Target Formats
- **Domains**: `example.com`, `sub.example.com`
- **IP Addresses**: `192.168.1.1`
- **CIDR Ranges**: `192.168.1.0/24`
- **URLs**: `https://example.com:8443`

## 📈 Monitoring & Analytics

### Built-in Dashboard
- Total scans performed
- Active scanning sessions
- Vulnerabilities discovered
- Targets processed

### Grafana Integration
- Real-time scan metrics
- Historical vulnerability trends
- Performance monitoring
- Custom alerting

## 🐛 Troubleshooting

### Common Issues
1. **Port conflicts**: Ensure ports 3001, 8000, 3000 are available
2. **Memory issues**: Increase Docker memory limit to 4GB+
3. **Scan timeouts**: Large target lists may require patience
4. **Network connectivity**: Ensure Docker containers can access internet

### Debug Mode
```bash
# Enable debug logging
docker-compose logs -f backend
docker-compose logs -f scanner
```

## 🤝 Contributing

We welcome contributions! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request with detailed description

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This tool is for authorized security testing only. Users are responsible for ensuring they have permission to scan target systems. The developers are not responsible for any misuse or damage caused by this tool.

## 📞 Support

- **Issues**: GitHub Issues tab
- **Documentation**: Check `/docs` directory
- **Updates**: Watch repository for latest releases

---

**Made with ❤️ by the AKUMA Security Team**

*"Hunt vulnerabilities before they hunt you"*

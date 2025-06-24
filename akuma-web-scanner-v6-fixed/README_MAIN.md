# 🚀 AKUMA Web Scanner - Ultimate Security Arsenal

<p align="center">
  <img src="https://img.shields.io/badge/version-v6.0-red.svg" alt="Version">
  <img src="https://img.shields.io/badge/platform-Linux%20%7C%20macOS%20%7C%20Windows-brightgreen.svg" alt="Platform">
  <img src="https://img.shields.io/badge/docker-ready-blue.svg" alt="Docker">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
  <img src="https://img.shields.io/badge/language-Python%20%7C%20JavaScript-yellow.svg" alt="Language">
</p>

<p align="center">
  <b>🔥 Legendary Cyber Arsenal для комплексного тестирования веб-безопасности 💀⚡</b>
</p>

---

## 🎯 Что это такое?

**AKUMA Web Scanner** - это мощная платформа для автоматизированного тестирования безопасности веб-приложений, объединяющая лучшие инструменты в одном красивом кибер-панк интерфейсе.

### ⚡ Ключевые особенности:

- 🎯 **Реальное сканирование Nuclei** с 5000+ шаблонами уязвимостей
- 📁 **Directory Fuzzing** с gobuster, dirsearch и кастомными wordlist'ами
- 🛡️ **Веб-тестирование**: XSS, SQL injection, SSRF, LFI/RFI, Path Traversal
- 🔍 **Глубокое сканирование портов** с nmap и анализом сервисов
- 📋 **Загрузка целей** из файлов и массовое сканирование
- 📊 **Grafana дашборды** для визуализации результатов
- 🐳 **Docker Compose** - запуск одной командой

---

## 🚀 Быстрый старт

### 1️⃣ Клонирование репозитория:
```bash
git clone https://github.com/sweetpotatohack/AKUMA_Web_Scaner.git
cd AKUMA_Web_Scaner/akuma-web-scanner-v6-fixed
```

### 2️⃣ Запуск системы:
```bash
# Простой запуск
docker-compose up -d

# Или с автоматической настройкой
chmod +x start.sh
./start.sh
```

### 3️⃣ Доступ к интерфейсу:
- 🎯 **Web Scanner**: http://localhost:3001
- 📚 **API Docs**: http://localhost:8000/docs
- 📊 **Grafana**: http://localhost:3000
- 🔍 **Prometheus**: http://localhost:9090

---

## 🛡️ Арсенал инструментов

| Инструмент | Назначение | Особенности |
|------------|------------|-------------|
| **🎯 Nuclei** | Поиск уязвимостей | 5000+ актуальных шаблонов |
| **🗂️ Gobuster** | Directory fuzzing | Быстрый поиск скрытых директорий |
| **🔍 Dirsearch** | Расширенный fuzzing | Интеллектуальный поиск файлов |
| **🌐 Nmap** | Сканирование портов | Детальный анализ сервисов |
| **🔒 TestSSL** | SSL/TLS анализ | Проверка криптографических настроек |
| **⚡ Custom XSS** | XSS тестирование | Поиск межсайтового скриптинга |
| **💉 SQLi Scanner** | SQL инъекции | Автоматический поиск SQLi |

---

## 🎨 Интерфейс

### 🌟 Кибер-панк дизайн:
- Темная тема с неоновыми акцентами
- Анимированные элементы и переходы
- Адаптивный дизайн для всех устройств
- Интуитивная навигация

### 📊 Функциональность:
- **Создание сканов**: Ввод URL или загрузка файлов
- **Мониторинг**: Отслеживание прогресса в реальном времени
- **Результаты**: Детальный анализ найденных уязвимостей
- **Экспорт**: Сохранение отчетов в различных форматах

---

## 🏗️ Архитектура

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Scanner       │
│   (React)       │◄──►│   (FastAPI)     │◄──►│   (Python)      │
│   Port: 3001    │    │   Port: 8000    │    │   Port: 5000    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                       ▲                       ▲
         │                       │                       │
┌─────────────────────────────────────────────────────────────────┐
│                    Nginx Reverse Proxy                         │
│                      Port: 80/443                              │
└─────────────────────────────────────────────────────────────────┘
         ▲                       ▲                       ▲
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │     Redis       │    │    Grafana      │
│   Port: 5432    │    │   Port: 6379    │    │   Port: 3000    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 📊 Мониторинг и метрики

### 🔍 Prometheus метрики:
- Количество активных сканов
- Производительность системы
- Статистика найденных уязвимостей
- Использование ресурсов

### 📈 Grafana дашборды:
- Общий обзор системы
- Детализация по типам уязвимостей
- Временные графики сканирований
- Heatmap активности

---

## 🔧 Конфигурация

### Переменные окружения (.env):
```env
# Database
POSTGRES_DB=akuma_scanner
POSTGRES_USER=akuma
POSTGRES_PASSWORD=your_secure_password

# Redis
REDIS_URL=redis://redis:6379/0

# Scanner Settings
SCANNER_THREADS=10
SCAN_TIMEOUT=3600
MAX_TARGETS_PER_SCAN=50

# Security
JWT_SECRET_KEY=your_jwt_secret
ALLOWED_HOSTS=localhost,127.0.0.1

# API Settings
API_RATE_LIMIT=100
UPLOAD_MAX_SIZE=10MB
```

---

## 📋 Системные требования

| Компонент | Минимум | Рекомендуется |
|-----------|---------|---------------|
| **CPU** | 2 cores | 4+ cores |
| **RAM** | 4 GB | 8+ GB |
| **Storage** | 10 GB | 50+ GB |
| **Docker** | v20.10+ | Latest |
| **Docker Compose** | v2.0+ | Latest |

---

## 🔒 Безопасность

### 🛡️ Встроенная защита:
- JWT аутентификация для API
- Rate limiting на критичных endpoint'ах
- SSL/TLS шифрование трафика
- Валидация всех входных данных
- Изоляция в Docker контейнерах
- Защита от CSRF и XSS атак

### ⚠️ Этические принципы:
- **Только авторизованное тестирование**
- **Соблюдение законодательства**
- **Responsible disclosure**
- **Не навреди**

---

## 🎯 Примеры использования

### 1. Быстрое сканирование:
```bash
curl -X POST "http://localhost:8000/scans/" \
  -H "Content-Type: application/json" \
  -d '{"targets": ["https://example.com"], "scan_types": ["nuclei", "ports"]}'
```

### 2. Массовое сканирование:
```bash
# Создаем файл с целями
echo -e "https://example1.com\nhttps://example2.com" > targets.txt

# Загружаем через API
curl -X POST "http://localhost:8000/upload-targets/" \
  -F "file=@targets.txt"
```

### 3. Directory fuzzing:
```bash
curl -X POST "http://localhost:8000/scans/" \
  -H "Content-Type: application/json" \
  -d '{"targets": ["https://example.com"], "scan_types": ["directory"]}'
```

---

## 🤝 Поддержка и развитие

### 📚 Документация:
- [API Reference](http://localhost:8000/docs) - Swagger UI
- [Wiki](https://github.com/sweetpotatohack/AKUMA_Web_Scaner/wiki) - Детальные гайды
- [Examples](./examples/) - Примеры использования

### 🐛 Нашли баг?
1. Проверьте [Issues](https://github.com/sweetpotatohack/AKUMA_Web_Scaner/issues)
2. Создайте новый issue с детальным описанием
3. Приложите логи и скриншоты

### 💡 Хотите улучшения?
1. Fork репозитория
2. Создайте feature branch
3. Внесите изменения
4. Создайте Pull Request

---

## 📈 Roadmap

### 🔮 Планируемые фиры:
- [ ] **v6.1**: Интеграция с Metasploit
- [ ] **v6.2**: API fuzzing с Swagger/OpenAPI
- [ ] **v6.3**: Cloud deployment (AWS/GCP/Azure)
- [ ] **v6.4**: Machine Learning для анализа уязвимостей
- [ ] **v6.5**: Mobile app scanning
- [ ] **v7.0**: AI-powered vulnerability assessment

---

## 📜 Лицензия

Этот проект распространяется под лицензией MIT. См. файл [LICENSE](LICENSE) для деталей.

---

## 🙏 Благодарности

Особая благодарность создателям инструментов:
- [ProjectDiscovery](https://projectdiscovery.io/) за Nuclei
- [OJ Reeves](https://github.com/OJ) за Gobuster  
- [Maurosoria](https://github.com/maurosoria) за Dirsearch
- [Nmap Project](https://nmap.org/) за Nmap
- [Dirk Wetter](https://github.com/drwetter) за TestSSL.sh

---

<p align="center">
  <b>🔥 AKUMA Web Scanner - где кибер-панк встречается с кибербезопасностью! 💀⚡</b>
</p>

<p align="center">
  <i>Создано с ❤️ для этичного хакинга и пентестинга</i>
</p>

---

**⚠️ Дисклеймер**: Этот инструмент предназначен только для авторизованного тестирования безопасности и образовательных целей. Используйте ответственно и в соответствии с применимым законодательством.

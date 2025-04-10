Сканер внешнего периметра: 
Краткое описание работы скрипта  

Название: AKUMA Web Scanner  
Стиль: Киберпанк / хакерский  
Автор: theskill19 (AKUMA)  

Основные функции:  
1. Креативный запуск – глючные ASCII-анимации и киберпанковый стиль.  
2. Автообновление инструментов – обновление nmap, WhatWeb, Jaeles, Nuclei.  
3. Сканирование сети – обнаружение активных хостов (nmap -sn), фильтрация исключённых IP.  
4. Детальное сканирование – проверка открытых портов, сервисов, SSL/TLS (nmap -sV).  
5. Веб-разведка – поиск HTTP/S сервисов (httpx), анализ CMS (WhatWeb).  
6. Поиск уязвимостей – автоматическое сканирование с помощью Nuclei и Jaeles.  
7. Специальная проверка Bitrix24 – отдельный анализ сайтов на Bitrix.  
8. Генерация отчётов – сортировка уязвимостей по критичности (Critical/High/Medium).  
9. Интеграция с Grafana – визуализация результатов через nmap-did-what.  

Особенности:
✅ Логирование – запись всех этапов в лог-файл.  
✅ Фильтрация целей – исключение внутренних/тестовых IP.  
✅ Оптимизация – настройки скорости сканирования (--min-rate, --max-retries).  
✅ Юмор – саркастичные комментарии в стиле киберпанка.  

Пример запуска:  
./akuma_scanner.sh -f targets.txt

Финал:  
> "💀 Все системы онлайн. Если что — это не мы."  
> "🧠 Добро пожаловать в матрицу, AKUMA... У нас тут sudo и печеньки 🍪."  

Скрипт сочетает мощный функционал пентест-утилит с атмосферой хакерского триллера.  
Идеально для: разведки сети, поиска уязвимостей и киберпанк-эстетики. 🔥


### **Установка всех необходимых инструментов для AKUMA Web Scanner**  
*(для Kali Linux / Ubuntu / Debian)*  

Перед началом убедитесь, что у вас есть `sudo`-права и интернет.  

#### **1. Обновление системы**  
```bash
sudo apt update && sudo apt upgrade -y
```

#### **2. Установка базовых зависимостей**  
```bash
sudo apt install -y git curl wget python3 python3-pip golang docker.io docker-compose jq
```

#### **3. Установка сканеров и инструментов**  

##### **Nmap** (сканирование сети)  
```bash
sudo apt install -y nmap
```

##### **WhatWeb** (анализ веб-технологий)  
```bash
sudo apt install -y whatweb
```

##### **httpx** (поиск HTTP/S сервисов)  
```bash
go install -v github.com/projectdiscovery/httpx/cmd/httpx@latest
echo 'export PATH=$PATH:~/go/bin' >> ~/.bashrc
source ~/.bashrc
```

##### **Nuclei** (сканирование уязвимостей)  
```bash
go install -v github.com/projectdiscovery/nuclei/v2/cmd/nuclei@latest
nuclei -update-templates
```

##### **Jaeles** (сканирование с кастомными сигнатурами)  
```bash
GO111MODULE=on go install github.com/jaeles-project/jaeles@latest
jaeles config init
```

##### **Grafana + nmap-did-what** (визуализация результатов)  
```bash
git clone https://github.com/vulnersCom/nmap-did-what.git ~/nmap-did-what
cd ~/nmap-did-what/grafana-docker
docker-compose up -d
```

#### **4. Установка дополнительных шаблонов**  

##### **Nuclei-templates (официальные)**  
```bash
git clone https://github.com/projectdiscovery/nuclei-templates.git ~/nuclei-templates
```

##### **Nuclei-templates для Bitrix (опционально)**  
```bash
git clone https://github.com/doki-the-builder/nuclei-templates-bitrix.git ~/nuclei-templates-bitrix
```

##### **Базовые сигнатуры для Jaeles**  
```bash
git clone https://github.com/jaeles-project/jaeles-signatures ~/.jaeles/base-signatures
```

#### **5. Установка `lolcat` (для красивого вывода)**  
```bash
sudo apt install -y lolcat
```

---

### **Проверка установки**  
```bash
nmap --version
whatweb --version
httpx -version
nuclei -version
jaeles version
docker --version
```

### **Финал**  
Теперь ваш сканер готов к работе! Запускайте:  
```bash
chmod +x akuma_scanner.sh
./akuma_scanner.sh -f targets.txt
```

**Примечание:**  
- Если `go`-утилиты не работают, проверьте `PATH`:  
  ```bash
  echo 'export PATH=$PATH:~/go/bin' >> ~/.bashrc && source ~/.bashrc
  ```
- Для Docker без sudo:  
  ```bash
  sudo usermod -aG docker $USER
  newgrp docker
  ```

**🚀 Всё настроено! Время взламывать!** (но только легально 😉)

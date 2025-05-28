**AKUMA\_Web\_Scan.sh - 悪魔の外部 периметрアナライザー**
*"Where code cuts deeper than a katana, AKUMA reveals your web’s darkest secrets…"*

---

## 🚀 概要 (Overview)

**AKUMA\_Web\_Scan** (悪魔 – "Demon") — это ультимативный киберпанк-фреймворк для разведки внешнего периметра. Созданный для цифровых ронинов и red team-спецов, он сочетает безумную автоматизацию с аккуратностью хирурга: от глубокого анализа корпоративных порталов до охоты за призраками старых багов.

---

## # 起動コマンド (Activation Sequence)

```bash
sudo ./AKUMA_Web_Scan.sh -f targets.txt
sudo ./AKUMA_Web_Scan.sh target.com
sudo ./AKUMA_Web_Scan.sh 192.168.1.24 -z
```

---

## 🔥 特徴 (Features)

**Demon Core:**

* Многопоточное сканирование без компромиссов по скорости и шумности.
* Ловит всё: сайты, VPN, SharePoint, AD, RDP, принтеры — всё, что дышит.

**Ghost Protocol:**

* Маскировка и смена MAC, обход базовых защит и банальных WAF.

**Neon Bloodline:**

* WPScan — WordPress уязвимости автоматом.
* Bitrix24 — кастомные шаблоны nuclei для корпоративного хакинга.
* Cloud Buster — отпечатки AWS, GCP, Azure.

**Yōkai Modules:**

* Wayback Machine — восстановление истории доменов (что скрывали — покажет демон).
* SSL/TLS Bloodletting — проверка сертификатов через testssl.sh.
* BBOT Subdomain Seizure — массовый захват поддоменов.

**Oni Output:**

* Генерация отчётов в стиле неонового киберпанка (HTML/PDF).
* Ссылки на Webhook и хранение скринов/артефактов.

---

## システム要件 (System Requirements)

### # 地獄の依存関係 (Dependencies from Hell)

```bash
sudo apt install git ruby python3 golang docker.io wkhtmltopdf
gem install wpscan lolcat
pip3 install pipx bbot
```

---

## 🗡️ 使用方法 (Usage)

### 1. ターゲットファイルの準備 / Подготовка целей

```bash
echo "target.com" > targets.txt
```

### 2. 悪魔の覚醒 (Awaken the Demon)

```bash
chmod +x AKUMA_Web_Scan.sh
sudo ./AKUMA_Web_Scan.sh -f targets.txt
```

**ИЛИ для одиночных целей:**

```bash
sudo ./AKUMA_Web_Scan.sh example.com 192.168.1.24 -z
```

### 3. 血の報酬を収集 (Collect the Spoils)

```bash
ls -la /root/web_scan/*/final_report.pdf
```

---

## 🌌 出力例 (Sample Output)

```
[血月昇る] Отчёт сканирования:
• Хостов онлайн: 12 (тени вспыхнули неоном)
• WordPress-ресурсов: 3 (уязвимостей: 15)
• Bitrix24-целей: 2 (критические дыры)
• Поддоменов обнаружено: 64
• Исторических URL: 300+ (прошлое не забывает)
• Критические уязвимости: 6 (на острие меча)
```

---

## ⚠️ 免責事項 (Disclaimer)

Этот инструмент создан только для легального тестирования.
*“The demon bites both ways — use responsibly.”*
*"Патчи — временные, эксплойты — вечные. Один баг меняет историю. Хакни клинок — хакни мир."*

---

```
          _  _                  _  _            
         / \/ \   _   _   _   / \/ \    _   _  
        / /\_/\ / \ / \ / \ / /\_/\ \ / \ / \ 
        \/      \_/ \_/ \_/ \/      \/ \_/ \_/ 
        悪魔はすべてを見ている...
```

[**GitHub**](https://github.com/sweetpotatohack/AKUMA_Web_Scan)
**License:** BSD 3-Clause "New" or "Revised" License (血の誓約)

---

**AKUMA\_Web\_Scan — в неоновых тенях сети ты увидишь больше, чем человеческий глаз.**
*Welcome to the Cyberpunk. Welcome to the hunt.*

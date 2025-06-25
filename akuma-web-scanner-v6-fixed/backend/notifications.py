import asyncio
import aiohttp
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import json
import logging
from typing import Dict, List, Optional
import os
from datetime import datetime

logger = logging.getLogger(__name__)

class NotificationManager:
    def __init__(self):
        self.telegram_bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
        self.telegram_chat_ids = []
        self.smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.smtp_user = os.getenv('SMTP_USER')
        self.smtp_password = os.getenv('SMTP_PASSWORD')
        self.email_recipients = []
        
    def add_telegram_chat(self, chat_id: str):
        """Add Telegram chat ID for notifications"""
        if chat_id not in self.telegram_chat_ids:
            self.telegram_chat_ids.append(chat_id)
            
    def add_email_recipient(self, email: str):
        """Add email recipient for notifications"""
        if email not in self.email_recipients:
            self.email_recipients.append(email)
    
    async def send_telegram_message(self, message: str, parse_mode: str = "HTML") -> bool:
        """Send message to all configured Telegram chats"""
        if not self.telegram_bot_token or not self.telegram_chat_ids:
            logger.warning("Telegram not configured")
            return False
            
        success = True
        async with aiohttp.ClientSession() as session:
            for chat_id in self.telegram_chat_ids:
                try:
                    url = f"https://api.telegram.org/bot{self.telegram_bot_token}/sendMessage"
                    data = {
                        'chat_id': chat_id,
                        'text': message,
                        'parse_mode': parse_mode
                    }
                    async with session.post(url, json=data) as response:
                        if response.status != 200:
                            logger.error(f"Failed to send Telegram message to {chat_id}")
                            success = False
                except Exception as e:
                    logger.error(f"Telegram send error: {e}")
                    success = False
        return success
    
    async def send_email(self, subject: str, body: str, html_body: str = None, attachments: List[Dict] = None) -> bool:
        """Send email to all configured recipients"""
        if not self.smtp_user or not self.smtp_password or not self.email_recipients:
            logger.warning("Email not configured")
            return False
            
        try:
            msg = MIMEMultipart('alternative')
            msg['From'] = self.smtp_user
            msg['To'] = ', '.join(self.email_recipients)
            msg['Subject'] = subject
            
            # Add text and HTML parts
            msg.attach(MIMEText(body, 'plain'))
            if html_body:
                msg.attach(MIMEText(html_body, 'html'))
            
            # Add attachments if any
            if attachments:
                for attachment in attachments:
                    part = MIMEBase('application', 'octet-stream')
                    part.set_payload(attachment['content'])
                    encoders.encode_base64(part)
                    part.add_header(
                        'Content-Disposition',
                        f'attachment; filename= {attachment["filename"]}'
                    )
                    msg.attach(part)
            
            # Send email
            server = smtplib.SMTP(self.smtp_host, self.smtp_port)
            server.starttls()
            server.login(self.smtp_user, self.smtp_password)
            server.send_message(msg)
            server.quit()
            
            logger.info(f"Email sent successfully to {len(self.email_recipients)} recipients")
            return True
            
        except Exception as e:
            logger.error(f"Email send error: {e}")
            return False
    
    async def notify_scan_started(self, scan_id: str, scan_name: str, targets: List[str]):
        """Notify that a new scan has started"""
        target_list = "\n".join([f"• {target}" for target in targets[:5]])  # Limit to 5 targets
        if len(targets) > 5:
            target_list += f"\n• ... and {len(targets) - 5} more"
            
        # Telegram message
        telegram_msg = f"""
🚀 <b>AKUMA Scan Started</b>

<b>Scan ID:</b> <code>{scan_id}</code>
<b>Name:</b> {scan_name}
<b>Targets:</b>
{target_list}

<b>Started:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

<i>I'll notify you when the scan completes! 🔥</i>
"""
        
        # Email message
        email_subject = f"🚀 AKUMA Scan Started: {scan_name}"
        email_body = f"""
AKUMA Web Scanner - Scan Started

Scan ID: {scan_id}
Name: {scan_name}
Targets: {', '.join(targets)}
Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

You will receive another notification when the scan completes.
"""
        
        await asyncio.gather(
            self.send_telegram_message(telegram_msg),
            self.send_email(email_subject, email_body),
            return_exceptions=True
        )
    
    async def notify_scan_completed(self, scan_id: str, scan_name: str, vulnerability_count: int, 
                                  critical_count: int, high_count: int, medium_count: int, low_count: int):
        """Notify that a scan has completed"""
        
        # Create severity emoji mapping
        severity_icons = {"critical": "🔴", "high": "🟠", "medium": "🟡", "low": "🟢", "info": "🔵"}
        
        # Telegram message
        telegram_msg = f"""
✅ <b>AKUMA Scan Completed</b>

<b>Scan ID:</b> <code>{scan_id}</code>
<b>Name:</b> {scan_name}

<b>📊 Vulnerabilities Found:</b>
🔴 Critical: {critical_count}
🟠 High: {high_count}  
🟡 Medium: {medium_count}
🟢 Low: {low_count}

<b>🕒 Completed:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

{"🚨 <b>URGENT: Critical vulnerabilities detected!</b>" if critical_count > 0 else ""}
{"⚠️ High-priority issues found!" if high_count > 0 and critical_count == 0 else ""}
"""
        
        # Email message  
        email_subject = f"✅ AKUMA Scan Completed: {scan_name}"
        if critical_count > 0:
            email_subject = f"🚨 CRITICAL - " + email_subject
        elif high_count > 0:
            email_subject = f"⚠️ HIGH - " + email_subject
            
        email_body = f"""
AKUMA Web Scanner - Scan Completed

Scan ID: {scan_id}
Name: {scan_name}
Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

VULNERABILITY SUMMARY:
• Critical: {critical_count}
• High: {high_count}
• Medium: {medium_count}
• Low: {low_count}

Total vulnerabilities found: {vulnerability_count}

Please review the scan results in the AKUMA Web Scanner dashboard.
"""
        
        await asyncio.gather(
            self.send_telegram_message(telegram_msg),
            self.send_email(email_subject, email_body),
            return_exceptions=True
        )
    
    async def notify_critical_vulnerability(self, scan_id: str, vulnerability: Dict):
        """Send immediate notification for critical vulnerabilities"""
        
        telegram_msg = f"""
🚨 <b>CRITICAL VULNERABILITY DETECTED</b>

<b>Scan ID:</b> <code>{scan_id}</code>
<b>Title:</b> {vulnerability.get('title', 'Unknown')}
<b>CVSS Score:</b> {vulnerability.get('cvss', 'N/A')}
<b>Tool:</b> {vulnerability.get('tool', 'Unknown')}

<b>Description:</b>
{vulnerability.get('description', 'No description available')}

<b>⚡ Immediate action required!</b>
"""
        
        email_subject = f"🚨 CRITICAL VULNERABILITY - {vulnerability.get('title', 'Unknown')}"
        email_body = f"""
AKUMA Web Scanner - Critical Vulnerability Alert

Scan ID: {scan_id}
Vulnerability: {vulnerability.get('title', 'Unknown')}
Severity: CRITICAL
CVSS Score: {vulnerability.get('cvss', 'N/A')}
Detection Tool: {vulnerability.get('tool', 'Unknown')}

Description:
{vulnerability.get('description', 'No description available')}

This vulnerability requires immediate attention and remediation.

Time Detected: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
"""
        
        await asyncio.gather(
            self.send_telegram_message(telegram_msg),
            self.send_email(email_subject, email_body),
            return_exceptions=True
        )

# Global notification manager instance
notification_manager = NotificationManager()

# Helper functions for easy access
async def notify_scan_started(scan_id: str, scan_name: str, targets: List[str]):
    await notification_manager.notify_scan_started(scan_id, scan_name, targets)

async def notify_scan_completed(scan_id: str, scan_name: str, vulnerability_count: int,
                               critical_count: int, high_count: int, medium_count: int, low_count: int):
    await notification_manager.notify_scan_completed(scan_id, scan_name, vulnerability_count,
                                                   critical_count, high_count, medium_count, low_count)

async def notify_critical_vulnerability(scan_id: str, vulnerability: Dict):
    await notification_manager.notify_critical_vulnerability(scan_id, vulnerability)

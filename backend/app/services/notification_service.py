"""Notification service abstraction for email, SMS, and in-app notifications."""
from __future__ import annotations

import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.config import settings

logger = logging.getLogger(__name__)


class NotificationService:
    """Abstract notification sender with email and SMS providers."""

    def __init__(self):
        self.smtp_host = settings.smtp_host
        self.smtp_port = settings.smtp_port
        self.smtp_user = settings.smtp_user
        self.smtp_password = settings.smtp_password

    def send_email(
        self, to_email: str, subject: str, body: str
    ) -> dict:
        try:
            msg = MIMEMultipart()
            msg["From"] = self.smtp_user
            msg["To"] = to_email
            msg["Subject"] = subject
            msg.attach(MIMEText(body, "html"))
            # With real SMTP: server = smtplib.SMTP(...)
            # server.sendmail(...)
            logger.info(
                f"[Mock Email] To: {to_email}, Subject: {subject}"
            )
            return {"status": "sent", "channel": "email"}
        except Exception as e:
            logger.error(f"Email send failed: {e}")
            return {"status": "failed", "error": str(e)}

    def send_sms(self, phone: str, message: str) -> dict:
        try:
            # Would use Twilio here: client.messages.create(...)
            logger.info(f"[Mock SMS] To: {phone}, Message: {message[:50]}...")
            return {"status": "sent", "channel": "sms"}
        except Exception as e:
            logger.error(f"SMS send failed: {e}")
            return {"status": "failed", "error": str(e)}

    def send_order_confirmation_email(self, email: str, order_id: str) -> dict:
        return self.send_email(
            email,
            "Order Confirmed - NelloreRuchullu",
            f"""
            <html><body>
            <h2>Order Confirmed!</h2>
            <p>Your order has been confirmed.</p>
            <p>Order ID: {order_id}</p>
            <p>Thank you for choosing NelloreRuchullu!</p>
            </body></html>
            """,
        )

    def send_kitchen_notification(self, order_id: str) -> dict:
        logger.info(f"[Kitchen Notification] New order: {order_id}")
        return {"status": "sent", "channel": "kitchen"}

    def send_admin_report(
        self, subject: str, body: str
    ) -> dict:
        if self.smtp_user:
            return self.send_email(self.smtp_user, subject, body)
        logger.info(f"[Admin Report] {subject}: {body[:100]}")
        return {"status": "sent", "channel": "admin"}

"""Celery configuration for background tasks (notifications, order processing, analytics)."""

from __future__ import annotations

from collections.abc import Callable
from typing import Any

from celery import Celery
from celery.signals import task_failure, task_postrun, task_prerun

from app.config import settings

celery_app = Celery("nellore_ruchullu")

celery_app.conf.update(
    broker_url=settings.redis_url,
    result_backend=settings.redis_url,
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    worker_concurrency=4,
    broker_connection_retry_on_startup=True,
    beat_schedule={
        "cleanup-expired-otps": {
            "task": "app.celery_app.cleanup_expired_otps",
            "schedule": 3600.0,  # every hour
        },
        "send-daily-analytics": {
            "task": "app.celery_app.send_daily_analytics",
            "schedule": 86400.0,  # every day at midnight
        },
    },
)

celery_app.autodiscover_tasks(["app.services"], related_name="tasks", force=True)


# ── Tasks ─────────────────────────────────────────────────────────────────────

@celery_app.task(bind=True, name="app.celery_app.send_order_confirmation_email")
def send_order_confirmation_email(self, order_id: str, email: str) -> dict[str, Any]:
    """Send order confirmation email asynchronously."""
    from app.services.notification_service import NotificationService
    notif = NotificationService()
    result = notif.send_order_confirmation_email(email, order_id)
    return result


@celery_app.task(bind=True, name="app.celery_app.send_otp_sms")
def send_otp_sms(self, phone: str, code: str) -> dict[str, Any]:
    """Send OTP via SMS."""
    from app.services.notification_service import NotificationService
    notif = NotificationService()
    return notif.send_sms(phone, f"Your OTP is {code}. Valid for 10 minutes.")


@celery_app.task(bind=True, name="app.celery_app.send_otp_email")
def send_otp_email(self, email: str, code: str) -> dict[str, Any]:
    """Send OTP via email."""
    from app.services.notification_service import NotificationService
    notif = NotificationService()
    return notif.send_email(
        email,
        subject="Your NelloreRuchullu OTP",
        body=f"Your OTP is {code}. Valid for 10 minutes.",
    )


@celery_app.task(bind=True, name="app.celery_app.notify_kitchen")
def notify_kitchen(self, order_id: str) -> dict[str, Any]:
    """Notify kitchen about new order."""
    from app.services.notification_service import NotificationService
    notif = NotificationService()
    return notif.send_kitchen_notification(order_id)


@celery_app.task(bind=True, name="app.celery_app.cleanup_expired_otps")
def cleanup_expired_otps(self) -> dict[str, Any]:
    """Clean up expired OTP records from the database."""
    import asyncio
    from datetime import datetime, timezone
    from app.database import async_session_factory
    from app.models.otp import OTPVerification
    from sqlalchemy import delete

    async def _cleanup():
        async with async_session_factory() as session:
            stmt = delete(OTPVerification).where(
                OTPVerification.expires_at < datetime.now(timezone.utc)
            )
            result = await session.execute(stmt)
            await session.commit()
            return {"deleted": result.rowcount}

    return asyncio.run(_cleanup())


@celery_app.task(bind=True, name="app.celery_app.send_daily_analytics")
def send_daily_analytics(self) -> dict[str, Any]:
    """Generate and send daily analytics report."""
    from datetime import datetime, timedelta, timezone
    from app.database import async_session_factory
    from app.models.order import Order, OrderStatus
    from app.services.notification_service import NotificationService
    from sqlalchemy import func, select

    async def _generate():
        now = datetime.now(timezone.utc)
        yesterday = now - timedelta(days=1)
        start = yesterday.replace(hour=0, minute=0, second=0, microsecond=0)
        end = start.replace(hour=23, minute=59, second=59)

        async with async_session_factory() as session:
            total_orders_q = select(func.count(Order.id)).where(
                Order.created_at >= start,
                Order.created_at <= end,
            )
            result = await session.execute(total_orders_q)
            total_orders = result.scalar() or 0

            revenue_q = select(func.sum(Order.total_amount)).where(
                Order.created_at >= start,
                Order.created_at <= end,
                Order.status != OrderStatus.CANCELLED,
            )
            result = await session.execute(revenue_q)
            revenue = result.scalar() or 0

        notif = NotificationService()
        notif.send_admin_report(
            f"Daily Analytics Report - {start.strftime('%Y-%m-%d')}",
            f"Total Orders: {total_orders}\nRevenue: ₹{revenue}",
        )
        return {"total_orders": total_orders, "revenue": float(revenue)}

    import asyncio
    return asyncio.run(_generate())


# ── Signals for logging ───────────────────────────────────────────────────────

import logging
logger = logging.getLogger(__name__)

@task_prerun.connect
def on_task_prerun(sender=None, task_id=None, task=None, **kwargs):
    logger.info(f"Task {task.name}[{task_id}] starting")

@task_postrun.connect
def on_task_postrun(sender=None, task_id=None, task=None, retval=None, **kwargs):
    logger.info(f"Task {task.name}[{task_id}] completed")

@task_failure.connect
def on_task_failure(sender=None, task_id=None, task=None, exception=None, **kwargs):
    logger.error(f"Task {task.name}[{task_id}] failed: {exception}")

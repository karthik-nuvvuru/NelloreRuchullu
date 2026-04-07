"""Payment service with Razorpay integration."""
from __future__ import annotations

import hashlib
import hmac
import json
import logging
from decimal import Decimal
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.config import settings
from app.core.redis_client import RedisClient
from app.exceptions import PaymentError, ValidationErrorException
from app.models.order import Order, OrderStatus
from app.models.payment import Payment, PaymentStatus

logger = logging.getLogger(__name__)


class PaymentService:
    def __init__(self, redis_client: RedisClient | None = None):
        self.redis = redis_client

    async def create_payment(self, db, order_id: UUID) -> dict:
        """Create a Razorpay order for online payments."""
        from app.models.order import Order
        result = await db.execute(
            select(Order).where(Order.id == order_id)
        )
        order = result.scalar_one_or_none()
        if not order:
            raise ValidationErrorException("Order not found")
        if order.status == OrderStatus.CANCELLED:
            raise ValidationErrorException("Cannot pay cancelled order")

        result = await db.execute(
            select(Payment).where(Payment.order_id == order_id)
        )
        payment = result.scalar_one_or_none()
        if not payment:
            raise ValidationErrorException("Payment not found for order")

        # Razorpay test order
        amount_paise = int(Decimal(str(order.total_amount)) * 100)
        receipt = order.order_number

        # In real implementation: import razorpay, client.order.create(...)
        razorpay_order_id = f"order_test_{order_id.hex[:8]}"

        payment.razorpay_order_id = razorpay_order_id
        payment.status = PaymentStatus.INITIATED
        await db.flush()

        return {
            "razorpay_order_id": razorpay_order_id,
            "key": settings.razorpay_key_id,
            "amount": amount_paise,
            "currency": "INR",
            "order_id": str(order_id),
            "prefill": {
                "name": "Customer",
                "email": "customer@example.com",
            }
        }

    async def verify_payment(
        self, db, order_id: UUID, razorpay_order_id: str,
        razorpay_payment_id: str, razorpay_signature: str
    ) -> Payment:
        expected = hmac.new(
            settings.razorpay_key_secret.encode(),
            f"{razorpay_order_id}|{razorpay_payment_id}".encode(),
            hashlib.sha256,
        ).hexdigest()

        if expected != razorpay_signature:
            raise PaymentError("Payment verification failed: invalid signature")

        result = await db.execute(
            select(Payment).where(Payment.order_id == order_id)
        )
        payment = result.scalar_one_or_none()
        if not payment:
            raise PaymentError("Payment not found")

        payment.razorpay_payment_id = razorpay_payment_id
        payment.razorpay_signature = razorpay_signature
        payment.status = PaymentStatus.SUCCEEDED

        result_order = await db.execute(
            select(Order).where(Order.id == order_id)
        )
        order = result_order.scalar_one_or_none()
        if order:
            order.status = OrderStatus.CONFIRMED

        await db.flush()
        logger.info(f"Payment verified: order_id={order_id}")
        return payment

    async def handle_webhook(self, payload: dict) -> dict:
        entity = payload.get("entity", "")
        event = payload.get("event", "")

        if event == "payment.captured":
            order_payment_id = payload.get("payload", {}).get(
                "payment", {}
            ).get("entity", {}).get("order_id", "")
            logger.info(f"Webhook: payment.captured for {order_payment_id}")
        elif event == "payment.failed":
            logger.warning(f"Webhook: payment failed: {payload}")

        return {"status": "ok"}

    async def get_payment(self, db, order_id: UUID) -> Payment:
        result = await db.execute(
            select(Payment).where(Payment.order_id == order_id)
        )
        payment = result.scalar_one_or_none()
        if not payment:
            raise PaymentError("Payment not found for order")
        return payment

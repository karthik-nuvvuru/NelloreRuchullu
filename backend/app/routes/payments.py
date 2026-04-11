"""Payment routes."""
from __future__ import annotations

import json
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.security import get_current_user, require_role, TokenPayload
from app.database import get_db
from app.dependencies import get_payment_service
from app.exceptions import AuthorizationError, NotFoundError
from app.schemas.payment import PaymentVerifyRequest
from app.services.payment_service import PaymentService

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.post("/create")
async def create_payment(
    order_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: TokenPayload = Depends(get_current_user),
    payment_service: PaymentService = Depends(get_payment_service),
):
    return await payment_service.create_payment(db, order_id)


@router.post("/verify")
async def verify_payment(
    body: PaymentVerifyRequest,
    db: AsyncSession = Depends(get_db),
    _: TokenPayload = Depends(get_current_user),
    payment_service: PaymentService = Depends(get_payment_service),
):
    payment = await payment_service.verify_payment(
        db, body.order_id, body.razorpay_order_id,
        body.razorpay_payment_id, body.razorpay_signature,
    )
    return {
        "id": str(payment.id),
        "order_id": str(payment.order_id),
        "status": payment.status.value,
        "razorpay_payment_id": payment.razorpay_payment_id,
    }


@router.post("/webhook")
async def payment_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
    payment_service: PaymentService = Depends(get_payment_service),
):
    # Get raw body for signature verification
    body = await request.body()
    payload = json.loads(body)

    # Verify webhook signature
    import hmac
    import hashlib
    signature = request.headers.get("x-razorpay-signature", "")
    expected = "sha256=" + hmac.new(
        settings.razorpay_webhook_secret.encode(),
        body,
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected, signature):
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    return await payment_service.handle_webhook(db, payload)


@router.get("/{order_id}")
async def get_payment(
    order_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenPayload = Depends(get_current_user),
    payment_service: PaymentService = Depends(get_payment_service),
):
    payment = await payment_service.get_payment(db, order_id)
    # Verify order belongs to requesting user (unless admin/vendor)
    if current_user.role not in ("admin", "vendor") and str(payment.user_id) != current_user.sub:
        raise AuthorizationError("Access denied")
    return {
        "id": str(payment.id),
        "order_id": str(payment.order_id),
        "status": payment.status.value,
        "amount": payment.amount,
        "currency": payment.currency,
        "payment_method": payment.payment_method.value,
        "razorpay_order_id": payment.razorpay_order_id,
        "razorpay_payment_id": payment.razorpay_payment_id,
        "created_at": payment.created_at.isoformat(),
    }

"""Pydantic v2 schemas for payment endpoints."""

from __future__ import annotations

from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


class PaymentCreateRequest(BaseModel):
    order_id: UUID
    amount: Decimal = Field(gt=0, decimal_places=2)
    currency: str = Field(default="INR")
    payment_method: str = Field(pattern="^(online|cod)$")


class PaymentVerifyRequest(BaseModel):
    order_id: UUID
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class PaymentWebhookRequest(BaseModel):
    entity: str
    event: str
    payload: dict


class PaymentResponse(BaseModel):
    id: UUID
    order_id: UUID
    status: str
    amount: Decimal
    currency: str
    razorpay_order_id: str | None
    razorpay_payment_id: str | None

    model_config = {"from_attributes": True}


class RazorpayOrderResponse(BaseModel):
    razorpay_order_id: str
    key: str
    amount: Decimal
    currency: str
    prefill: dict | None

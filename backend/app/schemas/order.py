"""Pydantic v2 schemas for order endpoints."""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


class OrderCreateRequest(BaseModel):
    address_id: UUID
    payment_method: str = Field(pattern="^(online|cod)$")
    notes: str | None = None
    coupon_code: str | None = None


class OrderStatusUpdate(BaseModel):
    status: str


class OrderCancelRequest(BaseModel):
    reason: str | None = None


class OrderItemResponse(BaseModel):
    id: UUID
    name: str
    quantity: int
    unit_price: Decimal
    total_price: Decimal
    special_instructions: str | None

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: UUID
    order_number: str
    status: str
    subtotal: Decimal
    tax_amount: Decimal
    discount_amount: Decimal
    total_amount: Decimal
    delivery_fee: Decimal
    notes: str | None
    coupon_code: str | None
    items: list[OrderItemResponse]
    delivery_partner_name: str | None = None
    delivery_partner_phone: str | None = None
    estimated_time: int | None = None
    delivery_address: dict | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class OrderSummaryResponse(BaseModel):
    id: UUID
    order_number: str
    status: str
    total_amount: Decimal
    item_count: int
    created_at: datetime

    model_config = {"from_attributes": True}

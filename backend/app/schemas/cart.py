"""Pydantic v2 schemas for cart endpoints."""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


class CartItemAdd(BaseModel):
    menu_item_id: UUID
    quantity: int = Field(default=1, ge=1, le=50)
    special_instructions: str | None = None


class CartItemUpdate(BaseModel):
    quantity: int = Field(ge=1, le=50)


class CartItemResponse(BaseModel):
    id: UUID
    menu_item_id: UUID
    item_name: str
    price: Decimal
    quantity: int
    special_instructions: str | None
    total_price: Decimal

    model_config = {"from_attributes": True}


class CartResponse(BaseModel):
    id: UUID
    items: list[CartItemResponse]
    subtotal: Decimal
    tax: Decimal
    total: Decimal
    item_count: int
    created_at: datetime

    model_config = {"from_attributes": True}

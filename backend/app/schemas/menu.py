"""Pydantic v2 schemas for menu endpoints."""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


class MenuItemCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    description: str | None = None
    price: Decimal = Field(gt=0, decimal_places=2)
    category_id: UUID | None = None
    image_url: str | None = None
    is_vegetarian: bool = False
    is_available: bool = True
    stock: int | None = None
    preparation_time_minutes: int | None = None


class MenuItemUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    price: Decimal | None = Field(default=None, gt=0, decimal_places=2)
    category_id: UUID | None = None
    image_url: str | None = None
    is_vegetarian: bool | None = None
    is_available: bool | None = None
    stock: int | None = None
    preparation_time_minutes: int | None = None


class CategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: str | None = None
    image_url: str | None = None
    sort_order: int = 0


class CategoryUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    description: str | None = None
    image_url: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class CategoryResponse(BaseModel):
    id: UUID
    name: str
    description: str | None
    image_url: str | None
    sort_order: int
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class MenuItemResponse(BaseModel):
    id: UUID
    name: str
    description: str | None
    price: Decimal
    category_id: UUID | None
    image_url: str | None
    is_vegetarian: bool
    is_available: bool
    stock: int | None
    preparation_time_minutes: int | None
    category: CategoryResponse | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class MenuItemListResponse(BaseModel):
    id: UUID
    name: str
    description: str | None
    price: Decimal
    image_url: str | None
    is_vegetarian: bool
    is_available: bool
    category_name: str | None = None

    model_config = {"from_attributes": True}

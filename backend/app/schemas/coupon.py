"""Pydantic v2 schemas for coupon endpoints."""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from enum import StrEnum
from uuid import UUID

from pydantic import BaseModel, Field, model_validator


class CouponType(StrEnum):
    PERCENTAGE = "percentage"
    FIXED = "fixed"


class CouponCreate(BaseModel):
    code: str = Field(min_length=3, max_length=50)
    description: str | None = None
    discount_type: CouponType = CouponType.PERCENTAGE
    discount_value: Decimal = Field(gt=0, decimal_places=2)
    min_order_amount: Decimal = Field(default=0, ge=0, decimal_places=2)
    max_discount: Decimal | None = Field(default=None, gt=0, decimal_places=2)
    usage_limit: int | None = None
    valid_from: datetime
    valid_until: datetime
    is_active: bool = True

    @model_validator(mode="after")
    def validate_discount_value(self):
        if self.discount_type == CouponType.PERCENTAGE and self.discount_value > 100:
            raise ValueError("Percentage discount cannot exceed 100")
        return self

    @model_validator(mode="after")
    def validate_dates(self):
        if self.valid_until and self.valid_from and self.valid_until <= self.valid_from:
            raise ValueError("valid_until must be after valid_from")
        return self


class CouponUpdate(BaseModel):
    description: str | None = None
    discount_value: Decimal | None = Field(default=None, gt=0, decimal_places=2)
    min_order_amount: Decimal | None = Field(default=None, ge=0, decimal_places=2)
    max_discount: Decimal | None = None
    usage_limit: int | None = None
    valid_from: datetime | None = None
    valid_until: datetime | None = None
    is_active: bool | None = None


class CouponResponse(BaseModel):
    id: UUID
    code: str
    description: str | None
    discount_type: CouponType
    discount_value: Decimal
    min_order_amount: Decimal
    max_discount: Decimal | None
    usage_limit: int | None
    used_count: int
    valid_from: datetime
    valid_until: datetime
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class CouponValidationResponse(BaseModel):
    valid: bool
    message: str
    code: str | None = None
    discount_type: CouponType | None = None
    discount_value: Decimal | None = None
    discounted_amount: Decimal | None = None

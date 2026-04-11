"""Coupon service for discount codes."""
from __future__ import annotations

import logging
from datetime import datetime, timezone
from decimal import Decimal
from uuid import UUID

from sqlalchemy import select, update as sql_update

from app.config import settings
from app.core.redis_client import RedisClient
from app.exceptions import NotFoundError, ValidationErrorException
from app.models.coupon import Coupon, CouponType

logger = logging.getLogger(__name__)


class CouponService:
    def __init__(self, redis_client: RedisClient | None = None):
        self.redis = redis_client

    async def validate_coupon(self, db, code: str,
                              order_amount: float) -> dict:
        cache_key = f"coupon:validate:{code.upper()}"
        if self.redis:
            cached = await self.redis.cache_get(cache_key)
            if cached:
                return cached

        result = await db.execute(
            select(Coupon).where(Coupon.code == code.upper())
        )
        coupon = result.scalar_one_or_none()
        if not coupon or not coupon.is_active:
            return {"valid": False, "message": "Invalid coupon code"}

        now = datetime.now(timezone.utc)
        if now < coupon.valid_from or now > coupon.valid_until:
            return {"valid": False, "message": "Coupon has expired"}

        if coupon.usage_limit and coupon.used_count >= coupon.usage_limit:
            return {"valid": False, "message": "Coupon usage limit reached"}

        if order_amount < float(coupon.min_order_amount):
            return {
                "valid": False,
                "message": f"Minimum order amount is ₹{coupon.min_order_amount}",
            }

        # Calculate discount
        if coupon.discount_type == CouponType.PERCENTAGE:
            discount = Decimal(str(order_amount)) * (
                coupon.discount_value / 100
            )
            if coupon.max_discount:
                discount = min(discount, Decimal(str(coupon.max_discount)))
        else:
            discount = coupon.discount_value

        result = {
            "valid": True,
            "message": "Coupon is valid",
            "code": code.upper(),
            "discount_type": coupon.discount_type.value,
            "discount_value": float(coupon.discount_value),
            "discounted_amount": float(discount),
        }

        if self.redis:
            await self.redis.cache_set(cache_key, result, ttl=60)

        return result

    async def create_coupon(self, db, data: dict) -> Coupon:
        data["code"] = data["code"].upper()
        coupon = Coupon(**data)
        db.add(coupon)
        await db.flush()
        await db.refresh(coupon)
        return coupon

    async def list_coupons(
        self, db, page: int = 1, per_page: int = 20
    ) -> list[Coupon]:
        offset = (page - 1) * per_page
        result = await db.execute(
            select(Coupon).order_by(Coupon.created_at.desc())
            .offset(offset).limit(per_page)
        )
        return list(result.scalars().all())

    async def update_coupon(
        self, db, coupon_id: UUID, updates: dict,
    ) -> Coupon:
        result = await db.execute(
            select(Coupon).where(Coupon.id == coupon_id)
        )
        coupon = result.scalar_one_or_none()
        if not coupon:
            raise NotFoundError("Coupon not found")
        for key, value in updates.items():
            if value is not None and hasattr(coupon, key):
                setattr(coupon, key, value)
        await db.flush()
        await db.refresh(coupon)
        return coupon

    async def delete_coupon(self, db, coupon_id: UUID) -> None:
        result = await db.execute(
            select(Coupon).where(Coupon.id == coupon_id)
        )
        coupon = result.scalar_one_or_none()
        if not coupon:
            raise NotFoundError("Coupon not found")
        coupon.is_active = False
        await db.flush()

    async def apply_coupon(self, db, code: str) -> Coupon:
        # Atomic increment with limit check using UPDATE ... WHERE
        result = await db.execute(
            sql_update(Coupon)
            .where(
                Coupon.code == code.upper(),
                Coupon.is_active == True,
                (Coupon.usage_limit.is_(None)) | (Coupon.used_count < Coupon.usage_limit)
            )
            .values(used_count=Coupon.used_count + 1)
            .returning(Coupon.id, Coupon.code, Coupon.used_count)
        )
        row = result.fetchone()
        if not row:
            # Coupon doesn't exist or limit reached
            raise ValidationErrorException("Coupon not found or usage limit reached")
        await db.flush()
        # Re-fetch full object
        result2 = await db.execute(
            select(Coupon).where(Coupon.code == code.upper())
        )
        return result2.scalar_one()

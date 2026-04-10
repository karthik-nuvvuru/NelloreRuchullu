"""Coupon routes."""
from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import require_role
from app.database import get_db
from app.dependencies import get_coupon_service
from app.schemas.coupon import CouponCreate, CouponResponse, CouponUpdate, CouponValidationResponse
from app.services.coupon_service import CouponService

router = APIRouter(prefix="/coupons", tags=["Coupons"])


@router.get("/validate/{code}", response_model=CouponValidationResponse)
async def validate_coupon(
    code: str,
    order_amount: float = Query(ge=0),
    db: AsyncSession = Depends(get_db),
    coupon_service: CouponService = Depends(get_coupon_service),
):
    return await coupon_service.validate_coupon(db, code, order_amount)


@router.post("/apply/{code}")
async def apply_coupon(
    code: str,
    db: AsyncSession = Depends(get_db),
    coupon_service: CouponService = Depends(get_coupon_service),
):
    coupon = await coupon_service.apply_coupon(db, code)
    return {"message": "Coupon applied", "code": coupon.code, "used_count": coupon.used_count}


@router.post("", response_model=CouponResponse, status_code=201)
async def create_coupon(
    body: CouponCreate,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(require_role("admin")),
    coupon_service: CouponService = Depends(get_coupon_service),
):
    coupon = await coupon_service.create_coupon(
        db, body.model_dump(exclude_none=True)
    )
    return CouponResponse.model_validate(coupon)


@router.get("")
async def list_coupons(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _: str = Depends(require_role("admin")),
    coupon_service: CouponService = Depends(get_coupon_service),
):
    coupons = await coupon_service.list_coupons(db, page, per_page)
    return [CouponResponse.model_validate(c) for c in coupons]


@router.put("/{coupon_id}", response_model=CouponResponse)
async def update_coupon(
    coupon_id: UUID,
    body: CouponUpdate,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(require_role("admin")),
    coupon_service: CouponService = Depends(get_coupon_service),
):
    coupon = await coupon_service.update_coupon(
        db, coupon_id, body.model_dump(exclude_unset=True)
    )
    return CouponResponse.model_validate(coupon)


@router.delete("/{coupon_id}")
async def delete_coupon(
    coupon_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(require_role("admin")),
    coupon_service: CouponService = Depends(get_coupon_service),
):
    await coupon_service.delete_coupon(db, coupon_id)
    return {"message": "Coupon deleted"}

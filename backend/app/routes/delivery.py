"""Delivery tracking and management routes."""
from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user, require_role, TokenPayload
from app.database import get_db
from app.dependencies import get_delivery_service
from app.exceptions import AuthorizationError, NotFoundError
from app.models.delivery import Delivery
from app.models.order import Order
from app.services.delivery_service import DeliveryService

router = APIRouter(prefix="/delivery", tags=["Delivery"])


@router.get("/track/{order_id}")
async def track_order(
    order_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenPayload = Depends(get_current_user),
    delivery_service: DeliveryService = Depends(get_delivery_service),
):
    # Verify user owns the order (or is admin/vendor/delivery)
    if current_user.role not in ("admin", "vendor", "delivery"):
        result = await db.execute(
            select(Order).where(Order.id == order_id, Order.user_id == UUID(current_user.sub))
        )
        if not result.scalar_one_or_none():
            raise AuthorizationError("Access denied")
    return await delivery_service.get_delivery(db, order_id)


@router.post("/assign/{order_id}")
async def assign_delivery(
    order_id: UUID,
    partner_id: UUID | None = None,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(require_role("admin", "vendor")),
    delivery_service: DeliveryService = Depends(get_delivery_service),
):
    if partner_id:
        result = await db.execute(select(Delivery).where(Delivery.order_id == order_id))
        delivery = result.scalar_one_or_none()
        if not delivery:
            raise NotFoundError("Delivery record not found")
        return await delivery_service.assign_delivery(db, delivery.id, partner_id)
    else:
        return await delivery_service.auto_assign_delivery(db, order_id)


@router.post("/{delivery_id}/status")
async def update_delivery_status(
    delivery_id: UUID,
    status: str,
    db: AsyncSession = Depends(get_db),
    _: TokenPayload = Depends(require_role(["admin", "vendor", "delivery"])),
    delivery_service: DeliveryService = Depends(get_delivery_service),
):
    return await delivery_service.update_status(db, delivery_id, status)


@router.get("/available")
async def available_partners(
    db: AsyncSession = Depends(get_db),
    _: str = Depends(require_role("admin", "vendor")),
    delivery_service: DeliveryService = Depends(get_delivery_service),
):
    return await delivery_service.get_available_partners(db)

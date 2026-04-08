"""Order management routes."""
from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user, require_role, TokenPayload
from app.database import get_db
from app.dependencies import get_order_service
from app.schemas.common import MessageResponse, PaginationResponse
from app.schemas.order import (
    OrderCancelRequest,
    OrderCreateRequest,
    OrderResponse,
    OrderStatusUpdate,
    OrderSummaryResponse,
)
from app.services.order_service import OrderService

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=dict, status_code=201)
async def create_order(
    body: OrderCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: TokenPayload = Depends(get_current_user),
    order_service: OrderService = Depends(get_order_service),
):
    order = await order_service.create_order(
        db, user_id=current_user.sub, address_id=body.address_id,
        payment_method=body.payment_method, notes=body.notes,
        coupon_code=body.coupon_code,
    )
    return {
        "id": str(order.id),
        "order_number": order.order_number,
        "status": order.status.value,
        "total_amount": order.total_amount,
        "items": [
            {
                "id": str(i.id), "name": i.name,
                "quantity": i.quantity, "total_price": float(i.total_price),
            }
            for i in order.items
        ],
        "created_at": order.created_at.isoformat(),
    }


# IMPORTANT: Static routes must be defined BEFORE parameterized routes
# Otherwise /my would match /{order_id} with order_id="my" and fail UUID validation

@router.get("/my", response_model=dict)
async def list_my_orders(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status_filter: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: TokenPayload = Depends(get_current_user),
    order_service: OrderService = Depends(get_order_service),
):
    orders, total = await order_service.list_user_orders(
        db, user_id=current_user.sub, page=page,
        per_page=per_page, status_filter=status_filter,
    )
    total_pages = (total + per_page - 1) // per_page if per_page else 0
    return {
        "items": [
            OrderSummaryResponse.model_validate(o)
            for o in orders
        ],
        "pagination": {
            "total": total, "page": page, "per_page": per_page,
            "total_pages": total_pages,
        },
    }


@router.get("", response_model=dict)
async def list_all_orders(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status_filter: str | None = None,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(require_role("admin", "vendor")),
    order_service: OrderService = Depends(get_order_service),
):
    orders, total = await order_service.list_all_orders(
        db, page=page, per_page=per_page, status_filter=status_filter,
    )
    total_pages = (total + per_page - 1) // per_page if per_page else 0
    return {
        "items": [
            OrderSummaryResponse.model_validate(o)
            for o in orders
        ],
        "pagination": {
            "total": total, "page": page, "per_page": per_page,
            "total_pages": total_pages,
        },
    }


@router.get("/{order_id}", response_model=dict)
async def get_order(
    order_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenPayload = Depends(get_current_user),
    order_service: OrderService = Depends(get_order_service),
):
    if current_user.role in ("admin", "vendor"):
        order = await order_service.get_admin_order(db, order_id)
    else:
        order = await order_service.get_order(db, order_id, current_user.sub)

    items_data = []
    for item in order.items:
        items_data.append({
            "id": str(item.id),
            "name": item.name,
            "quantity": item.quantity,
            "unit_price": float(item.unit_price),
            "total_price": float(item.total_price),
            "special_instructions": item.special_instructions,
        })

    delivery_info = {}
    if hasattr(order, 'delivery_record') and order.delivery_record:
        delivery_info = {
            "status": order.delivery_record.status.value,
        }

    return {
        "id": str(order.id),
        "order_number": order.order_number,
        "status": order.status.value,
        "subtotal": order.subtotal,
        "tax_amount": order.tax_amount,
        "discount_amount": order.discount_amount,
        "total_amount": order.total_amount,
        "delivery_fee": order.delivery_fee,
        "notes": order.notes,
        "coupon_code": order.coupon_code,
        "items": items_data,
        "delivery": delivery_info,
        "created_at": order.created_at.isoformat(),
        "updated_at": order.updated_at.isoformat(),
    }


@router.post("/{order_id}/cancel", response_model=dict)
async def cancel_order(
    order_id: UUID,
    body: OrderCancelRequest | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: TokenPayload = Depends(get_current_user),
    order_service: OrderService = Depends(get_order_service),
):
    order = await order_service.cancel_order(
        db, order_id, current_user.sub,
        reason=body.reason if body else None,
    )
    return {
        "id": str(order.id),
        "status": order.status.value,
        "cancelled_at": order.cancelled_at.isoformat() if order.cancelled_at else None,
    }


@router.post("/{order_id}/status", response_model=dict)
async def update_order_status(
    order_id: UUID,
    body: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(require_role("admin", "vendor")),
    order_service: OrderService = Depends(get_order_service),
):
    order = await order_service.update_status(db, order_id, body.status)
    return {
        "id": str(order.id),
        "order_number": order.order_number,
        "status": order.status.value,
    }

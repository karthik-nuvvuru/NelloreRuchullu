"""Analytics routes (admin only)."""
from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import require_role
from app.database import get_db
from app.models.order import Order, OrderStatus
from app.models.order_item import OrderItem
from app.models.user import User

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/overview")
async def get_analytics_overview(
    db: AsyncSession = Depends(get_db),
    _: str = Depends(require_role("admin")),
):
    total_orders_q = select(func.count(Order.id))
    result = await db.execute(total_orders_q)
    total_orders = result.scalar() or 0

    revenue_q = select(func.sum(Order.total_amount)).where(
        Order.status != OrderStatus.CANCELLED
    )
    result = await db.execute(revenue_q)
    total_revenue = result.scalar() or 0

    active_orders_q = select(func.count(Order.id)).where(
        Order.status.in_([
            OrderStatus.PENDING, OrderStatus.CONFIRMED,
            OrderStatus.PREPARING, OrderStatus.READY_FOR_PICKUP,
            OrderStatus.OUT_FOR_DELIVERY,
        ])
    )
    result = await db.execute(active_orders_q)
    active_orders = result.scalar() or 0

    total_users_q = select(func.count(User.id))
    result = await db.execute(total_users_q)
    total_users = result.scalar() or 0

    return {
        "total_orders": total_orders,
        "active_orders": active_orders,
        "total_revenue": float(total_revenue),
        "total_users": total_users,
        "avg_order_value": float(total_revenue / total_orders) if total_orders > 0 else 0,
    }


@router.get("/popular-items")
async def get_popular_items(
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    _: str = Depends(require_role("admin")),
):
    result = await db.execute(
        select(
            OrderItem.name,
            func.sum(OrderItem.quantity).label("total_quantity"),
            func.count(OrderItem.id).label("total_orders"),
        )
        .group_by(OrderItem.name)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(limit)
    )
    items = result.all()
    return [
        {"name": name, "total_quantity": qty, "total_orders": cnt}
        for name, qty, cnt in items
    ]


@router.get("/order-volume")
async def get_order_volume(
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
    _: str = Depends(require_role("admin")),
):
    from datetime import datetime, timedelta, timezone
    from sqlalchemy import cast, Date

    cutoff = datetime.now(timezone.utc) - timedelta(days=days)

    result = await db.execute(
        select(
            cast(Order.created_at, Date).label("date"),
            func.count(Order.id).label("count"),
            func.sum(Order.total_amount).label("revenue"),
        )
        .where(Order.created_at >= cutoff)
        .group_by(cast(Order.created_at, Date))
        .order_by(cast(Order.created_at, Date).desc())
    )
    rows = result.all()
    return {
        "data": [
            {"date": str(row.date), "orders": int(row.count), "revenue": float(row.revenue)}
            for row in rows
        ]
    }

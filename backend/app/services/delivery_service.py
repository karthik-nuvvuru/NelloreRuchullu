"""Delivery partner assignment and GPS tracking service."""
from __future__ import annotations

import logging
import random
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.websocket_manager import ConnectionManager
from app.exceptions import NotFoundError, ValidationErrorException
from app.models.delivery import Delivery, DeliveryStatus
from app.models.order import Order, OrderStatus
from app.models.user import User, UserRole

logger = logging.getLogger(__name__)

VALID_DELIVERY_TRANSITIONS = {
    DeliveryStatus.UNASSIGNED: {DeliveryStatus.ASSIGNED},
    DeliveryStatus.ASSIGNED: {DeliveryStatus.PICKED_UP, DeliveryStatus.IN_TRANSIT},
    DeliveryStatus.PICKED_UP: {DeliveryStatus.IN_TRANSIT},
    DeliveryStatus.IN_TRANSIT: {DeliveryStatus.DELIVERED},
    DeliveryStatus.DELIVERED: set(),
}


class DeliveryService:
    def __init__(
        self, ws_manager: ConnectionManager | None = None
    ):
        self.ws_manager = ws_manager

    async def get_delivery(self, db, order_id: UUID) -> Delivery:
        result = await db.execute(
            select(Delivery).where(Delivery.order_id == order_id)
        )
        delivery = result.scalar_one_or_none()
        if not delivery:
            raise NotFoundError("Delivery record not found")
        return delivery

    async def assign_delivery(
        self, db, delivery_id: UUID, partner_id: UUID
    ) -> Delivery:
        result = await db.execute(
            select(Delivery).where(Delivery.id == delivery_id)
        )
        delivery = result.scalar_one_or_none()
        if not delivery:
            raise NotFoundError("Delivery record not found")

        result = await db.execute(
            select(User).where(User.id == partner_id, User.role == UserRole.DELIVERY)
        )
        partner = result.scalar_one_or_none()
        if not partner:
            raise NotFoundError("Delivery partner not found")

        delivery.delivery_partner_id = partner_id
        delivery.status = DeliveryStatus.ASSIGNED
        await db.flush()
        await db.refresh(delivery)

        await self._broadcast_delivery_update(delivery)
        return delivery

    async def auto_assign_delivery(self, db, order_id: UUID) -> Delivery:
        result = await db.execute(
            select(User).where(User.role == UserRole.DELIVERY, User.is_active == True)
        )
        available = list(result.scalars().all())

        if not available:
            raise NotFoundError("No delivery partners available")

        partner = random.choice(available)

        result = await db.execute(
            select(Delivery).where(Delivery.order_id == order_id)
        )
        delivery = result.scalar_one_or_none()

        if not delivery:
            delivery = Delivery(order_id=order_id)
            db.add(delivery)

        delivery.delivery_partner_id = partner.id
        delivery.status = DeliveryStatus.ASSIGNED
        await db.flush()
        await db.refresh(delivery)

        await self._broadcast_delivery_update(delivery)
        return delivery

    async def update_status(
        self, db, delivery_id: UUID, status: str
    ) -> Delivery:
        result = await db.execute(
            select(Delivery).where(Delivery.id == delivery_id)
        )
        delivery = result.scalar_one_or_none()
        if not delivery:
            raise NotFoundError("Delivery record not found")

        new_status = DeliveryStatus(status)
        if new_status not in VALID_DELIVERY_TRANSITIONS.get(delivery.status, set()):
            raise ValidationErrorException(
                f"Invalid status transition from '{delivery.status.value}' to '{new_status.value}'"
            )

        delivery.status = new_status
        now = datetime.now(timezone.utc)

        if status == "picked_up":
            delivery.picked_up_at = now
        elif status == "delivered":
            delivery.delivered_at = now

        if status == "in_transit":
            delivery.estimated_time_minutes = random.randint(15, 30)

        await db.flush()
        await db.refresh(delivery)
        await self._broadcast_delivery_update(delivery)
        return delivery

    async def update_location(
        self, db, delivery_id: UUID, latitude: float, longitude: float
    ) -> dict:
        result = await db.execute(
            select(Delivery).where(Delivery.id == delivery_id)
        )
        delivery = result.scalar_one_or_none()
        if not delivery:
            raise NotFoundError("Delivery record not found")

        delivery.current_latitude = latitude
        delivery.current_longitude = longitude
        await db.flush()

        if self.ws_manager:
            await self.ws_manager.broadcast_order_update(
                str(delivery.order_id),
                {
                    "type": "location_update",
                    "latitude": latitude,
                    "longitude": longitude,
                },
            )

        return {"status": "ok", "latitude": latitude, "longitude": longitude}

    async def mock_gps_update(self, db) -> dict:
        """Simulate GPS movement for assigned/in_transit deliveries."""
        import secrets
        result = await db.execute(
            select(Delivery).where(
                Delivery.status.in_(
                    [DeliveryStatus.ASSIGNED, DeliveryStatus.IN_TRANSIT]
                )
            )
        )
        updates = []
        for delivery in result.scalars().all():
            lat = delivery.current_latitude or 14.4426
            lng = delivery.current_longitude or 78.2232
            # Move slightly
            new_lat = lat + random.uniform(-0.001, 0.001)
            new_lng = lng + random.uniform(-0.001, 0.001)
            delivery.current_latitude = new_lat
            delivery.current_longitude = new_lng
            updates.append({
                "delivery_id": str(delivery.id),
                "latitude": new_lat,
                "longitude": new_lng,
            })
        await db.flush()
        return {"updated": len(updates), "deliveries": updates}

    async def get_available_partners(self, db) -> list[User]:
        result = await db.execute(
            select(User).where(
                User.role == UserRole.DELIVERY,
                User.is_active == True,
            )
        )
        return list(result.scalars().all())

    async def _broadcast_delivery_update(
        self, delivery: Delivery
    ) -> None:
        if self.ws_manager:
            await self.ws_manager.broadcast_order_update(
                str(delivery.order_id),
                {
                    "type": "delivery_update",
                    "delivery_id": str(delivery.id),
                    "status": delivery.status.value,
                    "partner_id": str(delivery.delivery_partner_id)
                    if delivery.delivery_partner_id else None,
                },
            )

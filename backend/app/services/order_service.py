"""Order management service with event publishing."""
from __future__ import annotations

import logging
import uuid
from collections import defaultdict
from datetime import datetime, timezone
from decimal import Decimal
from enum import StrEnum
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from app.core.redis_client import RedisClient
from app.core.websocket_manager import ConnectionManager
from app.exceptions import ConflictError, NotFoundError, ValidationErrorException
from app.models.address import Address
from app.models.cart import Cart
from app.models.cart_item import CartItem
from app.models.delivery import Delivery, DeliveryStatus
from app.models.menu_item import MenuItem
from app.models.order import Order, OrderStatus
from app.models.order_item import OrderItem
from app.models.payment import Payment, PaymentMethod, PaymentStatus

logger = logging.getLogger(__name__)

TAX_RATE = Decimal("0.05")
DELIVERY_FEE = Decimal("40.00")


class OrderService:
    def __init__(
        self, redis_client: RedisClient | None = None,
        ws_manager: ConnectionManager | None = None
    ):
        self.redis = redis_client
        self.ws_manager = ws_manager

    def _generate_order_number(self) -> str:
        """Generate order number like NR-000001"""
        import secrets
        sequence = secrets.token_hex(3)
        return f"NR-{sequence.upper()}"

    async def create_order(
        self, db, user_id: str, address_id: UUID,
        payment_method: str, notes: str | None = None,
        coupon_code: str | None = None
    ) -> Order:
        cart_result = await db.execute(
            select(Cart).where(
                Cart.user_id == user_id, Cart.is_active == True
            ).options(selectinload(Cart.items))
        )
        cart = cart_result.scalar_one_or_none()
        if not cart or not cart.items:
            raise ValidationErrorException("Cart is empty")

        subtotal = Decimal("0")
        order_items = []

        for cart_item in cart.items:
            result = await db.execute(
                select(MenuItem).where(MenuItem.id == cart_item.menu_item_id)
            )
            menu_item = result.scalar_one_or_none()
            if not menu_item or not menu_item.is_available:
                raise ValidationErrorException(
                    f"Item '{cart_item.menu_item_id}' is not available"
                )

            if menu_item.stock and cart_item.quantity > menu_item.stock:
                raise ValidationErrorException(
                    f"Insufficient stock for '{menu_item.name}'"
                )

            unit_price = menu_item.price
            total_price = Decimal(str(unit_price)) * cart_item.quantity
            subtotal += total_price

            order_item = OrderItem(
                menu_item_id=menu_item.id,
                name=menu_item.name,
                quantity=cart_item.quantity,
                unit_price=Decimal(str(unit_price)),
                total_price=total_price,
                special_instructions=cart_item.special_instructions,
            )
            order_items.append(order_item)

            # Decrease stock
            if menu_item.stock is not None:
                menu_item.stock -= cart_item.quantity

        tax = round(subtotal * TAX_RATE, 2)
        discount = Decimal("0")
        total = subtotal + tax + DELIVERY_FEE - discount

        payment_method_enum = PaymentMethod(payment_method)
        order = Order(
            user_id=user_id,
            order_number=self._generate_order_number(),
            subtotal=float(subtotal),
            tax_amount=float(tax),
            total_amount=float(total),
            delivery_fee=float(DELIVERY_FEE),
            delivery_address_id=address_id,
            coupon_code=coupon_code,
            notes=notes,
        )
        db.add(order)
        await db.flush()
        await db.refresh(order, ["id"])

        for oi in order_items:
            oi.order_id = order.id
            db.add(oi)

        payment = Payment(
            order_id=order.id,
            user_id=user_id,
            amount=float(total),
            payment_method=payment_method_enum,
            status=PaymentStatus.PENDING
            if payment_method_enum == PaymentMethod.ONLINE
            else PaymentStatus.INITIATED,
        )
        db.add(payment)

        # Create delivery record
        delivery = Delivery(
            order_id=order.id,
            status=DeliveryStatus.UNASSIGNED,
        )
        db.add(delivery)

        # Clear cart
        cart.is_active = False
        new_cart = Cart(user_id=user_id, is_active=True)
        db.add(new_cart)

        await db.flush()
        await db.refresh(order)

        # Load relationships for response
        await db.refresh(order, ["items", "payment", "delivery_record"])

        # Publish event
        await self._publish_event("order.created", {
            "order_id": str(order.id),
            "user_id": user_id,
            "order_number": order.order_number,
            "status": order.status.value,
        })

        logger.info(f"Order {order.order_number} created by user {user_id}")
        return order

    async def get_order(self, db, order_id: UUID, user_id: str) -> Order:
        result = await db.execute(
            select(Order).where(
                Order.id == order_id,
                Order.user_id == user_id,
                Order.deleted_at.is_(None),
            ).options(
                selectinload(Order.items),
                selectinload(Order.delivery_record)
            )
        )
        order = result.scalar_one_or_none()
        if not order:
            raise NotFoundError("Order not found")
        return order

    async def get_admin_order(self, db, order_id: UUID) -> Order:
        result = await db.execute(
            select(Order).where(Order.id == order_id).options(
                selectinload(Order.items),
                selectinload(Order.delivery_record),
                selectinload(Order.payment),
            )
        )
        order = result.scalar_one_or_none()
        if not order:
            raise NotFoundError("Order not found")
        return order

    async def list_user_orders(
        self, db, user_id: str, page: int = 1, per_page: int = 20,
        status_filter: str | None = None
    ) -> tuple[list[Order], int]:
        filters = [Order.user_id == user_id, Order.deleted_at.is_(None)]
        if status_filter:
            filters.append(Order.status == OrderStatus(status_filter))

        count_q = select(func.count(Order.id)).where(*filters)
        result = await db.execute(count_q)
        total = result.scalar() or 0

        offset = (page - 1) * per_page
        query = (
            select(Order)
            .where(*filters)
            .order_by(Order.created_at.desc())
            .offset(offset)
            .limit(per_page)
        )
        result = await db.execute(query)
        return list(result.scalars().all()), int(total)

    async def list_all_orders(
        self, db, page: int = 1, per_page: int = 20,
        status_filter: str | None = None,
        date_from: str | None = None,
        date_to: str | None = None,
    ) -> tuple[list[Order], int]:
        filters = [Order.deleted_at.is_(None)]
        if status_filter:
            filters.append(Order.status == OrderStatus(status_filter))

        count_q = select(func.count(Order.id)).where(*filters)
        result = await db.execute(count_q)
        total = result.scalar() or 0

        offset = (page - 1) * per_page
        query = (
            select(Order)
            .where(*filters)
            .order_by(Order.created_at.desc())
            .offset(offset)
            .limit(per_page)
        )
        result = await db.execute(query)
        return list(result.scalars().all()), int(total)

    async def update_status(
        self, db, order_id: UUID, new_status: str
    ) -> Order:
        result = await db.execute(
            select(Order).options(
                selectinload(Order.delivery_record),
                selectinload(Order.payment),
            ).where(Order.id == order_id)
        )
        order = result.scalar_one_or_none()
        if not order:
            raise NotFoundError("Order not found")

        if order.status == OrderStatus.CANCELLED:
            raise ValidationErrorException("Cannot update cancelled order")
        if order.status == OrderStatus.DELIVERED:
            raise ValidationErrorException("Order is already delivered")

        order.status = OrderStatus(new_status)

        delivery_status_map = {
            OrderStatus.CONFIRMED: DeliveryStatus.ASSIGNED,
            OrderStatus.READY_FOR_PICKUP: DeliveryStatus.PICKED_UP,
            OrderStatus.OUT_FOR_DELIVERY: DeliveryStatus.IN_TRANSIT,
            OrderStatus.DELIVERED: DeliveryStatus.DELIVERED,
        }

        new_status_enum = OrderStatus(new_status)
        await self._publish_event("order.status_changed", {
            "order_id": str(order_id),
            "status": new_status,
            "order_number": order.order_number,
        })

        # Broadcast via WebSocket
        if self.ws_manager:
            await self.ws_manager.broadcast_order_update(
                str(order_id),
                {
                    "order_id": str(order_id),
                    "order_number": order.order_number,
                    "status": new_status,
                }
            )
            await self.ws_manager.broadcast_kitchen({
                "order_id": str(order_id),
                "order_number": order.order_number,
                "status": new_status,
            })
        await db.flush()
        return order

    async def cancel_order(
        self, db, order_id: UUID, user_id: str,
        reason: str | None = None
    ) -> Order:
        result = await db.execute(
            select(Order).where(
                Order.id == order_id, Order.user_id == user_id
            )
        )
        order = result.scalar_one_or_none()
        if not order:
            raise NotFoundError("Order not found")

        if order.status in [OrderStatus.DELIVERED, OrderStatus.CANCELLED]:
            raise ValidationErrorException(
                "Cannot cancel order in current status"
            )

        order.status = OrderStatus.CANCELLED
        order.cancelled_at = datetime.now(timezone.utc)
        order.cancelled_reason = reason

        await self._publish_event("order.cancelled", {
            "order_id": str(order_id),
            "reason": reason,
        })

        if self.ws_manager:
            await self.ws_manager.broadcast_order_update(
                str(order_id), {
                    "order_id": str(order_id),
                    "status": "cancelled",
                    "reason": reason,
                }
            )
        await db.flush()
        return order

    async def _publish_event(self, event_type: str, payload: dict) -> None:
        if self.redis:
            await self.redis.publish(
                "order:events",
                {"event": event_type, "data": payload},
            )
        logger.info(f"Event published: {event_type}")

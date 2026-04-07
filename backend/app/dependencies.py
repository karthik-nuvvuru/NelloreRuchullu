"""Dependency injection for services and shared state."""

from __future__ import annotations

from collections.abc import AsyncGenerator
from functools import lru_cache
from typing import TYPE_CHECKING

from fastapi import Depends
from redis.asyncio import Redis

from app.config import settings
from app.core.redis_client import RedisClient
from app.core.websocket_manager import ConnectionManager

# ── Services (imported lazily) ───────────────────────────────────────────────

if TYPE_CHECKING:
    from app.services.auth_service import AuthService
    from app.services.cart_service import CartService
    from app.services.coupon_service import CouponService
    from app.services.delivery_service import DeliveryService
    from app.services.menu_service import MenuService
    from app.services.notification_service import NotificationService
    from app.services.order_service import OrderService
    from app.services.payment_service import PaymentService
    from app.services.review_service import ReviewService
    from app.services.user_service import UserService

# ── Lazy service instantiation ───────────────────────────────────────────────

_service_cache = {}


def get_redis_client() -> RedisClient:
    """Get shared RedisClient instance."""
    if "redis_client" not in _service_cache:
        _service_cache["redis_client"] = RedisClient(settings.redis_url)
    return _service_cache["redis_client"]


def get_connection_manager() -> ConnectionManager:
    """Get singleton WebSocket connection manager."""
    if "ws_manager" not in _service_cache:
        _service_cache["ws_manager"] = ConnectionManager()
    return _service_cache["ws_manager"]


async def get_auth_service() -> AsyncGenerator[AuthService, None]:
    from app.services.auth_service import AuthService

    service = AuthService(redis_client=get_redis_client())
    try:
        yield service
    finally:
        pass


async def get_user_service() -> AsyncGenerator[UserService, None]:
    from app.services.user_service import UserService

    service = UserService(redis_client=get_redis_client())
    try:
        yield service
    finally:
        pass


async def get_menu_service() -> AsyncGenerator[MenuService, None]:
    from app.services.menu_service import MenuService

    service = MenuService(redis_client=get_redis_client())
    try:
        yield service
    finally:
        pass


async def get_cart_service() -> AsyncGenerator[CartService, None]:
    from app.services.cart_service import CartService

    service = CartService(redis_client=get_redis_client())
    try:
        yield service
    finally:
        pass


async def get_order_service() -> AsyncGenerator[OrderService, None]:
    from app.services.order_service import OrderService

    service = OrderService(
        redis_client=get_redis_client(),
        ws_manager=get_connection_manager(),
    )
    try:
        yield service
    finally:
        pass


async def get_payment_service() -> AsyncGenerator[PaymentService, None]:
    from app.services.payment_service import PaymentService

    service = PaymentService()
    try:
        yield service
    finally:
        pass


async def get_delivery_service() -> AsyncGenerator[DeliveryService, None]:
    from app.services.delivery_service import DeliveryService

    service = DeliveryService(ws_manager=get_connection_manager())
    try:
        yield service
    finally:
        pass


async def get_notification_service() -> AsyncGenerator[NotificationService, None]:
    from app.services.notification_service import NotificationService

    service = NotificationService()
    try:
        yield service
    finally:
        pass


async def get_review_service() -> AsyncGenerator[ReviewService, None]:
    from app.services.review_service import ReviewService

    service = ReviewService()
    try:
        yield service
    finally:
        pass


async def get_coupon_service() -> AsyncGenerator[CouponService, None]:
    from app.services.coupon_service import CouponService

    service = CouponService()
    try:
        yield service
    finally:
        pass

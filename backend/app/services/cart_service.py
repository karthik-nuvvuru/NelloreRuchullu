"""Cart management service."""
from __future__ import annotations

import logging
from decimal import Decimal
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from app.core.redis_client import RedisClient
from app.exceptions import NotFoundError
from app.models.cart import Cart
from app.models.cart_item import CartItem
from app.models.menu_item import MenuItem

logger = logging.getLogger(__name__)


TAX_RATE = Decimal("0.05")  # 5% tax


class CartService:
    def __init__(self, redis_client: RedisClient | None = None):
        self.redis = redis_client

    async def get_or_create_cart(self, db, user_id: str) -> Cart:
        user_uuid = UUID(user_id)
        result = await db.execute(
            select(Cart).where(
                Cart.user_id == user_uuid, Cart.is_active == True
            ).options(selectinload(Cart.items))
        )
        cart = result.scalar_one_or_none()
        if not cart:
            cart = Cart(user_id=user_uuid, is_active=True)
            db.add(cart)
            await db.flush()
            await db.refresh(cart, ["id"])
            await db.refresh(cart)
        return cart

    async def get_cart(self, db, user_id: str) -> dict:
        cart = await self.get_or_create_cart(db, user_id)

        items_response = []
        subtotal = Decimal("0")

        for ci in cart.items:
            result = await db.execute(
                select(MenuItem).where(MenuItem.id == ci.menu_item_id)
            )
            menu_item = result.scalar_one_or_none()
            if not menu_item or not menu_item.is_available:
                continue
            total_price = Decimal(str(menu_item.price)) * ci.quantity
            subtotal += total_price
            items_response.append({
                "id": str(ci.id),
                "menu_item_id": str(ci.menu_item_id),
                "item_name": menu_item.name,
                "price": menu_item.price,
                "quantity": ci.quantity,
                "special_instructions": ci.special_instructions,
                "total_price": float(total_price),
            })

        tax = round(subtotal * TAX_RATE, 2)
        total = subtotal + tax

        return {
            "id": str(cart.id),
            "items": items_response,
            "subtotal": float(subtotal),
            "tax": float(tax),
            "total": float(total),
            "item_count": sum(item["quantity"] for item in items_response),
            "created_at": cart.created_at.isoformat(),
        }

    async def add_item(self, db, user_id: str, menu_item_id: UUID,
                       quantity: int = 1,
                       special_instructions: str | None = None) -> dict:
        cart = await self.get_or_create_cart(db, user_id)

        # Check if item already in cart
        result = await db.execute(
            select(CartItem).where(
                CartItem.cart_id == cart.id,
                CartItem.menu_item_id == menu_item_id,
            )
        )
        existing = result.scalar_one_or_none()

        result = await db.execute(
            select(MenuItem).where(MenuItem.id == menu_item_id)
        )
        menu_item = result.scalar_one_or_none()
        if not menu_item or not menu_item.is_available:
            raise NotFoundError("Menu item not available")
        if menu_item.stock and quantity > menu_item.stock:
            raise ValueError(
                f"Only {menu_item.stock} items available in stock"
            )

        if existing:
            existing.quantity += quantity
        else:
            cart_item = CartItem(
                cart_id=cart.id,
                menu_item_id=menu_item_id,
                quantity=quantity,
                special_instructions=special_instructions,
            )
            db.add(cart_item)

        await db.flush()
        return await self.get_cart(db, user_id)

    async def update_item(self, db, user_id: str, item_id: UUID,
                          quantity: int) -> dict:
        cart = await self.get_or_create_cart(db, user_id)
        result = await db.execute(
            select(CartItem).where(
                CartItem.id == item_id,
                CartItem.cart_id == cart.id,
            )
        )
        cart_item = result.scalar_one_or_none()
        if not cart_item:
            raise NotFoundError("Cart item not found")
        cart_item.quantity = quantity
        await db.flush()
        return await self.get_cart(db, user_id)

    async def remove_item(self, db, user_id: str, item_id: UUID) -> dict:
        cart = await self.get_or_create_cart(db, user_id)
        result = await db.execute(
            select(CartItem).where(
                CartItem.id == item_id,
                CartItem.cart_id == cart.id,
            )
        )
        cart_item = result.scalar_one_or_none()
        if not cart_item:
            raise NotFoundError("Cart item not found")
        await db.delete(cart_item)
        await db.flush()
        return await self.get_cart(db, user_id)

    async def clear_cart(self, db, user_id: str) -> dict:
        cart = await self.get_or_create_cart(db, user_id)
        # Deactivate old cart and create new one
        cart.is_active = False
        await db.flush()
        # Create fresh cart
        new_cart = Cart(user_id=user_id, is_active=True)
        db.add(new_cart)
        await db.flush()
        return {
            "id": str(new_cart.id),
            "items": [],
            "subtotal": 0,
            "tax": 0,
            "total": 0,
            "item_count": 0,
            "created_at": new_cart.created_at.isoformat(),
        }

"""Cart management routes."""
from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user, TokenPayload
from app.database import get_db
from app.dependencies import get_cart_service
from app.schemas.cart import CartItemAdd, CartItemUpdate, CartResponse
from app.services.cart_service import CartService

router = APIRouter(prefix="/cart", tags=["Cart"])


@router.get("")
async def get_cart(
    db: AsyncSession = Depends(get_db),
    current_user: TokenPayload = Depends(get_current_user),
    cart_service: CartService = Depends(get_cart_service),
):
    return await cart_service.get_cart(db, current_user.sub)


@router.post("/items")
async def add_to_cart(
    body: CartItemAdd,
    db: AsyncSession = Depends(get_db),
    current_user: TokenPayload = Depends(get_current_user),
    cart_service: CartService = Depends(get_cart_service),
):
    return await cart_service.add_item(
        db, current_user.sub, body.menu_item_id,
        body.quantity, body.special_instructions,
    )


@router.put("/items/{item_id}")
async def update_cart_item(
    item_id: UUID,
    body: CartItemUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: TokenPayload = Depends(get_current_user),
    cart_service: CartService = Depends(get_cart_service),
):
    return await cart_service.update_item(
        db, current_user.sub, item_id, body.quantity,
    )


@router.delete("/items/{item_id}")
async def remove_cart_item(
    item_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenPayload = Depends(get_current_user),
    cart_service: CartService = Depends(get_cart_service),
):
    return await cart_service.remove_item(db, current_user.sub, item_id)


@router.delete("")
async def clear_cart(
    db: AsyncSession = Depends(get_db),
    current_user: TokenPayload = Depends(get_current_user),
    cart_service: CartService = Depends(get_cart_service),
):
    return await cart_service.clear_cart(db, current_user.sub)

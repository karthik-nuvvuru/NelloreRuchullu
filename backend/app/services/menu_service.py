"""Menu and category management service."""
from __future__ import annotations

import logging
from typing import Any
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from app.config import settings
from app.core.redis_client import RedisClient
from app.exceptions import NotFoundError
from app.models.category import Category
from app.models.menu_item import MenuItem

logger = logging.getLogger(__name__)


class MenuService:
    def __init__(self, redis_client: RedisClient | None = None):
        self.redis = redis_client

    async def list_items(
        self, db, category_id: UUID | None = None,
        search: str | None = None, is_vegetarian: bool | None = None,
        min_price: float | None = None, max_price: float | None = None,
        page: int = 1, per_page: int = 20
    ) -> tuple[list[MenuItem], int]:
        filters = [MenuItem.is_deleted == False, MenuItem.is_available == True]

        if category_id:
            filters.append(MenuItem.category_id == category_id)
        if search:
            filters.append(MenuItem.name.ilike(f"%{search}%"))
        if is_vegetarian is not None:
            filters.append(MenuItem.is_vegetarian == is_vegetarian)
        if min_price is not None:
            filters.append(MenuItem.price >= min_price)
        if max_price is not None:
            filters.append(MenuItem.price <= max_price)

        count_q = select(func.count(MenuItem.id)).where(*filters)
        result = await db.execute(count_q)
        total = result.scalar() or 0

        offset = (page - 1) * per_page
        query = (
            select(MenuItem)
            .options(selectinload(MenuItem.category))
            .where(*filters)
            .order_by(MenuItem.name.asc())
            .offset(offset)
            .limit(per_page)
        )
        result = await db.execute(query)
        items = result.scalars().all()
        return list(items), total

    async def get_item(self, db, item_id: UUID) -> MenuItem:
        result = await db.execute(
            select(MenuItem).options(selectinload(MenuItem.category))
            .where(MenuItem.id == item_id, MenuItem.is_deleted == False)
        )
        item = result.scalar_one_or_none()
        if not item:
            raise NotFoundError("Menu item not found")
        return item

    async def create_item(self, db, data: dict) -> MenuItem:
        item = MenuItem(**data)
        db.add(item)
        await db.flush()
        await db.refresh(item)
        logger.info(f"Created menu item: {item.name}")
        return item

    async def update_item(self, db, item_id: UUID,
                          updates: dict[str, Any]) -> MenuItem:
        item = await self.get_item(db, item_id)
        for key, value in updates.items():
            if value is not None and hasattr(item, key):
                setattr(item, key, value)
        await db.flush()
        await db.refresh(item)
        return item

    async def delete_item(self, db, item_id: UUID) -> None:
        item = await self.get_item(db, item_id)
        item.is_deleted = True
        item.is_available = False
        await db.flush()

    async def list_categories(
        self, db, active_only: bool = True
    ) -> list[Category]:
        filters = []
        if active_only:
            filters.append(Category.is_active == True)
        result = await db.execute(
            select(Category).where(*filters)
            .order_by(Category.sort_order.asc())
        )
        return list(result.scalars().all())

    async def create_category(self, db, data: dict) -> Category:
        cat = Category(**data)
        db.add(cat)
        await db.flush()
        await db.refresh(cat)
        return cat

    async def update_category(
        self, db, cat_id: UUID, updates: dict[str, Any]
    ) -> Category:
        result = await db.execute(
            select(Category).where(Category.id == cat_id)
        )
        cat = result.scalar_one_or_none()
        if not cat:
            raise NotFoundError("Category not found")
        for key, value in updates.items():
            if value is not None and hasattr(cat, key):
                setattr(cat, key, value)
        await db.flush()
        await db.refresh(cat)
        return cat

    async def delete_category(self, db, cat_id: UUID) -> None:
        result = await db.execute(
            select(Category).where(Category.id == cat_id)
        )
        cat = result.scalar_one_or_none()
        if not cat:
            raise NotFoundError("Category not found")
        cat.is_active = False
        await db.flush()

    async def get_category_id_by_name(self, db, name: str) -> UUID | None:
        """Look up category ID by name for filtering."""
        result = await db.execute(
            select(Category).where(Category.name.ilike(f"%{name}%"))
        )
        cat = result.scalar_one_or_none()
        return cat.id if cat else None

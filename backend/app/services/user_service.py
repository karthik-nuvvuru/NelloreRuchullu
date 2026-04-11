"""User management service."""
from __future__ import annotations

import logging
from typing import Any
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from app.core.redis_client import RedisClient
from app.exceptions import NotFoundError
from app.models.user import User, UserRole, UserStatus

logger = logging.getLogger(__name__)


class UserService:
    def __init__(self, redis_client: RedisClient | None = None):
        self.redis = redis_client

    async def get_profile(self, db, user_id: str) -> User:
        cache_key = f"user:profile:{user_id}"
        if self.redis:
            cached = await self.redis.cache_get(cache_key)
            if cached:
                return User(**cached)  # Would need more logic, skip for now

        result = await db.execute(
            select(User).where(User.id == user_id)
            .options(selectinload(User.addresses))
        )
        user = result.scalar_one_or_none()
        if not user:
            raise NotFoundError("User not found")
        return user

    async def update_profile(self, db, user_id: str,
                             updates: dict[str, Any]) -> User:
        result = await db.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        if not user:
            raise NotFoundError("User not found")

        allowed = {"first_name", "last_name", "avatar_url"}
        for key, value in updates.items():
            if key in allowed and value is not None:
                setattr(user, key, value)

        await db.flush()
        await db.refresh(user)
        return user

    async def list_users(
        self, db, page: int = 1, per_page: int = 20,
        role: str | None = None, status_filter: str | None = None
    ) -> tuple[list[User], int]:
        filters = [User.deleted_at.is_(None)]
        if role:
            filters.append(User.role == UserRole(role))
        if status_filter:
            filters.append(User.status == UserStatus(status_filter))

        count_q = select(func.count(User.id)).where(*filters)
        result = await db.execute(count_q)
        total = result.scalar() or 0

        offset = (page - 1) * per_page
        query = (
            select(User)
            .where(*filters)
            .order_by(User.created_at.desc())
            .offset(offset)
            .limit(per_page)
        )
        result = await db.execute(query)
        users = result.scalars().all()
        return list(users), total

    async def change_role(self, db, user_id: str, new_role: str) -> User:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise NotFoundError("User not found")
        user.role = UserRole(new_role)
        await db.flush()
        await db.refresh(user)
        return user

    async def delete_user(self, db, user_id: str) -> None:
        from datetime import datetime, timezone
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise NotFoundError("User not found")
        user.deleted_at = datetime.now(timezone.utc)
        user.status = UserStatus.INACTIVE
        await db.flush()

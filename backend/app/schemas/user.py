"""Pydantic v2 schemas for user endpoints."""

from __future__ import annotations

from datetime import datetime
from enum import StrEnum
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from app.models.user import UserRole, UserStatus


class UpdateProfileRequest(BaseModel):
    first_name: str | None = Field(default=None, min_length=1, max_length=100)
    last_name: str | None = Field(default=None, min_length=1, max_length=100)
    avatar_url: str | None = None


class ChangeUserRoleRequest(BaseModel):
    role: UserRole


class UserResponse(BaseModel):
    id: UUID
    email: str | None
    phone: str | None
    first_name: str
    last_name: str
    full_name: str
    role: UserRole
    status: UserStatus
    avatar_url: str | None
    is_verified: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserListItem(BaseModel):
    id: UUID
    email: str | None
    phone: str | None
    first_name: str
    last_name: str
    role: UserRole
    status: UserStatus
    created_at: datetime

    model_config = {"from_attributes": True}

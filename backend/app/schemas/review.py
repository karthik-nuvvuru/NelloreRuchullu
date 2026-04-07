"""Pydantic v2 schemas for review endpoints."""

from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    order_id: UUID
    menu_item_id: UUID | None = None
    rating: int = Field(ge=1, le=5)
    comment: str | None = None


class ReviewResponse(BaseModel):
    id: UUID
    user_id: UUID
    menu_item_id: UUID | None
    order_id: UUID
    rating: int
    comment: str | None
    user_name: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ItemRatingSummary(BaseModel):
    item_id: UUID
    average_rating: float
    total_reviews: int
    reviews: list[ReviewResponse]

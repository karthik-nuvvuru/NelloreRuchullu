"""Review service for ratings and comments."""
from __future__ import annotations

import logging
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from app.exceptions import NotFoundError, ValidationErrorException
from app.models.order import Order, OrderStatus
from app.models.review import Review

logger = logging.getLogger(__name__)


class ReviewService:
    async def create_review(
        self, db, user_id: str, order_id: UUID,
        rating: int, comment: str | None = None,
        menu_item_id: UUID | None = None
    ) -> Review:
        # Verify user can review this order
        result = await db.execute(
            select(Order).where(
                Order.id == order_id,
                Order.user_id == user_id,
                Order.status == OrderStatus.DELIVERED,
            )
        )
        order = result.scalar_one_or_none()
        if not order:
            raise ValidationErrorException(
                "Can only review delivered orders that you own"
            )

        result = await db.execute(
            select(Review).where(
                Review.order_id == order_id,
                Review.user_id == user_id,
            )
        )
        if result.scalar_one_or_none():
            raise ValidationErrorException(
                "You have already reviewed this order"
            )

        review = Review(
            user_id=user_id,
            order_id=order_id,
            menu_item_id=menu_item_id,
            rating=rating,
            comment=comment,
        )
        db.add(review)
        await db.flush()
        await db.refresh(review)
        logger.info(
            f"Review: user={user_id}, order={order_id}, rating={rating}"
        )
        return review

    async def list_item_reviews(
        self, db, menu_item_id: UUID, page: int = 1, per_page: int = 20
    ) -> tuple[list[Review], int]:
        result = await db.execute(
            select(Review).where(Review.menu_item_id == menu_item_id)
            .order_by(Review.created_at.desc())
            .offset((page - 1) * per_page)
            .limit(per_page)
        )
        reviews = result.scalars().all()

        avg_result = await db.execute(
            select(func.avg(Review.rating)).where(
                Review.menu_item_id == menu_item_id
            )
        )
        total_result = await db.execute(
            select(func.count(Review.id)).where(
                Review.menu_item_id == menu_item_id
            )
        )
        avg_rating = float(avg_result.scalar() or 0)
        total = int(total_result.scalar() or 0)
        return list(reviews), total

    async def get_user_reviews(
        self, db, user_id: str, page: int = 1, per_page: int = 20
    ) -> list[Review]:
        result = await db.execute(
            select(Review).where(Review.user_id == user_id)
            .order_by(Review.created_at.desc())
            .offset((page - 1) * per_page)
            .limit(per_page)
        )
        return list(result.scalars().all())

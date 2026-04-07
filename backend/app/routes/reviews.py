"""Review routes."""
from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user, TokenPayload
from app.database import get_db
from app.dependencies import get_review_service
from app.schemas.review import ReviewCreate, ReviewResponse
from app.services.review_service import ReviewService

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.post("", response_model=ReviewResponse, status_code=201)
async def create_review(
    body: ReviewCreate,
    db: AsyncSession = Depends(get_db),
    current_user: TokenPayload = Depends(get_current_user),
    review_service: ReviewService = Depends(get_review_service),
):
    review = await review_service.create_review(
        db, current_user.sub, body.order_id,
        rating=body.rating, comment=body.comment,
        menu_item_id=body.menu_item_id,
    )
    return ReviewResponse(
        id=review.id, user_id=review.user_id,
        menu_item_id=review.menu_item_id, order_id=review.order_id,
        rating=review.rating, comment=review.comment,
        created_at=review.created_at,
    )


@router.get("/item/{item_id}")
async def list_item_reviews(
    item_id: UUID,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    review_service: ReviewService = Depends(get_review_service),
):
    reviews, total = await review_service.list_item_reviews(db, item_id, page, per_page)
    return {
        "item_id": str(item_id),
        "reviews": [
            ReviewResponse.model_validate(r)
            for r in reviews
        ],
        "total": total,
    }


@router.get("/my", response_model=list[ReviewResponse])
async def list_my_reviews(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: TokenPayload = Depends(get_current_user),
    review_service: ReviewService = Depends(get_review_service),
):
    reviews = await review_service.get_user_reviews(
        db, current_user.sub, page, per_page
    )
    return [ReviewResponse.model_validate(r) for r in reviews]

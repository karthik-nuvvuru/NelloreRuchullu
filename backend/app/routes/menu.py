"""Menu management routes."""
from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import require_role
from app.database import get_db
from app.dependencies import get_menu_service
from app.schemas.common import MessageResponse, PaginatedResponse, PaginationResponse
from app.schemas.menu import (
    CategoryCreate,
    CategoryResponse,
    CategoryUpdate,
    MenuItemCreate,
    MenuItemListResponse,
    MenuItemResponse,
    MenuItemUpdate,
)
from app.services.menu_service import MenuService

router = APIRouter(prefix="/menu", tags=["Menu"])


@router.get("", response_model=dict)
async def list_items(
    category_id: UUID | None = None,
    category_name: str | None = None,
    search: str | None = None,
    is_vegetarian: bool | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    menu_service: MenuService = Depends(get_menu_service),
):
    # If category_name is provided, look up the category_id first
    if category_name and not category_id:
        category_id = await menu_service.get_category_id_by_name(db, category_name)

    items, total = await menu_service.list_items(
        db, category_id=category_id, search=search,
        is_vegetarian=is_vegetarian, min_price=min_price,
        max_price=max_price, page=page, per_page=per_page,
    )
    total_pages = (total + per_page - 1) // per_page if per_page else 0
    return {
        "items": [
            {
                "id": str(i.id),
                "name": i.name,
                "description": i.description,
                "price": i.price,
                "image_url": i.image_url,
                "is_vegetarian": i.is_vegetarian,
                "is_available": i.is_available,
                "category_name": i.category.name if i.category else None,
            }
            for i in items
        ],
        "pagination": {
            "total": total, "page": page, "per_page": per_page,
            "total_pages": total_pages,
        },
    }


@router.get("/categories", response_model=list[CategoryResponse])
async def list_categories(
    active_only: bool = True,
    db: AsyncSession = Depends(get_db),
    menu_service: MenuService = Depends(get_menu_service),
):
    return await menu_service.list_categories(db, active_only=active_only)


@router.post("/categories", response_model=CategoryResponse, status_code=201)
async def create_category(
    body: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(require_role("admin")),
    menu_service: MenuService = Depends(get_menu_service),
):
    return await menu_service.create_category(db, body.model_dump(exclude_none=True))


@router.put("/categories/{cat_id}", response_model=CategoryResponse)
async def update_category(
    cat_id: UUID,
    body: CategoryUpdate,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(require_role("admin")),
    menu_service: MenuService = Depends(get_menu_service),
):
    return await menu_service.update_category(db, cat_id, body.model_dump(exclude_unset=True))


@router.delete("/categories/{cat_id}", response_model=MessageResponse)
async def delete_category(
    cat_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(require_role("admin")),
    menu_service: MenuService = Depends(get_menu_service),
):
    await menu_service.delete_category(db, cat_id)
    return {"message": "Category deleted"}


@router.get("/{item_id}", response_model=MenuItemResponse)
async def get_item(
    item_id: UUID,
    db: AsyncSession = Depends(get_db),
    menu_service: MenuService = Depends(get_menu_service),
):
    return await menu_service.get_item(db, item_id)


@router.post("", response_model=MenuItemResponse, status_code=201)
async def create_item(
    body: MenuItemCreate,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(require_role("admin", "vendor")),
    menu_service: MenuService = Depends(get_menu_service),
):
    return await menu_service.create_item(db, body.model_dump(exclude_none=True))


@router.put("/{item_id}", response_model=MenuItemResponse)
async def update_item(
    item_id: UUID,
    body: MenuItemUpdate,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(require_role("admin", "vendor")),
    menu_service: MenuService = Depends(get_menu_service),
):
    return await menu_service.update_item(db, item_id, body.model_dump(exclude_unset=True))


@router.delete("/{item_id}", response_model=MessageResponse)
async def delete_item(
    item_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(require_role("admin")),
    menu_service: MenuService = Depends(get_menu_service),
):
    await menu_service.delete_item(db, item_id)
    return {"message": "Menu item deleted"}

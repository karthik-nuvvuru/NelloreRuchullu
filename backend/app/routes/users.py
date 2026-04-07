"""User management routes."""
from __future__ import annotations

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user, require_role, TokenPayload
from app.database import get_db
from app.dependencies import get_user_service
from app.exceptions import NotFoundError
from app.schemas.common import MessageResponse, PaginationResponse
from app.schemas.user import (
    ChangeUserRoleRequest,
    UpdateProfileRequest,
    UserListItem,
    UserResponse,
)
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
async def get_my_profile(
    db: AsyncSession = Depends(get_db),
    current_user: TokenPayload = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
):
    user = await user_service.get_profile(db, current_user.sub)
    return UserResponse(
        id=user.id, email=user.email, phone=user.phone,
        first_name=user.first_name, last_name=user.last_name,
        full_name=user.full_name, role=user.role,
        status=user.status, avatar_url=user.avatar_url,
        is_verified=user.is_verified, created_at=user.created_at,
    )


@router.put("/me", response_model=UserResponse)
async def update_my_profile(
    body: UpdateProfileRequest,
    db: AsyncSession = Depends(get_db),
    current_user: TokenPayload = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
):
    user = await user_service.update_profile(
        db, current_user.sub, body.model_dump(exclude_unset=True)
    )
    return UserResponse(
        id=user.id, email=user.email, phone=user.phone,
        first_name=user.first_name, last_name=user.last_name,
        full_name=user.full_name, role=user.role,
        status=user.status, avatar_url=user.avatar_url,
        is_verified=user.is_verified, created_at=user.created_at,
    )


"""Address routes within users."""


from sqlalchemy import select
from app.models.address import Address


@router.get("/addresses")
async def list_addresses(
    db: AsyncSession = Depends(get_db),
    current_user: TokenPayload = Depends(get_current_user),
):
    result = await db.execute(
        select(Address).where(Address.user_id == current_user.sub)
    )
    addresses = result.scalars().all()
    return [
        {
            "id": str(a.id),
            "user_id": str(a.user_id),
            "address_line1": a.address_line1,
            "address_line2": a.address_line2,
            "city": a.city,
            "state": a.state,
            "country": a.country,
            "pincode": a.pincode,
            "landmark": a.landmark,
            "latitude": a.latitude,
            "longitude": a.longitude,
            "address_type": a.address_type.value,
            "is_default": a.is_default,
        }
        for a in addresses
    ]


@router.post("/addresses")
async def create_address(
    body: dict,
    db: AsyncSession = Depends(get_db),
    current_user: TokenPayload = Depends(get_current_user),
):
    from app.models.address import Address
    address = Address(user_id=current_user.sub, **body)
    db.add(address)
    await db.flush()
    await db.refresh(address)
    return {
        "id": str(address.id),
        "user_id": str(address.user_id),
        **{k: v for k, v in body.items() if k != "id"},
    }


@router.put("/addresses/{address_id}")
async def update_address(
    address_id: str,
    body: dict,
    db: AsyncSession = Depends(get_db),
    current_user: TokenPayload = Depends(get_current_user),
):
    result = await db.execute(
        select(Address).where(Address.id == address_id, Address.user_id == current_user.sub)
    )
    address = result.scalar_one_or_none()
    if not address:
        raise NotFoundError("Address not found")
    for k, v in body.items():
        if v is not None and hasattr(address, k):
            setattr(address, k, v)
    await db.flush()
    return {"message": "Address updated", "id": str(address.id)}


@router.delete("/addresses/{address_id}")
async def delete_address(
    address_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: TokenPayload = Depends(get_current_user),
):
    from sqlalchemy import update as sql_update
    await db.execute(
        sql_update(Address).where(
            Address.id == address_id, Address.user_id == current_user.sub
        ).values(deleted_at=__import__("datetime").datetime.now(
            __import__("datetime").timezone.utc
        ))
    )
    await db.flush()
    return {"message": "Address deleted"}


@router.get("")
async def list_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    role: str | None = None,
    status_filter: str | None = None,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(require_role("admin")),
    user_service: UserService = Depends(get_user_service),
):
    users, total = await user_service.list_users(
        db, page=page, per_page=per_page,
        role=role, status_filter=status_filter,
    )
    total_pages = (total + per_page - 1) // per_page if per_page else 0
    return {
        "items": [UserListItem.model_validate(u) for u in users],
        "pagination": {
            "total": total, "page": page, "per_page": per_page,
            "total_pages": total_pages,
        },
    }


@router.put("/{user_id}/role")
async def change_user_role(
    user_id: str,
    body: ChangeUserRoleRequest,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(require_role("admin")),
    user_service: UserService = Depends(get_user_service),
):
    user = await user_service.change_role(db, user_id, body.role.value)
    return {"id": str(user.id), "role": user.role.value}

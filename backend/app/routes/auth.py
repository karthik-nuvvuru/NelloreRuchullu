"""Authentication routes."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import TokenPayload, get_current_user
from app.database import get_db
from app.dependencies import get_auth_service
from app.schemas.auth import (
    AuthResponse,
    ChangePasswordRequest,
    LoginRequest,
    LoginResponse,
    OTPSendRequest,
    OTPVerifyRequest,
    RefreshTokenRequest,
    RegisterRequest,
)
from app.schemas.common import MessageResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=LoginResponse, status_code=201)
async def register(
    body: RegisterRequest,
    db: AsyncSession = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
):
    return await auth_service.register(
        db, email=body.email, password=body.password,
        first_name=body.first_name, last_name=body.last_name,
        phone=body.phone,
    )


@router.post("/login", response_model=LoginResponse)
async def login(
    body: LoginRequest,
    db: AsyncSession = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
):
    return await auth_service.login(
        db, email_or_phone=body.email_or_phone, password=body.password,
    )


@router.post("/otp/send", response_model=dict)
async def send_otp(
    body: OTPSendRequest,
    db: AsyncSession = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
):
    return await auth_service.send_otp(db, phone=body.phone)


@router.post("/otp/verify", response_model=LoginResponse)
async def verify_otp_and_login(
    body: OTPVerifyRequest,
    db: AsyncSession = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
):
    return await auth_service.verify_otp_and_login(
        db, phone=body.phone, code=body.code,
    )


@router.post("/refresh", response_model=AuthResponse)
async def refresh_token(
    body: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
):
    return await auth_service.refresh(db, refresh_token=body.refresh_token)


@router.post("/logout")
async def logout(
    body: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
    current_user: TokenPayload = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service),
):
    result = await auth_service.logout(db, user_id=current_user.sub, refresh_token=body.refresh_token)


@router.post("/password/reset")
async def change_password(
    body: ChangePasswordRequest,
    db: AsyncSession = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
    current_user=Depends(get_current_user),
):
    return await auth_service.change_password(
        db, user_id=current_user.sub,
        old_password=body.old_password, new_password=body.new_password,
    )

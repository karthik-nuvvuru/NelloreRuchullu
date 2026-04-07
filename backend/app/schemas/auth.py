"""Pydantic v2 schemas for authentication endpoints."""

from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field

from app.models.user import UserRole


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    phone: str | None = Field(default=None, min_length=10, max_length=20)


class LoginRequest(BaseModel):
    email_or_phone: str
    password: str


class OTPSendRequest(BaseModel):
    phone: str = Field(min_length=10, max_length=20)


class OTPVerifyRequest(BaseModel):
    phone: str
    code: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str = Field(min_length=8, max_length=128)


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    expires_in: int


class LoginResponse(BaseModel):
    user_id: str
    email: str | None
    phone: str | None
    first_name: str
    last_name: str
    role: UserRole
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    expires_in: int

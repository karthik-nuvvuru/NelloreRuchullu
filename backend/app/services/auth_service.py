"""Complete authentication service."""
from __future__ import annotations

import logging
import time
from datetime import datetime, timedelta, timezone
from http import HTTPStatus
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload

from app.config import settings
from app.core.redis_client import RedisClient
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    generate_otp,
    hash_password,
    verify_password,
)
from app.exceptions import (
    AppException,
    AuthenticationError,
    ConflictError,
    NotFoundError,
    RateLimitError,
)
from app.models.otp import OTPVerification
from app.models.order import Order
from app.models.refreshtoken import RefreshToken
from app.models.user import User, UserStatus

logger = logging.getLogger(__name__)


class AuthService:
    def __init__(self, redis_client: RedisClient | None = None):
        self.redis = redis_client

    async def register(self, db, email: str, password: str, first_name: str,
                       last_name: str, phone: str | None = None) -> dict:
        """Register new user with email+password."""
        existing = await db.execute(
            select(User).where(
                (User.email == email) |
                ((User.phone == phone) if phone else False)
            )
        )
        if existing.scalar_one_or_none():
            raise ConflictError("User with this email or phone already exists")

        user = User(
            email=email,
            phone=phone,
            password_hash=hash_password(password),
            first_name=first_name,
            last_name=last_name,
            is_verified=True,
        )
        db.add(user)
        await db.flush()
        await db.refresh(user, ["id"])

        access_token, access_jti = create_access_token(
            user_id=str(user.id), role=user.role.value
        )
        refresh_token_str, refresh_jti = create_refresh_token(
            user_id=str(user.id)
        )

        refresh_record = RefreshToken(
            user_id=user.id,
            token=refresh_token_str,
            jti=refresh_jti,
            is_active=True,
        )
        db.add(refresh_record)
        await db.flush()

        expiry_sec = settings.access_token_expire_minutes * 60
        if self.redis:
            remaining = expiry_sec  # token expires in expiry_sec seconds from now
            await self.redis.blacklist_token(access_jti, expires_at=remaining)

        return {
            "user_id": str(user.id),
            "email": user.email,
            "phone": user.phone,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role.value,
            "access_token": access_token,
            "refresh_token": refresh_token_str,
            "expires_in": expiry_sec,
        }

    async def login(self, db, email_or_phone: str, password: str,
                    device_id: str = "default") -> dict:
        """Login with email or phone + password."""
        if self.redis:
            rate_key = f"rate:login:{email_or_phone}"
            allowed = await self.redis.consume_rate_limit(
                rate_key, settings.rate_limit_login_per_hour, 3600
            )
            if not allowed:
                raise RateLimitError("Too many login attempts. Please try again later.")

        is_email = "@" in email_or_phone
        field = User.email if is_email else User.phone

        result = await db.execute(
            select(User).where(field == email_or_phone)
            .options(selectinload(User.refresh_tokens))
        )
        user = result.scalar_one_or_none()

        if not user or not verify_password(password, user.password_hash or ""):
            raise AuthenticationError("Invalid credentials")
        if user.status != UserStatus.ACTIVE:
            raise AuthenticationError("Account is not active")

        # Revoke all existing refresh tokens for this user/device
        old_tokens = [rt for rt in user.refresh_tokens
                      if rt.user_id == user.id and rt.is_active]
        for rt in old_tokens:
            rt.is_active = False
            rt.is_revoked = True

        access_token, access_jti = create_access_token(
            user_id=str(user.id), role=user.role.value, device_id=device_id
        )
        refresh_token_str, refresh_jti = create_refresh_token(
            user_id=str(user.id), device_id=device_id
        )

        refresh_record = RefreshToken(
            user_id=user.id,
            token=refresh_token_str,
            jti=refresh_jti,
            device_id=device_id,
            is_active=True,
        )
        db.add(refresh_record)
        await db.flush()

        logger.info(f"User {user.id} logged in")
        expiry_sec = settings.access_token_expire_minutes * 60
        return {
            "user_id": str(user.id),
            "email": user.email,
            "phone": user.phone,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role.value,
            "access_token": access_token,
            "refresh_token": refresh_token_str,
            "expires_in": expiry_sec,
        }

    async def send_otp(self, db, phone: str) -> dict:
        """Generate and send OTP."""
        if self.redis:
            rate_key = f"rate:otp:{phone}"
            allowed = await self.redis.consume_rate_limit(
                rate_key, settings.rate_limit_otp_per_hour, 3600
            )
            if not allowed:
                raise RateLimitError("OTP rate limit exceeded")

        code = generate_otp()
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)

        # Invalidate previous OTPs for this phone
        await db.execute(
            update(OTPVerification).where(
                OTPVerification.phone == phone,
                OTPVerification.is_verified == False
            ).values(is_verified=True)  # mark old ones as verified to ignore
        )

        otp_record = OTPVerification(
            phone=phone, code=code, expires_at=expires_at, is_verified=False
        )
        db.add(otp_record)
        await db.flush()

        # Send via Celery task
        try:
            from app.celery_app import send_otp_sms
            send_otp_sms.delay(phone, code)
        except Exception:
            logger.warning(f"Could not send OTP via SMS: {code}")

        if settings.environment != "production":
            logger.info(f"DEV OTP for {phone}: {code}")

        return {"message": "OTP sent successfully", "phone": phone}

    async def verify_otp_and_login(self, db, phone: str, code: str,
                                   device_id: str = "default") -> dict:
        """Verify OTP and log user in (create if phone doesn't exist)."""
        if self.redis:
            rate_key = f"rate:otp_verify:{phone}"
            allowed = await self.redis.consume_rate_limit(
                rate_key, settings.rate_limit_login_per_hour, 3600
            )
            if not allowed:
                raise RateLimitError("Too many OTP verification attempts")

        result = await db.execute(
            select(OTPVerification).where(
                OTPVerification.phone == phone,
                OTPVerification.code == code,
                OTPVerification.is_verified == False,
                OTPVerification.expires_at > datetime.now(timezone.utc),
            ).order_by(OTPVerification.created_at.desc())
        )
        otp_record = result.scalar_one_or_none()

        if not otp_record:
            raise AuthenticationError("Invalid or expired OTP")

        otp_record.is_verified = True
        await db.flush()

        # Find or create user
        result = await db.execute(
            select(User).where(User.phone == phone)
        )
        user = result.scalar_one_or_none()

        if not user:
            user = User(
                phone=phone,
                first_name="User",
                last_name="",
                is_verified=True,
            )
            db.add(user)
            await db.flush()
            await db.refresh(user, ["id"])

        if user.status != UserStatus.ACTIVE:
            raise AuthenticationError("Account is not active")

        access_token, access_jti = create_access_token(
            user_id=str(user.id), role=user.role.value, device_id=device_id
        )
        refresh_token_str, refresh_jti = create_refresh_token(
            user_id=str(user.id), device_id=device_id
        )

        refresh_record = RefreshToken(
            user_id=user.id,
            token=refresh_token_str,
            jti=refresh_jti,
            device_id=device_id,
            is_active=True,
        )
        db.add(refresh_record)
        await db.flush()

        expiry_sec = settings.access_token_expire_minutes * 60
        return {
            "user_id": str(user.id),
            "email": user.email,
            "phone": user.phone,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role.value,
            "access_token": access_token,
            "refresh_token": refresh_token_str,
            "expires_in": expiry_sec,
        }

    async def refresh(self, db, refresh_token: str) -> dict:
        """Rotate refresh token and issue new access+refresh pair."""
        try:
            payload = decode_token(refresh_token)
        except Exception:
            raise AuthenticationError("Invalid refresh token")

        if payload.get("type") != "refresh":
            raise AuthenticationError("Invalid token type")

        if self.redis and await self.redis.is_blacklisted(payload.get("jti")):
            raise AuthenticationError("Token has been revoked")

        jti = payload.get("jti")
        result = await db.execute(
            select(RefreshToken).where(RefreshToken.jti == jti)
        )
        token_record = result.scalar_one_or_none()

        if not token_record or token_record.is_revoked or not token_record.is_active:
            raise AuthenticationError("Refresh token has been revoked")

        # Rotate: revoke old, issue new
        token_record.is_revoked = True
        token_record.is_active = False

        # Convert string user_id to UUID (payload["sub"] is a string from JWT)
        user_uuid = UUID(payload["sub"])
        new_refresh_token, new_jti = create_refresh_token(
            user_id=payload["sub"], device_id=payload.get("device_id")
        )

        new_refresh_record = RefreshToken(
            user_id=user_uuid,
            token=new_refresh_token,
            jti=new_jti,
            device_id=payload.get("device_id"),
            is_active=True,
        )
        db.add(new_refresh_record)
        await db.flush()

        access_token, _ = create_access_token(
            user_id=payload["sub"], role=payload.get("role", "customer")
        )
        expiry_sec = settings.access_token_expire_minutes * 60

        return {
            "access_token": access_token,
            "refresh_token": new_refresh_token,
            "token_type": "Bearer",
            "expires_in": expiry_sec,
        }

    async def logout(self, db, user_id: str, refresh_token: str) -> dict:
        """Logout: blacklist access token, revoke refresh tokens for device."""
        try:
            payload = decode_token(refresh_token)
            jti = payload.get("jti")
            result = await db.execute(
                select(RefreshToken).where(RefreshToken.jti == jti)
            )
            token_record = result.scalar_one_or_none()
            if token_record:
                token_record.is_revoked = True
                token_record.is_active = False
                await db.flush()

        except Exception:
            pass  # Token might already be expired

        if self.redis:
            await self.redis.blacklist_token(refresh_token.split(".")[1], 86400*7)

        logger.info(f"User {user_id} logged out")
        return {"message": "Logged out successfully"}

    async def change_password(self, db, user_id: str, old_password: str,
                              new_password: str) -> dict:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise NotFoundError("User not found")
        if not user.password_hash or not verify_password(
            old_password, user.password_hash
        ):
            raise AuthenticationError("Invalid old password")
        user.password_hash = hash_password(new_password)
        await db.flush()
        return {"message": "Password changed successfully"}

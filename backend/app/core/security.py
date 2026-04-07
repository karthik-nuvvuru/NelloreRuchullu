"""JWT authentication, password hashing, OTP generation, and rate limiting."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from uuid import uuid4

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from passlib.context import CryptContext
from pydantic import BaseModel

from app.config import settings
from app.dependencies import get_redis_client

# ── Password hashing ──────────────────────────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ── Bearer token scheme ──────────────────────────────────────────────────────
bearer_scheme = HTTPBearer()


class TokenPayload(BaseModel):
    sub: str
    exp: datetime
    jti: str
    role: str
    device_id: str | None = None


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def generate_otp() -> str:
    """Generate a 6-digit OTP code."""
    import random

    return f"{random.randint(100000, 999999)}"


def create_access_token(
    *,
    user_id: str,
    role: str,
    device_id: str | None = None,
    expires_delta: timedelta | None = None,
) -> tuple[str, str]:
    """Returns (token, jti)."""
    exp = datetime.now(timezone.utc) + (
        expires_delta
        or timedelta(minutes=settings.access_token_expire_minutes)
    )
    jti = str(uuid4())
    payload = {
        "sub": user_id,
        "exp": exp,
        "jti": jti,
        "role": role,
        "type": "access",
    }
    if device_id:
        payload["device_id"] = device_id
    token = jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)
    return token, jti


def create_refresh_token(
    *, user_id: str, device_id: str | None = None
) -> tuple[str, str]:
    """Returns (token, jti)."""
    exp = datetime.now(timezone.utc) + timedelta(
        days=settings.refresh_token_expire_days
    )
    jti = str(uuid4())
    payload = {
        "sub": user_id,
        "exp": exp,
        "jti": jti,
        "role": "",
        "type": "refresh",
    }
    if device_id:
        payload["device_id"] = device_id
    token = jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)
    return token, jti


def decode_token(token: str) -> dict:
    """Decode and validate a JWT token. Raises jwt.PyJWTError on failure."""
    return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])


async def check_token_blacklist(redis, jti: str) -> bool:
    """Returns True if token is blacklisted."""
    return await redis.exists(f"token:blacklist:{jti}")


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    redis=Depends(get_redis_client),
) -> TokenPayload:
    """Decode access token, check blacklist, return payload."""
    try:
        payload = decode_token(credentials.credentials)
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
        )

    jti = payload.get("jti")
    if await check_token_blacklist(redis, jti):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked",
        )

    return TokenPayload(**payload)


def require_role(*roles: str):
    """Dependency factory: require user to have one of the given roles."""

    def _check_role(current_user: TokenPayload = Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_UNAUTHORIZED,
                detail=f"Role {current_user.role!r} is not authorized. Required: {', '.join(roles)}",
            )
        return current_user

    return _check_role

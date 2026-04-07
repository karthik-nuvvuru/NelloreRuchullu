from __future__ import annotations

from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.exc import IntegrityError


class AppError(BaseModel):
    error: str
    detail: str | None = None
    code: str | None = None


class AppException(Exception):
    def __init__(self, detail: str, code: str = "app_error", status_code: int = 400):
        self.detail = detail
        self.code = code
        self.status_code = status_code
        super().__init__(detail)


class NotFoundError(AppException):
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(detail=detail, code="not_found", status_code=404)


class AuthenticationError(AppException):
    def __init__(self, detail: str = "Authentication required"):
        super().__init__(detail=detail, code="auth_error", status_code=401)


class AuthorizationError(AppException):
    def __init__(self, detail: str = "Insufficient permissions"):
        super().__init__(detail=detail, code="forbidden", status_code=403)


class ConflictError(AppException):
    def __init__(self, detail: str = "Resource conflict"):
        super().__init__(detail=detail, code="conflict", status_code=409)


class RateLimitError(AppException):
    def __init__(self, detail: str = "Rate limit exceeded"):
        super().__init__(detail=detail, code="rate_limited", status_code=429)


class ValidationErrorException(AppException):
    def __init__(self, detail: str = "Validation failed"):
        super().__init__(detail=detail, code="validation_error", status_code=422)


class PaymentError(AppException):
    def __init__(self, detail: str = "Payment failed"):
        super().__init__(detail=detail, code="payment_error", status_code=402)


async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.code, "detail": exc.detail},
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "error": "validation_error",
            "detail": str(exc.errors()),
        },
    )


async def integrity_error_handler(request: Request, exc: IntegrityError):
    return JSONResponse(
        status_code=409,
        content={"error": "conflict", "detail": "Database integrity violation"},
    )


async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": "internal_error", "detail": "An unexpected error occurred"},
    )

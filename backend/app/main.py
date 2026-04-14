"""Main FastAPI application entry point with middleware, CORS, and routers."""

from __future__ import annotations

import logging
from pathlib import Path
from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.exceptions import (
    AppException,
    app_exception_handler,
    generic_exception_handler,
    integrity_error_handler,
    validation_exception_handler,
)
from app.logging_config import setup_logging

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application startup and shutdown lifecycle."""
    setup_logging(environment=settings.environment)
    logger.info(f"Starting {settings.app_name} v{settings.version}")

    # Initialize database tables on startup
    from app.database import init_db

    await init_db()
    logger.info("Database initialized (tables created)")

    yield

    logger.info("Shutting down...")


app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── Exception handlers ───────────────────────────────────────────────────────
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(ValueError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=[
        "Accept",
        "Accept-Language",
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Origin",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers",
    ],
    expose_headers=["Content-Length", "X-Request-ID"],
)

# ── Include routers ──────────────────────────────────────────────────────────
from app.routes.auth import router as auth_router
from app.routes.cart import router as cart_router
from app.routes.coupons import router as coupons_router
from app.routes.delivery import router as delivery_router
from app.routes.menu import router as menu_router
from app.routes.orders import router as orders_router
from app.routes.payments import router as payments_router
from app.routes.reviews import router as reviews_router
from app.routes.users import router as users_router
from app.routes.analytics import router as analytics_router
from app.routes.ws import router as ws_router
from app.routes.upload import router as upload_router

app.include_router(auth_router, prefix=settings.api_prefix)
app.include_router(cart_router, prefix=settings.api_prefix)
app.include_router(coupons_router, prefix=settings.api_prefix)
app.include_router(delivery_router, prefix=settings.api_prefix)
app.include_router(menu_router, prefix=settings.api_prefix)
app.include_router(orders_router, prefix=settings.api_prefix)
app.include_router(payments_router, prefix=settings.api_prefix)
app.include_router(reviews_router, prefix=settings.api_prefix)
app.include_router(users_router, prefix=settings.api_prefix)
app.include_router(analytics_router, prefix=settings.api_prefix)
app.include_router(ws_router, prefix=settings.api_prefix)
app.include_router(upload_router, prefix=settings.api_prefix)

# Mount uploads directory for serving static files
uploads_dir = Path(__file__).parent.parent / "uploads"
uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "version": settings.version,
        "environment": settings.environment,
    }


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": f"Welcome to {settings.app_name} API",
        "docs": f"{settings.api_prefix}/docs",
    }

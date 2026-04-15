"""Async database setup with SQLAlchemy 2.0."""

from __future__ import annotations

from typing import Any, AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

# Ensure async driver prefix for create_async_engine
_db_url = settings.database_url
if _db_url and not _db_url.startswith("postgresql+"):
    # Strip existing prefix if any
    if _db_url.startswith("postgresql://"):
        _db_url = _db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    elif _db_url.startswith("postgres://"):
        _db_url = _db_url.replace("postgres://", "postgresql+asyncpg://", 1)

engine_kwargs: dict[str, Any] = {
    "echo": settings.debug,
}

if _db_url.startswith("sqlite+"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    engine_kwargs.update(
        {
            "pool_size": 20,
            "max_overflow": 10,
            "pool_timeout": 30,
            "pool_recycle": 1800,
        }
    )

engine = create_async_engine(_db_url, **engine_kwargs)

async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def init_db() -> None:
    """Create all tables. Used for development/testing only."""
    import app.models  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_one_or_none(session: AsyncSession, *args, **kwargs):
    """Helper for common query pattern."""
    from sqlalchemy import select

    result = await session.execute(select(*args).filter_by(**kwargs))
    return result.scalar_one_or_none()

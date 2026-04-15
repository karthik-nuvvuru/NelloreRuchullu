"""Pytest configuration and fixtures for backend tests."""
import os
from pathlib import Path
from typing import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

# Set test database before importing app
TEST_DB_PATH = Path(__file__).resolve().parent / "test.sqlite3"
os.environ.setdefault(
    "DATABASE_URL",
    f"sqlite+aiosqlite:///{TEST_DB_PATH}"
)
os.environ.setdefault("ENVIRONMENT", "testing")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/15")

from app.main import app
from app.dependencies import get_auth_service, get_menu_service
from app.database import Base, get_db
from app.services.auth_service import AuthService
from app.services.menu_service import MenuService
import app.models as app_models  # noqa: F401

TEST_DATABASE_URL = os.environ["DATABASE_URL"]
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestSessionFactory = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)


@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Provide a test database session with rollback after each test."""
    if TEST_DB_PATH.exists():
        TEST_DB_PATH.unlink()
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with TestSessionFactory() as session:
        yield session
        await session.rollback()
    await test_engine.dispose()
    if TEST_DB_PATH.exists():
        TEST_DB_PATH.unlink()


@pytest_asyncio.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Provide an async HTTP client for the FastAPI app."""
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_auth_service] = lambda: AuthService(redis_client=None)
    app.dependency_overrides[get_menu_service] = lambda: MenuService(redis_client=None)
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()

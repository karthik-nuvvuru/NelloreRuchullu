"""Pytest configuration with test fixtures."""
from __future__ import annotations

import asyncio
from collections.abc import AsyncGenerator, Generator
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app
from app.dependencies import get_redis_client

# SQLite test database - fast, no external dependencies
# Use in-memory database for faster, cleaner tests
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function")
async def test_engine():
    # Use unique in-memory database per test to avoid conflicts
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture
async def db_session(test_engine) -> AsyncGenerator[AsyncSession, None]:
    session_factory = sessionmaker(
        test_engine, class_=AsyncSession, expire_on_commit=False
    )
    async with session_factory() as session:
        yield session
        await session.rollback()


def create_mock_redis():
    """Create a mock Redis client for testing."""
    mock = AsyncMock()
    mock.exists = AsyncMock(return_value=False)
    mock.consume_rate_limit = AsyncMock(return_value=True)
    mock.blacklist_token = AsyncMock()
    mock.publish = AsyncMock()
    mock.cache_get = AsyncMock(return_value=None)
    mock.cache_set = AsyncMock()
    mock.is_blacklisted = AsyncMock(return_value=False)
    mock.get = AsyncMock(return_value=None)
    mock.set = AsyncMock()
    mock.delete = AsyncMock()
    mock.setex = AsyncMock()
    mock.zadd = AsyncMock()
    mock.zremrangebyscore = AsyncMock()
    mock.zcard = AsyncMock()
    mock.expire = AsyncMock()
    mock.zrange = AsyncMock(return_value=[])
    # pipeline() is called without await, returns a pipeline object
    # whose methods (zremrangebyscore, zcard, zadd, expire) are also called without await
    # only execute() is awaited
    mock.pipeline = MagicMock(return_value=MagicMock(
        zremrangebyscore=MagicMock(),
        zcard=MagicMock(),
        zadd=MagicMock(),
        expire=MagicMock(),
        execute=AsyncMock(return_value=[0, 0, 0, 0, 0]),
    ))
    return mock


@pytest_asyncio.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    # Create mock redis client
    mock_redis = create_mock_redis()

    # Patch redis.asyncio.from_url to return our mock directly (not a coroutine)
    with patch('redis.asyncio.from_url', return_value=mock_redis):
        # Clear the service cache to ensure fresh instances
        from app import dependencies
        dependencies._service_cache.clear()

        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test",
        ) as test_client:
            yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def mock_redis():
    return create_mock_redis()

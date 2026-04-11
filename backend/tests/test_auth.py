"""Tests for authentication endpoints."""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    """Health check should return healthy status."""
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data


@pytest.mark.asyncio
async def test_register(client: AsyncClient):
    """User registration should create a new user."""
    user_data = {
        "email": "pytest_test@example.com",
        "phone": "+919988776655",
        "password": "SecurePass123",
        "first_name": "Py",
        "last_name": "Test",
    }
    response = await client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == user_data["email"]
    assert "user_id" in data


@pytest.mark.asyncio
async def test_login(client: AsyncClient):
    """Login with valid credentials should return an access token."""
    # First register
    user_data = {
        "email": "login_test@example.com",
        "phone": "+919988776644",
        "password": "SecurePass123",
        "first_name": "Login",
        "last_name": "Test",
    }
    await client.post("/api/v1/auth/register", json=user_data)

    # Then login - use JSON body with email_or_phone
    login_response = await client.post(
        "/api/v1/auth/login",
        json={"email_or_phone": user_data["email"], "password": user_data["password"]},
    )
    assert login_response.status_code == 200
    data = login_response.json()
    assert "access_token" in data
    assert "token_type" in data
    assert data["token_type"].lower() == "bearer"


@pytest.mark.asyncio
async def test_login_invalid_credentials(client: AsyncClient):
    """Login with wrong password should return 401."""
    login_response = await client.post(
        "/api/v1/auth/login",
        json={"email_or_phone": "nonexistent@example.com", "password": "wrongpass"},
    )
    assert login_response.status_code == 401


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient):
    """Registering with an existing email should fail with 409."""
    user_data = {
        "email": "duplicate@example.com",
        "phone": "+919988776633",
        "password": "SecurePass123",
        "first_name": "First",
        "last_name": "User",
    }
    await client.post("/api/v1/auth/register", json=user_data)

    duplicate_response = await client.post("/api/v1/auth/register", json=user_data)
    assert duplicate_response.status_code == 409

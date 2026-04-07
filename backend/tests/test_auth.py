"""Authentication endpoint tests."""
from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_success(client: AsyncClient):
    response = await client.post(
        "/auth/register",
        json={
            "email": "test@example.com",
            "password": "TestPass123!",
            "first_name": "Test",
            "last_name": "User",
            "phone": "+919999999999",
        }
    )
    assert response.status_code in (200, 201)
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["email"] == "test@example.com"


@pytest.mark.asyncio
async def test_register_duplicate(client: AsyncClient):
    # First register
    await client.post(
        "/auth/register",
        json={
            "email": "dup@example.com",
            "password": "TestPass123!",
            "first_name": "Dup",
            "last_name": "User",
        }
    )
    # Second attempt should fail
    response = await client.post(
        "/auth/register",
        json={
            "email": "dup@example.com",
            "password": "TestPass123!",
            "first_name": "Dup",
            "last_name": "User",
        }
    )
    assert response.status_code in (400, 409)


@pytest.mark.asyncio
async def test_register_invalid_email(client: AsyncClient):
    response = await client.post(
        "/auth/register",
        json={
            "email": "invalid-email",
            "password": "TestPass123!",
            "first_name": "Test",
            "last_name": "User",
        }
    )
    assert response.status_code in (400, 422)


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient):
    email = "login@example.com"
    password = "TestPass123!"

    await client.post(
        "/auth/register",
        json={
            "email": email,
            "password": password,
            "first_name": "Login",
            "last_name": "User",
        }
    )

    response = await client.post(
        "/auth/login",
        json={
            "email_or_phone": email,
            "password": password,
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["email"] == email


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient):
    response = await client.post(
        "/auth/login",
        json={
            "email_or_phone": "nouser@example.com",
            "password": "WrongPass123!",
        }
    )
    assert response.status_code in (400, 401, 404)


@pytest.mark.asyncio
async def test_refresh_token(client: AsyncClient):
    # Register and get tokens
    resp = await client.post(
        "/auth/register",
        json={
            "email": "refresh@example.com",
            "password": "TestPass123!",
            "first_name": "Refresh",
            "last_name": "User",
        }
    )
    data = resp.json()
    refresh_token = data["refresh_token"]

    response = await client.post(
        "/auth/refresh",
        json={"refresh_token": refresh_token}
    )
    assert response.status_code == 200
    new_data = response.json()
    assert "access_token" in new_data
    assert "refresh_token" in new_data


@pytest.mark.asyncio
async def test_send_otp(client: AsyncClient):
    response = await client.post(
        "/auth/otp/send",
        json={"phone": "+919876543210"}
    )
    # Should succeed even in mock mode
    assert response.status_code in (200, 201, 429)

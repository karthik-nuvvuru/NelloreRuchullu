"""Menu endpoint tests."""
from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_empty_menu(client: AsyncClient):
    response = await client.get("/api/v1/menu")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "pagination" in data


@pytest.mark.skip(reason="Creating admin users requires direct DB access - no API exists")
@pytest.mark.asyncio
async def test_create_menu_item_admin(client: AsyncClient):
    # First register as admin - but registration creates customer role, not admin
    # This test would need direct DB access to set user role to admin
    reg_resp = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "admin@example.com",
            "password": "AdminPass123!",
            "first_name": "Admin",
            "last_name": "User",
        }
    )
    data = reg_resp.json()
    token = data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create a category first
    cat_resp = await client.post(
        "/api/v1/menu/categories",
        json={"name": "Test Category", "description": "Test"},
        headers=headers,
    )
    assert cat_resp.status_code in (200, 201)
    cat_data = cat_resp.json()

    response = await client.post(
        "/api/v1/menu",
        json={
            "name": "Biryani",
            "description": "Delicious Hyderabadi Biryani",
            "price": 299.00,
            "category_id": cat_data["id"],
            "is_vegetarian": False,
            "is_available": True,
        },
        headers=headers,
    )
    assert response.status_code in (200, 201)
    item_data = response.json()
    assert item_data["name"] == "Biryani"
    assert item_data["price"] == 299.0


@pytest.mark.asyncio
async def test_search_menu(client: AsyncClient):
    response = await client.get("/api/v1/menu?search=Biryani")
    assert response.status_code == 200

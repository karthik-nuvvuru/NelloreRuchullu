"""Health check endpoint tests."""
from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    # Health endpoint is at /health (root, not under /api/v1 prefix)
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data


@pytest.mark.asyncio
async def test_root_endpoint(client: AsyncClient):
    # Root endpoint is at / (root, not under /api/v1 prefix)
    response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "NelloreRuchullu" in data["message"]

"""Redis client wrapper for caching, rate limiting, token blacklist, and pub/sub."""

from __future__ import annotations

import json
from typing import Any

import redis.asyncio as aioredis

from app.config import settings


class RedisClient:
    def __init__(self, url: str | None = None):
        self.url = url or settings.redis_url
        self._client: aioredis.Redis | None = None

    async def get_client(self) -> aioredis.Redis:
        if self._client is None or self._client.connection_pool is None:
            self._client = aioredis.from_url(
                self.url,
                encoding="utf-8",
                decode_responses=True,
                max_connections=50,
            )
        return self._client

    async def ping(self) -> bool:
        client = await self.get_client()
        response = await client.ping()
        return bool(response)

    # ── Key-value operations ──────────────────────────────────────────────────

    async def get(self, key: str) -> str | None:
        client = await self.get_client()
        value = await client.get(key)
        return value

    async def set(
        self, key: str, value: Any, ttl: int | None = None
    ) -> None:
        client = await self.get_client()
        serialized = value if isinstance(value, str) else json.dumps(value)
        if ttl:
            await client.setex(key, ttl, serialized)
        else:
            await client.set(key, serialized)

    async def delete(self, key: str) -> None:
        client = await self.get_client()
        await client.delete(key)

    async def exists(self, key: str) -> bool:
        client = await self.get_client()
        result = await client.exists(key)
        return bool(result)

    async def ttl(self, key: str) -> int:
        client = await self.get_client()
        return await client.ttl(key)

    # ── Token blacklist ───────────────────────────────────────────────────────

    async def blacklist_token(self, jti: str, expires_at: int | None = None) -> None:
        """Add a token JTI to the blacklist with expiry from token."""
        client = await self.get_client()
        key = f"token:blacklist:{jti}"
        await client.setex(key, expires_at or 900, "1")

    async def is_blacklisted(self, jti: str) -> bool:
        return await self.exists(f"token:blacklist:{jti}")

    # ── Cache ─────────────────────────────────────────────────────────────────

    async def cache_get(self, key: str) -> dict | None:
        raw = await self.get(f"cache:{key}")
        if raw:
            return json.loads(raw)
        return None

    async def cache_set(self, key: str, value: dict, ttl: int = 300) -> None:
        await self.set(f"cache:{key}", value, ttl=ttl)

    async def cache_delete(self, key: str) -> None:
        await self.delete(f"cache:{key}")

    # ── Rate limiting ─────────────────────────────────────────────────────────

    async def check_rate_limit(
        self, key: str, max_requests: int, window_seconds: int
    ) -> tuple[bool, dict]:
        """Sliding window rate limiter.
        Returns (allowed: bool, info: dict with current count and retry_after)."""
        client = await self.get_client()
        pipe = client.pipeline()
        now = __import__("time").time()
        window_start = now - window_seconds

        pipe.zremrangebyscore(key, 0, window_start)
        pipe.zcard(key)
        pipe.zadd(key, {str(now): now})
        pipe.expire(key, window_seconds)
        results = await pipe.execute()

        current_count = results[1]
        allowed = current_count < max_requests
        retry_after = 0
        if not allowed:
            oldest = await client.zrange(key, 0, 0, withscores=True)
            if oldest:
                retry_after = int(oldest[0][1] + window_seconds - now) + 1

        return allowed, {
            "current_count": current_count,
            "limit": max_requests,
            "retry_after": retry_after,
        }

    async def consume_rate_limit(
        self, key: str, max_requests: int, window_seconds: int
    ) -> bool:
        """Returns True if request is allowed."""
        allowed, _ = await self.check_rate_limit(key, max_requests, window_seconds)
        if allowed:
            client = await self.get_client()
            now = __import__("time").time()
            await client.zadd(key, {str(now): now})
        return allowed

    # ── Pub/Sub ───────────────────────────────────────────────────────────────

    async def publish(self, channel: str, message: dict) -> int:
        client = await self.get_client()
        return await client.publish(channel, json.dumps(message))

    async def subscribe(self, *channels: str):
        client = await self.get_client()
        pubsub = client.pubsub()
        await pubsub.subscribe(*channels)
        return pubsub

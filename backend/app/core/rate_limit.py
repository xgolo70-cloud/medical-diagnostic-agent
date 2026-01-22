"""
Rate Limiting Middleware
Provides protection against brute force attacks and API abuse.
Scalable implementation with Abstract Backend (Memory/Redis).
"""
import os
import time
import logging
from abc import ABC, abstractmethod
from typing import Callable, Tuple, Optional
from functools import wraps
from collections import defaultdict
from fastapi import Request, HTTPException, status

logger = logging.getLogger(__name__)

RATE_LIMIT_ENABLED = os.getenv("RATE_LIMIT_ENABLED", "true").lower() == "true"
RATE_LIMIT_BACKEND = os.getenv("RATE_LIMIT_BACKEND", "memory").lower()
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")


class RateLimitBackend(ABC):
    @abstractmethod
    def check(self, key: str, max_requests: int, window_seconds: int) -> Tuple[bool, int, int]:
        """
        Check if request is allowed.
        Returns: (allowed, remaining_requests, retry_after_seconds)
        """
        pass

    @abstractmethod
    def block(self, key: str, duration_seconds: int) -> None:
        """Block a key for specified duration"""
        pass

    @abstractmethod
    def is_blocked(self, key: str) -> Tuple[bool, int]:
        """Check if key is blocked. Returns: (is_blocked, seconds_remaining)"""
        pass


class MemoryBackend(RateLimitBackend):
    def __init__(self):
        self._requests = defaultdict(list)
        self._blocked = {}

    def _cleanup(self, key: str, window_seconds: int):
        cutoff = time.time() - window_seconds
        self._requests[key] = [req for req in self._requests[key] if req > cutoff]

    def is_blocked(self, key: str) -> Tuple[bool, int]:
        if key in self._blocked:
            remaining = self._blocked[key] - time.time()
            if remaining > 0:
                return True, int(remaining)
            del self._blocked[key]
        return False, 0

    def block(self, key: str, duration_seconds: int):
        self._blocked[key] = time.time() + duration_seconds
        logger.warning(f"Rate limit: Blocked {key} for {duration_seconds}s (Memory)")

    def check(self, key: str, max_requests: int, window_seconds: int) -> Tuple[bool, int, int]:
        is_blocked, remaining_block = self.is_blocked(key)
        if is_blocked:
            return False, 0, remaining_block

        self._cleanup(key, window_seconds)
        current = len(self._requests[key])

        if current >= max_requests:
            return False, 0, window_seconds

        self._requests[key].append(time.time())
        return True, max_requests - current - 1, 0


class RedisBackend(RateLimitBackend):
    def __init__(self, redis_url: str):
        try:
            import redis
            self.client = redis.from_url(redis_url)
            self.client.ping()
            logger.info("Rate limit: Connected to Redis")
        except ImportError:
            logger.error("redis-py not installed. Falling back to MemoryBackend.")
            raise
        except Exception as e:
            logger.error(f"Redis connection failed: {e}")
            raise

    def is_blocked(self, key: str) -> Tuple[bool, int]:
        block_key = f"block:{key}"
        ttl = self.client.ttl(block_key)
        if ttl > 0:
            return True, ttl
        return False, 0

    def block(self, key: str, duration_seconds: int):
        block_key = f"block:{key}"
        self.client.setex(block_key, duration_seconds, 1)
        logger.warning(f"Rate limit: Blocked {key} for {duration_seconds}s (Redis)")

    def check(self, key: str, max_requests: int, window_seconds: int) -> Tuple[bool, int, int]:
        # Check block first
        blocked, ttl = self.is_blocked(key)
        if blocked:
            return False, 0, ttl

        # Sliding window using Redis list or simple counter with expiry
        # Simple counter approach (fixed window) is often sufficient and faster
        # But instructions imply generic check. Let's use a simple counter per window.
        # To strictly match sliding window behavior of MemoryBackend, we need sorted sets (ZSET).
        # ZSET implementation:
        
        now = time.time()
        window_start = now - window_seconds
        
        pipe = self.client.pipeline()
        pipe.zremrangebyscore(key, 0, window_start)  # Remove old
        pipe.zcard(key)                              # Count current
        pipe.zadd(key, {str(now): now})              # Add new (tentatively)
        pipe.expire(key, window_seconds + 1)         # Set expiry
        _, current_count, _, _ = pipe.execute()

        # If we were already over limit before adding new one
        if current_count >= max_requests:
            # We added one above, but shouldn't have counted it if we are strictly limiting.
            # However, ZADD returns number of added elements.
            # A cleaner way is: check count -> if < max -> add.
            # Let's retry with a cleaner pipeline for atomicity.
            
            # Watch approach or Lua script is better for strict atomicity.
            # Simple ZSET approach:
            pipe = self.client.pipeline()
            pipe.zremrangebyscore(key, 0, window_start)
            pipe.zcard(key)
            pipe.zadd(key, {str(now): now})
            pipe.expire(key, window_seconds + 1)
            results = pipe.execute()
            count = results[1] 
            
            # Logic: We just added one. So 'count' is the count BEFORE we added (if we ignore zadd result)
            # Actually zcard returns count after zremrange.
            # So 'count' is existing requests in window.
            # Then we added 1.
            
            if count >= max_requests:
                # We are over limit. We should ideally remove the one we just added, 
                # but for rate limiting, being off by 1 in edge cases is often acceptable vs extra RTT.
                # Or use Lua script.
                # Let's stick to simple implementation: if count >= max, fail.
                
                # Cleanup the one we just erroneously added?
                self.client.zrem(key, str(now))
                return False, 0, window_seconds
            
            return True, max_requests - count - 1, 0


class RateLimiter:
    def __init__(self):
        self.backend: RateLimitBackend
        if RATE_LIMIT_BACKEND == "redis":
            try:
                self.backend = RedisBackend(REDIS_URL)
            except Exception:
                logger.warning("Falling back to MemoryBackend")
                self.backend = MemoryBackend()
        else:
            self.backend = MemoryBackend()

    def check_rate_limit(
        self, 
        key: str, 
        max_requests: int, 
        window_seconds: int,
        block_duration: int = 0
    ) -> Tuple[bool, int, int]:
        
        allowed, remaining, retry_after = self.backend.check(key, max_requests, window_seconds)
        
        if not allowed and block_duration > 0:
            # If not allowed (due to limit), check if we should block
            # Note: check() already returns false if blocked.
            # This logic handles the transition to blocked state.
            
            # Check if we are ALREADY blocked
            is_blocked, _ = self.backend.is_blocked(key)
            if not is_blocked:
                self.backend.block(key, block_duration)
                return False, 0, block_duration
                
        return allowed, remaining, retry_after

    def get_client_key(self, request: Request, prefix: str = "") -> str:
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            client_ip = forwarded.split(",")[0].strip()
        else:
            client_ip = request.client.host if request.client else "unknown"
        return f"{prefix}:{client_ip}"


rate_limiter = RateLimiter()

AUTH_LIMITS = {
    "login": {"max_requests": 5, "window_seconds": 60, "block_duration": 300},
    "register": {"max_requests": 3, "window_seconds": 60, "block_duration": 600},
    "forgot_password": {"max_requests": 3, "window_seconds": 60, "block_duration": 300},
    "google_auth": {"max_requests": 10, "window_seconds": 60, "block_duration": 300},
}

GENERAL_LIMITS = {
    "default": {"max_requests": 60, "window_seconds": 60, "block_duration": 0},
}

def rate_limit(limit_type: str = "default", custom_key_prefix: str = "") -> Callable:
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            if not RATE_LIMIT_ENABLED:
                return await func(*args, **kwargs)
            
            request = next((arg for arg in args if isinstance(arg, Request)), None)
            if not request:
                request = kwargs.get("request")
            if not request:
                return await func(*args, **kwargs)
            
            limits = AUTH_LIMITS.get(limit_type, GENERAL_LIMITS.get("default"))
            prefix = custom_key_prefix or limit_type
            key = rate_limiter.get_client_key(request, prefix)
            
            allowed, remaining, retry_after = rate_limiter.check_rate_limit(
                key,
                limits["max_requests"],
                limits["window_seconds"],
                limits.get("block_duration", 0)
            )
            
            if not allowed:
                logger.warning(f"Rate limit exceeded for {key}")
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Too many requests. Try again in {retry_after} seconds.",
                    headers={
                        "Retry-After": str(retry_after),
                        "X-RateLimit-Remaining": "0"
                    }
                )
            return await func(*args, **kwargs)
        return wrapper
    return decorator

async def check_rate_limit_dep(request: Request, limit_type: str = "default") -> None:
    if not RATE_LIMIT_ENABLED:
        return
    
    limits = AUTH_LIMITS.get(limit_type, GENERAL_LIMITS["default"])
    key = rate_limiter.get_client_key(request, limit_type)
    
    allowed, remaining, retry_after = rate_limiter.check_rate_limit(
        key,
        limits["max_requests"],
        limits["window_seconds"],
        limits.get("block_duration", 0)
    )
    
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many requests. Try again in {retry_after} seconds.",
            headers={"Retry-After": str(retry_after)}
        )
"""
Rate Limiting Middleware
Provides protection against brute force attacks and API abuse.
Uses in-memory storage (for development) with easy extension to Redis for production.
"""
import os
import time
from collections import defaultdict
from typing import Callable
from fastapi import Request, HTTPException, status
from functools import wraps
import logging

logger = logging.getLogger(__name__)

# Configuration from environment
RATE_LIMIT_ENABLED = os.getenv("RATE_LIMIT_ENABLED", "true").lower() == "true"


class RateLimiter:
    """
    In-memory rate limiter using sliding window algorithm.
    
    For production, replace with Redis-based implementation.
    """
    
    def __init__(self):
        # Store: {key: [(timestamp, count), ...]}
        self._requests: dict = defaultdict(list)
        self._blocked: dict = {}  # {key: block_until_timestamp}
    
    def _cleanup_old_requests(self, key: str, window_seconds: int):
        """Remove requests outside the current window"""
        cutoff = time.time() - window_seconds
        self._requests[key] = [
            req for req in self._requests[key] if req > cutoff
        ]
    
    def is_blocked(self, key: str) -> tuple[bool, int]:
        """Check if key is blocked, returns (is_blocked, seconds_remaining)"""
        if key in self._blocked:
            remaining = self._blocked[key] - time.time()
            if remaining > 0:
                return True, int(remaining)
            else:
                del self._blocked[key]
        return False, 0
    
    def block(self, key: str, duration_seconds: int):
        """Block a key for specified duration"""
        self._blocked[key] = time.time() + duration_seconds
        logger.warning(f"Rate limit: Blocked {key} for {duration_seconds}s")
    
    def check_rate_limit(
        self, 
        key: str, 
        max_requests: int, 
        window_seconds: int,
        block_duration: int = 0
    ) -> tuple[bool, int, int]:
        """
        Check if request is allowed.
        
        Returns:
            (allowed, remaining_requests, retry_after_seconds)
        """
        # Check if blocked
        is_blocked, block_remaining = self.is_blocked(key)
        if is_blocked:
            return False, 0, block_remaining
        
        # Clean up old requests
        self._cleanup_old_requests(key, window_seconds)
        
        # Count requests in current window
        current_requests = len(self._requests[key])
        
        if current_requests >= max_requests:
            # Rate limited
            if block_duration > 0:
                self.block(key, block_duration)
            return False, 0, window_seconds
        
        # Allow request
        self._requests[key].append(time.time())
        return True, max_requests - current_requests - 1, 0
    
    def get_client_key(self, request: Request, prefix: str = "") -> str:
        """Generate a rate limit key from request"""
        # Get client IP (consider X-Forwarded-For for proxied requests)
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            client_ip = forwarded.split(",")[0].strip()
        else:
            client_ip = request.client.host if request.client else "unknown"
        
        return f"{prefix}:{client_ip}"


# Global rate limiter instance
rate_limiter = RateLimiter()


# ================== Rate Limit Configurations ==================

# Auth endpoints - strict limits
AUTH_LIMITS = {
    "login": {"max_requests": 5, "window_seconds": 60, "block_duration": 300},      # 5/min, block 5min
    "register": {"max_requests": 3, "window_seconds": 60, "block_duration": 600},   # 3/min, block 10min
    "forgot_password": {"max_requests": 3, "window_seconds": 60, "block_duration": 300},  # 3/min, block 5min
    "google_auth": {"max_requests": 10, "window_seconds": 60, "block_duration": 300},  # 10/min, block 5min
}

# General API - more lenient
GENERAL_LIMITS = {
    "default": {"max_requests": 60, "window_seconds": 60, "block_duration": 0},  # 60/min
}


def rate_limit(
    limit_type: str = "default",
    custom_key_prefix: str = ""
) -> Callable:
    """
    Rate limiting decorator for FastAPI endpoints.
    
    Usage:
        @router.post("/login")
        @rate_limit("login")
        async def login(request: Request, ...):
            ...
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            if not RATE_LIMIT_ENABLED:
                return await func(*args, **kwargs)
            
            # Find Request object in args/kwargs
            request = None
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                    break
            if not request:
                request = kwargs.get("request")
            
            if not request:
                # Can't rate limit without request
                return await func(*args, **kwargs)
            
            # Get limits
            if limit_type in AUTH_LIMITS:
                limits = AUTH_LIMITS[limit_type]
            else:
                limits = GENERAL_LIMITS.get(limit_type, GENERAL_LIMITS["default"])
            
            # Generate key
            prefix = custom_key_prefix or limit_type
            key = rate_limiter.get_client_key(request, prefix)
            
            # Check rate limit
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
            
            # Add rate limit headers to response
            # Note: This requires middleware approach for proper header injection
            return await func(*args, **kwargs)
        
        return wrapper
    return decorator


async def check_rate_limit_dep(
    request: Request,
    limit_type: str = "default"
) -> None:
    """
    FastAPI dependency for rate limiting.
    
    Usage:
        @router.post("/login")
        async def login(
            request: Request,
            _: None = Depends(lambda req: check_rate_limit_dep(req, "login"))
        ):
            ...
    """
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

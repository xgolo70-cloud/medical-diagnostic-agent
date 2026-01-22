# Research: Review backend/app/main.py

**Date**: 2026-01-22

## 1. Executive Summary
`backend/app/main.py` is the entry point for the FastAPI application. It currently includes a **duplicate, in-memory rate limiting middleware** (`RateLimitMiddleware`) defined locally within the file. This duplicates the functionality I just refactored into `backend/app/core/rate_limit.py` and ignores the new Redis-based implementation.

## 2. Technical Context
- **File**: `backend/app/main.py`
- **Current Behavior**:
    - Defines `SecurityHeadersMiddleware`.
    - Defines `RateLimitMiddleware` class locally (lines 40-62).
    - Instantiates `RateLimitMiddleware` (line 78).
    - Imports routers from `app.api.*`.
- **Issue**: It does NOT use the `app.core.rate_limit` module I refactored. The `RateLimitMiddleware` in `main.py` is a hardcoded, non-scalable in-memory implementation.

## 3. Findings & Analysis
- **Redundancy**: The `RateLimitMiddleware` class in `main.py` is redundant and "legacy" compared to the scalable solution now available in `app.core.rate_limit`.
- **Inconsistency**: The application is configured to use `RATE_LIMIT_REQUESTS` and `RATE_LIMIT_WINDOW` env vars for this middleware, but the refactored `app.core.rate_limit` uses `RATE_LIMIT_BACKEND` and `REDIS_URL`.
- **Action Required**: The locally defined `RateLimitMiddleware` should be removed. The application should rely on the `rate_limit` decorators/dependencies used in the routers (which use the new `app.core.rate_limit`).
- **Middleware vs. Decorator**: The new `app.core.rate_limit` uses a **decorator/dependency** approach (`@rate_limit` or `check_rate_limit_dep`) rather than a global middleware. This allows for finer-grained control (e.g., stricter limits on auth endpoints).
- **Global Rate Limiting**: If a global fallback rate limit is desired, we should implement a middleware that uses the `RateLimiter` instance from `app.core.rate_limit`, or simply rely on the decorators for specific endpoints and let general traffic flow (or apply a global dependency).

## 4. Architecture Documentation
- **Auth**: JWT-based via `app.api.auth`.
- **Middlewares**: SecurityHeaders, CORS, and (currently legacy) RateLimit.
- **Routers**: Ingest, Diagnose, History, MedGemma, Admin.

## 5. Recommendation
Refactor `main.py` to:
1.  Remove the local `RateLimitMiddleware` class.
2.  Remove the middleware addition `app.add_middleware(RateLimitMiddleware, ...)`.
3.  (Optional) If global rate limiting is required for *all* endpoints (even those without decorators), create a wrapper middleware that uses `app.core.rate_limit.rate_limiter`. However, the previous refactor seemed to favor decorators.
4.  Ensure `SecurityHeadersMiddleware` remains.

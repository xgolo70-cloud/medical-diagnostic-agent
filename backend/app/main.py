import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from contextlib import asynccontextmanager
from app.api import ingest, diagnose, history, auth, google_auth, admin
from app.api.medgemma import router as medgemma_router
from app.database.init_db import init_database
from app.core.rate_limit import rate_limiter

# ================== Application Lifespan ==================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup/shutdown events"""
    print("🚀 Starting Medical Diagnostic Agent API...")
    init_database()
    yield
    print("👋 Shutting down Medical Diagnostic Agent API...")

# ================== Security Configuration ==================

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
RATE_LIMIT_REQUESTS = int(os.getenv("RATE_LIMIT_REQUESTS", "60"))
RATE_LIMIT_WINDOW = int(os.getenv("RATE_LIMIT_WINDOW", "60"))

# ================== Security Middlewares ==================

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses"""
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        return response

class GlobalRateLimitMiddleware(BaseHTTPMiddleware):
    """
    Global rate limit middleware using the core RateLimiter backend.
    Applies a general limit to all requests. Specific endpoints can enforce stricter limits via decorators.
    """
    def __init__(self, app):
        super().__init__(app)
    
    async def dispatch(self, request: Request, call_next):
        # We use a distinct prefix 'global' to avoid collision with endpoint-specific limits
        key = rate_limiter.get_client_key(request, "global")
        
        allowed, _, retry_after = rate_limiter.check_rate_limit(
            key, 
            RATE_LIMIT_REQUESTS, 
            RATE_LIMIT_WINDOW
        )
        
        if not allowed:
            return Response(
                content='{"detail": "Global rate limit exceeded. Please try again later."}',
                status_code=429,
                media_type="application/json",
                headers={"Retry-After": str(retry_after)}
            )
            
        return await call_next(request)

# ================== Application Setup ==================

app = FastAPI(
    title="Medical Diagnostic Agent API",
    description="AI-powered medical diagnosis with MedGemma 1.5 integration",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/api/docs" if os.getenv("ENABLE_DOCS", "true").lower() == "true" else None,
    redoc_url="/api/redoc" if os.getenv("ENABLE_DOCS", "true").lower() == "true" else None,
)

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(GlobalRateLimitMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
)

# ================== Routes ==================

app.include_router(auth.router, prefix="/api", tags=["Authentication"])
app.include_router(google_auth.router, prefix="/api", tags=["Google OAuth"])
app.include_router(ingest.router, prefix="/api/ingest")
app.include_router(diagnose.router, prefix="/api/diagnose")
app.include_router(history.router, prefix="/api/history")
from app.api import dashboard
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(medgemma_router, prefix="/api", tags=["MedGemma AI"])
app.include_router(admin.router, prefix="/api", tags=["Admin"])

@app.get("/")
def read_root():
    return {"message": "Medical Diagnostic Agent API", "version": "2.0.0"}

@app.get("/health")
def health_check():
    """Health check endpoint for monitoring"""
    return {"status": "healthy"}
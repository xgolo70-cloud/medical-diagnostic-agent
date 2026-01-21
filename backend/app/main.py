import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from contextlib import asynccontextmanager
from app.api import ingest, diagnose, history, auth, google_auth, admin
from app.api.medgemma import router as medgemma_router
from app.database.init_db import init_database
from collections import defaultdict
import time


# ================== Application Lifespan ==================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup/shutdown events"""
    # Startup: Initialize database
    print("🚀 Starting Medical Diagnostic Agent API...")
    init_database()
    yield
    # Shutdown: Cleanup if needed
    print("👋 Shutting down Medical Diagnostic Agent API...")

# ================== Security Configuration ==================

# Environment-based configuration
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
RATE_LIMIT_REQUESTS = int(os.getenv("RATE_LIMIT_REQUESTS", "60"))  # requests per minute
RATE_LIMIT_WINDOW = int(os.getenv("RATE_LIMIT_WINDOW", "60"))  # seconds

# ================== Security Middlewares ==================

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses"""
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        # Prevent MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"
        # Prevent clickjacking
        response.headers["X-Frame-Options"] = "DENY"
        # XSS Protection (legacy browsers)
        response.headers["X-XSS-Protection"] = "1; mode=block"
        # Referrer Policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        # Content Security Policy
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        return response

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple in-memory rate limiting middleware"""
    def __init__(self, app, requests_per_window: int = 60, window_seconds: int = 60):
        super().__init__(app)
        self.requests_per_window = requests_per_window
        self.window_seconds = window_seconds
        self.request_counts = defaultdict(list)
    
    async def dispatch(self, request: Request, call_next):
        # Get client IP
        client_ip = request.client.host if request.client else "unknown"
        current_time = time.time()
        
        # Clean old requests outside the window
        self.request_counts[client_ip] = [
            t for t in self.request_counts[client_ip] 
            if current_time - t < self.window_seconds
        ]
        
        # Check rate limit
        if len(self.request_counts[client_ip]) >= self.requests_per_window:
            return Response(
                content='{"detail": "Rate limit exceeded. Please try again later."}',
                status_code=429,
                media_type="application/json"
            )
        
        # Record this request
        self.request_counts[client_ip].append(current_time)
        
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

# Add Security Headers middleware
app.add_middleware(SecurityHeadersMiddleware)

# Add Rate Limiting middleware
app.add_middleware(RateLimitMiddleware, requests_per_window=RATE_LIMIT_REQUESTS, window_seconds=RATE_LIMIT_WINDOW)

# Add CORS middleware with secure configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],  # Explicit methods only
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],  # Explicit headers only
)

# ================== Routes ==================

app.include_router(auth.router, prefix="/api", tags=["Authentication"])
app.include_router(google_auth.router, prefix="/api", tags=["Google OAuth"])
app.include_router(ingest.router, prefix="/api/ingest")
app.include_router(diagnose.router, prefix="/api/diagnose")
app.include_router(history.router, prefix="/api/history")
app.include_router(medgemma_router, prefix="/api", tags=["MedGemma AI"])
app.include_router(admin.router, prefix="/api", tags=["Admin"])

@app.get("/")
def read_root():
    return {"message": "Medical Diagnostic Agent API", "version": "2.0.0"}

@app.get("/health")
def health_check():
    """Health check endpoint for monitoring"""
    return {"status": "healthy"}


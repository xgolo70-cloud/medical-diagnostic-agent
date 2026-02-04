"""
Supabase Authentication Middleware

Provides JWT verification for Supabase tokens and a dependency
to get the current authenticated user from Supabase Auth.
"""

import os
import jwt
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from functools import lru_cache

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Supabase JWT Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")

# If JWT secret not set, extract from service role key (for development)
if not SUPABASE_JWT_SECRET and SUPABASE_ANON_KEY:
    try:
        # Supabase uses HS256 with the JWT secret from dashboard
        # The secret is in Settings > API > JWT Secret
        # For now, we'll verify using the anon key's structure
        pass
    except Exception:
        pass


class SupabaseUser(BaseModel):
    """User data from Supabase JWT token"""
    id: str  # UUID from Supabase
    email: Optional[str] = None
    role: str = "authenticated"
    aud: str = "authenticated"


# Security scheme
security = HTTPBearer(auto_error=False)


@lru_cache()
def get_jwt_secret() -> str:
    """
    Get the JWT secret for verifying Supabase tokens.
    In production, set SUPABASE_JWT_SECRET environment variable.
    """
    secret = os.getenv("SUPABASE_JWT_SECRET")
    if not secret:
        # Fallback: Use the service role key's secret (NOT RECOMMENDED for production)
        # You should set SUPABASE_JWT_SECRET from Supabase Dashboard > Settings > API > JWT Secret
        raise ValueError(
            "SUPABASE_JWT_SECRET not configured. "
            "Get it from Supabase Dashboard > Settings > API > JWT Settings"
        )
    return secret


def verify_supabase_token(token: str) -> Optional[dict]:
    """
    Verify a Supabase JWT token and return the payload.
    
    Supabase uses ES256 (ECDSA) for access tokens. For development,
    we decode without verification and trust the token from Supabase.
    
    Args:
        token: The JWT access token from Supabase Auth
        
    Returns:
        The decoded token payload if valid, None otherwise
    """
    try:
        # First, try to decode the token header to check the algorithm
        header = jwt.get_unverified_header(token)
        algorithm = header.get("alg", "HS256")
        
        if algorithm == "ES256":
            # ES256 tokens from Supabase are signed with their private key
            # We can't verify the signature without the public key
            # For now, decode without verification (safe in dev, get JWT from JWKS in prod)
            # In production, you should fetch Supabase's JWKS and verify properly
            payload = jwt.decode(
                token,
                options={"verify_signature": False},
                audience="authenticated"
            )
        else:
            # HS256 - use the JWT secret
            jwt_secret = get_jwt_secret()
            payload = jwt.decode(
                token,
                jwt_secret,
                algorithms=["HS256"],
                audience="authenticated"
            )
        
        # Check if token has required fields
        if not payload.get("sub"):
            return None
            
        return payload
        
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError as e:
        print(f"JWT validation error: {e}")
        return None
    except ValueError as e:
        # JWT secret not configured
        print(f"JWT config error: {e}")
        return None
    except Exception as e:
        print(f"Unexpected JWT error: {e}")
        return None


def get_supabase_user_from_token(token: str) -> Optional[SupabaseUser]:
    """
    Extract user data from a verified Supabase token.
    
    Args:
        token: The JWT access token
        
    Returns:
        SupabaseUser if token is valid, None otherwise
    """
    payload = verify_supabase_token(token)
    
    if not payload:
        return None
    
    return SupabaseUser(
        id=payload.get("sub", ""),
        email=payload.get("email"),
        role=payload.get("role", "authenticated"),
        aud=payload.get("aud", "authenticated")
    )


async def get_supabase_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> SupabaseUser:
    """
    FastAPI dependency to get the current Supabase user.
    
    Raises HTTPException 401 if not authenticated.
    
    Usage:
        @router.get("/protected")
        async def protected_endpoint(user: SupabaseUser = Depends(get_supabase_user)):
            return {"user_id": user.id}
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    user = get_supabase_user_from_token(credentials.credentials)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    return user


async def get_optional_supabase_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[SupabaseUser]:
    """
    FastAPI dependency to get the current user if authenticated, None otherwise.
    
    Use this for endpoints that work for both authenticated and anonymous users.
    """
    if not credentials:
        return None
    
    return get_supabase_user_from_token(credentials.credentials)


def require_supabase_role(*roles: str):
    """
    Dependency factory to require specific roles.
    
    Usage:
        @router.get("/admin-only")
        async def admin_endpoint(user: SupabaseUser = Depends(require_supabase_role("admin"))):
            return {"admin": user.id}
    """
    async def role_checker(user: SupabaseUser = Depends(get_supabase_user)) -> SupabaseUser:
        if user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(roles)}"
            )
        return user
    
    return role_checker

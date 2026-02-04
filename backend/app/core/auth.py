"""
Authentication Module for Medical Diagnostic Agent API
Provides JWT-based authentication and authorization with Refresh Token Rotation
"""
import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import hashlib
import hmac
import json
import base64
import jwt

# ================== Configuration ==================

# Secret keys for JWT signing - MUST be set via environment variable in production
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret-key-change-in-production")
REFRESH_SECRET_KEY = os.getenv("JWT_REFRESH_SECRET_KEY", SECRET_KEY + "-refresh")
ALGORITHM = "HS256"

# Token expiration times
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))  # Short-lived
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))  # Long-lived

# Warn if using default secret key
if SECRET_KEY == "dev-secret-key-change-in-production":
    print("⚠️ WARNING: Using default JWT_SECRET_KEY. Set JWT_SECRET_KEY environment variable in production!")

# In-memory revoked tokens store (use Redis in production)
_revoked_tokens: set = set()

# ================== Models ==================

class TokenData(BaseModel):
    username: str
    role: str
    exp: int

class User(BaseModel):
    username: str
    role: str  # 'gp', 'specialist', 'auditor', 'admin'
    email: Optional[str] = None

class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    expires_in: int

# ================== JWT Handling ==================

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=15)
    to_encode.update({
        "exp": expire, 
        "type": "access",
        "iat": now,
        "jti": secrets.token_hex(16)
    })
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(days=7)
    to_encode.update({
        "exp": expire, 
        "type": "refresh",
        "iat": now,
        "jti": secrets.token_hex(16)
    })
    encoded_jwt = jwt.encode(to_encode, REFRESH_SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_token_pair(username: str, role: str) -> TokenPair:
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"username": username, "role": role}, expires_delta=access_token_expires
    )
    
    refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token = create_refresh_token(
        data={"username": username, "role": role}, expires_delta=refresh_token_expires
    )
    
    return TokenPair(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

def verify_token(token: str, is_refresh: bool = False) -> Optional[dict]:
    try:
        secret = REFRESH_SECRET_KEY if is_refresh else SECRET_KEY
        payload = jwt.decode(token, secret, algorithms=[ALGORITHM])
        
        # Check if token is revoked
        # In a real app, check redis or DB blacklist
        if token in _revoked_tokens:
            return None
            
        return payload
    except jwt.PyJWTError:
        return None

def revoke_token(token: str) -> bool:
    """Revoke a token. Returns True if successful, False if token was invalid."""
    # Verify the token is valid before revoking
    payload = verify_token(token, is_refresh=False)
    if payload is None:
        payload = verify_token(token, is_refresh=True)
    if payload is None:
        return False
    _revoked_tokens.add(token)
    return True

def verify_refresh_token(token: str) -> Optional[dict]:
    """
    Verify a refresh token and return its payload.
    Returns None if token is invalid, expired, or not a refresh token.
    """
    payload = verify_token(token, is_refresh=True)
    if payload is None:
        return None
    if payload.get("type") != "refresh":
        return None
    return payload

def rotate_tokens(refresh_token: str) -> Optional[TokenPair]:
    payload = verify_token(refresh_token, is_refresh=True)
    if not payload:
        return None
        
    username = payload.get("username")
    role = payload.get("role")
    
    if not username or not role:
        return None
        
    # Revoke old refresh token
    revoke_token(refresh_token)
    
    return create_token_pair(username, role)


# Supabase Configuration
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
SUPABASE_AUTH_AVAILABLE = True if SUPABASE_JWT_SECRET else False

def get_supabase_user_from_token(token: str):
    """
    Verify and decode a Supabase JWT token.
    Returns a simple object with email, role, and id if valid.
    """
    if not SUPABASE_JWT_SECRET:
        return None
        
    try:
        # Supabase uses HS256 by default
        payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"], audience="authenticated")
        
        class SupabaseUser:
            def __init__(self, payload):
                self.id = payload.get("sub")
                self.email = payload.get("email")
                self.role = payload.get("role", "patient")  # default to patient if unsure, usually 'authenticated'
                
                # Map 'authenticated' role to internal roles if stored in metadata
                app_metadata = payload.get("app_metadata", {})
                user_metadata = payload.get("user_metadata", {})
                
                # Check for specific claims or metadata for role mapping
                # For now, we'll look at app_metadata or fallback to patient
                if "role" in app_metadata and app_metadata["role"] != "authenticated":
                     self.role = app_metadata["role"]
                elif "role" in user_metadata:
                     self.role = user_metadata["role"]
                
        return SupabaseUser(payload)
    except Exception as e:
        # print(f"Supabase token validation error: {str(e)}")
        return None

# ================== Security Setup ==================

security = HTTPBearer(auto_error=False)

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> User:
    """
    Dependency to get the current authenticated user.
    Supports both Supabase JWT tokens and custom JWT tokens (hybrid mode).
    Raises HTTPException if not authenticated.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    
    # Try Supabase JWT first (for frontend users authenticated via Supabase)
    if SUPABASE_AUTH_AVAILABLE:
        supabase_user = get_supabase_user_from_token(token)
        if supabase_user:
            # Map Supabase user to our User model
            # Use email prefix as username if no custom username
            username = supabase_user.email.split('@')[0] if supabase_user.email else supabase_user.id[:8]
            return User(
                username=username, 
                role=supabase_user.role, 
                email=supabase_user.email
            )
    
    # Fallback to custom JWT (for demo mode or legacy users)
    payload = verify_token(token)
    if payload is not None:
        return User(
            username=payload.get("username", "unknown"), 
            role=payload.get("role", "gp"),
            email=payload.get("email") # Assuming custom JWT might have email
        )
    
    # Neither token type is valid
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_optional_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[User]:
    """
    Dependency to get the current user if authenticated, None otherwise.
    Use this for endpoints that work for both authenticated and anonymous users.
    """
    if credentials is None:
        return None
    
    payload = verify_token(credentials.credentials)
    if payload is None:
        return None
    
    return User(username=payload.get("username", "unknown"), role=payload.get("role", "gp"))

def require_role(*roles: str):
    """
    Dependency factory to require specific roles.
    Usage: Depends(require_role("admin", "specialist"))
    """
    async def role_checker(user: User = Depends(get_current_user)) -> User:
        if user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(roles)}"
            )
        return user
    return role_checker

# ================== Utility Functions ==================

def hash_password(password: str) -> str:
    """Hash a password using SHA-256 with salt"""
    salt = os.getenv("PASSWORD_SALT", "default-salt-change-in-production")
    return hashlib.sha256(f"{salt}{password}".encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return hmac.compare_digest(hash_password(plain_password), hashed_password)


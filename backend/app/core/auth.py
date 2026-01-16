"""
Authentication Module for Medical Diagnostic Agent API
Provides JWT-based authentication and authorization
"""
import os
from datetime import datetime, timedelta
from typing import Optional
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import hashlib
import hmac
import json
import base64

# ================== Configuration ==================

# Secret key for JWT signing - MUST be set via environment variable in production
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# Warn if using default secret key
if SECRET_KEY == "dev-secret-key-change-in-production":
    print("⚠️ WARNING: Using default JWT_SECRET_KEY. Set JWT_SECRET_KEY environment variable in production!")

# ================== Models ==================

class TokenData(BaseModel):
    username: str
    role: str
    exp: int

class User(BaseModel):
    username: str
    role: str  # 'gp', 'specialist', 'auditor', 'admin'

# ================== Security Setup ==================

security = HTTPBearer(auto_error=False)

# ================== JWT Functions ==================

def _base64url_encode(data: bytes) -> str:
    """Base64 URL-safe encoding without padding"""
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')

def _base64url_decode(data: str) -> bytes:
    """Base64 URL-safe decoding with padding"""
    padding = 4 - len(data) % 4
    if padding != 4:
        data += '=' * padding
    return base64.urlsafe_b64decode(data)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a simple JWT token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode["exp"] = int(expire.timestamp())
    
    # Create JWT manually (header.payload.signature)
    header = {"alg": ALGORITHM, "typ": "JWT"}
    header_encoded = _base64url_encode(json.dumps(header).encode())
    payload_encoded = _base64url_encode(json.dumps(to_encode).encode())
    
    message = f"{header_encoded}.{payload_encoded}"
    signature = hmac.new(SECRET_KEY.encode(), message.encode(), hashlib.sha256).digest()
    signature_encoded = _base64url_encode(signature)
    
    return f"{message}.{signature_encoded}"

def verify_token(token: str) -> Optional[dict]:
    """Verify and decode a JWT token"""
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        
        header_encoded, payload_encoded, signature_encoded = parts
        
        # Verify signature
        message = f"{header_encoded}.{payload_encoded}"
        expected_signature = hmac.new(SECRET_KEY.encode(), message.encode(), hashlib.sha256).digest()
        actual_signature = _base64url_decode(signature_encoded)
        
        if not hmac.compare_digest(expected_signature, actual_signature):
            return None
        
        # Decode payload
        payload = json.loads(_base64url_decode(payload_encoded))
        
        # Check expiration
        if payload.get("exp", 0) < datetime.utcnow().timestamp():
            return None
        
        return payload
    except Exception:
        return None

# ================== Dependencies ==================

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> User:
    """
    Dependency to get the current authenticated user.
    Raises HTTPException if not authenticated.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    payload = verify_token(credentials.credentials)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return User(username=payload.get("username", "unknown"), role=payload.get("role", "gp"))

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

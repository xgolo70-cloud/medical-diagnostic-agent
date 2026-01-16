"""
Authentication Module for Medical Diagnostic Agent API
Provides JWT-based authentication and authorization with Refresh Token Rotation
"""
import os
import secrets
from datetime import datetime, timedelta
from typing import Optional, Tuple
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import hashlib
import hmac
import json
import base64

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

class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds until access token expires

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

def _create_token(data: dict, secret: str, expires_delta: timedelta) -> str:
    """Create a JWT token with given secret and expiration"""
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode["exp"] = int(expire.timestamp())
    to_encode["iat"] = int(datetime.utcnow().timestamp())
    to_encode["jti"] = secrets.token_hex(16)  # Unique token ID for revocation
    
    # Create JWT manually (header.payload.signature)
    header = {"alg": ALGORITHM, "typ": "JWT"}
    header_encoded = _base64url_encode(json.dumps(header).encode())
    payload_encoded = _base64url_encode(json.dumps(to_encode).encode())
    
    message = f"{header_encoded}.{payload_encoded}"
    signature = hmac.new(secret.encode(), message.encode(), hashlib.sha256).digest()
    signature_encoded = _base64url_encode(signature)
    
    return f"{message}.{signature_encoded}"

def _verify_token(token: str, secret: str, check_revocation: bool = True) -> Optional[dict]:
    """Verify and decode a JWT token with given secret"""
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        
        header_encoded, payload_encoded, signature_encoded = parts
        
        # Verify signature
        message = f"{header_encoded}.{payload_encoded}"
        expected_signature = hmac.new(secret.encode(), message.encode(), hashlib.sha256).digest()
        actual_signature = _base64url_decode(signature_encoded)
        
        if not hmac.compare_digest(expected_signature, actual_signature):
            return None
        
        # Decode payload
        payload = json.loads(_base64url_decode(payload_encoded))
        
        # Check expiration
        if payload.get("exp", 0) < datetime.utcnow().timestamp():
            return None
        
        # Check revocation
        if check_revocation and payload.get("jti") in _revoked_tokens:
            return None
        
        return payload
    except Exception:
        return None

# ================== Access Token Functions ==================

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create an access token (short-lived)"""
    delta = expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return _create_token(data, SECRET_KEY, delta)

def verify_token(token: str) -> Optional[dict]:
    """Verify and decode an access token"""
    return _verify_token(token, SECRET_KEY)

# ================== Refresh Token Functions ==================

def create_refresh_token(data: dict) -> str:
    """Create a refresh token (long-lived)"""
    refresh_data = {
        "username": data.get("username"),
        "role": data.get("role"),
        "type": "refresh"
    }
    return _create_token(refresh_data, REFRESH_SECRET_KEY, timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))

def verify_refresh_token(token: str) -> Optional[dict]:
    """Verify and decode a refresh token"""
    payload = _verify_token(token, REFRESH_SECRET_KEY)
    if payload and payload.get("type") == "refresh":
        return payload
    return None

def create_token_pair(username: str, role: str) -> TokenPair:
    """Create both access and refresh tokens"""
    data = {"username": username, "role": role}
    return TokenPair(
        access_token=create_access_token(data),
        refresh_token=create_refresh_token(data),
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

def rotate_tokens(refresh_token: str) -> Optional[TokenPair]:
    """
    Rotate tokens: validate refresh token, revoke old one, issue new pair.
    Returns None if refresh token is invalid.
    """
    payload = verify_refresh_token(refresh_token)
    if not payload:
        return None
    
    # Revoke old refresh token
    old_jti = payload.get("jti")
    if old_jti:
        _revoked_tokens.add(old_jti)
    
    # Issue new token pair
    return create_token_pair(payload["username"], payload["role"])

def revoke_token(token: str) -> bool:
    """Revoke a token by adding its JTI to the revoked set"""
    payload = _verify_token(token, SECRET_KEY, check_revocation=False)
    if not payload:
        payload = _verify_token(token, REFRESH_SECRET_KEY, check_revocation=False)
    
    if payload and payload.get("jti"):
        _revoked_tokens.add(payload["jti"])
        return True
    return False

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


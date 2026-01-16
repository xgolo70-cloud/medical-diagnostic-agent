"""
Authentication API Router
Provides login, refresh, and logout endpoints with token rotation
"""
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, Field
from typing import Optional
from app.core.auth import (
    create_token_pair,
    rotate_tokens,
    revoke_token,
    verify_password,
    hash_password,
    TokenPair,
    get_current_user,
    User
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

# ================== Request/Response Models ==================

class LoginRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6, max_length=100)

class RefreshRequest(BaseModel):
    refresh_token: str

class LogoutRequest(BaseModel):
    refresh_token: Optional[str] = None

class MessageResponse(BaseModel):
    message: str

# ================== Mock User Database ==================
# In production, replace with real database
MOCK_USERS = {
    "admin": {
        "password_hash": hash_password("admin123"),
        "role": "admin"
    },
    "doctor": {
        "password_hash": hash_password("doctor123"),
        "role": "specialist"
    },
    "nurse": {
        "password_hash": hash_password("nurse123"),
        "role": "gp"
    }
}

# ================== Endpoints ==================

@router.post("/login", response_model=TokenPair)
async def login(request: LoginRequest):
    """
    Authenticate user and return access + refresh token pair.
    
    Demo credentials:
    - admin / admin123 (role: admin)
    - doctor / doctor123 (role: specialist)
    - nurse / nurse123 (role: gp)
    """
    user = MOCK_USERS.get(request.username)
    
    if not user or not verify_password(request.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return create_token_pair(request.username, user["role"])

@router.post("/refresh", response_model=TokenPair)
async def refresh_tokens(request: RefreshRequest):
    """
    Rotate tokens using a valid refresh token.
    The old refresh token is revoked and a new pair is issued.
    """
    token_pair = rotate_tokens(request.refresh_token)
    
    if not token_pair:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return token_pair

@router.post("/logout", response_model=MessageResponse)
async def logout(
    request: LogoutRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Logout user by revoking tokens.
    Requires authentication via access token.
    """
    if request.refresh_token:
        revoke_token(request.refresh_token)
    
    return MessageResponse(message="Successfully logged out")

@router.get("/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Get current authenticated user information.
    Useful for validating tokens and getting user details.
    """
    return current_user

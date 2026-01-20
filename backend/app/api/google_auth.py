"""
Google OAuth Authentication Endpoint
Verifies Google ID tokens and creates session tokens for users
"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional
import httpx
from app.core.auth import create_token_pair, TokenPair

router = APIRouter(prefix="/auth", tags=["Authentication"])

# ================== Request/Response Models ==================

class GoogleLoginRequest(BaseModel):
    """Request body for Google OAuth login"""
    access_token: str = Field(..., description="Google OAuth access token")

class GoogleUserInfo(BaseModel):
    """User info from Google"""
    email: str
    name: Optional[str] = None
    picture: Optional[str] = None
    email_verified: bool = False

# ================== Endpoints ==================

@router.post("/google", response_model=TokenPair)
async def google_login(request: GoogleLoginRequest):
    """
    Authenticate user via Google OAuth.
    
    1. Verifies the access token with Google
    2. Fetches user info from Google
    3. Creates and returns JWT token pair
    
    The user is automatically registered if not existing (in a real app).
    For now, we assign 'specialist' role to all Google users.
    """
    try:
        # Fetch user info from Google using the access token
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {request.access_token}"}
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid Google access token",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            user_data = response.json()
            
        # Validate user info
        if not user_data.get("email"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not retrieve email from Google",
            )
        
        if not user_data.get("email_verified", False):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Google email is not verified",
            )
        
        # In a real application, you would:
        # 1. Check if user exists in database
        # 2. Create user if not exists
        # 3. Update user's Google profile data
        # For now, we create tokens directly
        
        # Create token pair with user's email as username
        # and assign 'specialist' role by default for Google users
        token_pair = create_token_pair(
            username=user_data["email"],
            role="specialist"
        )
        
        return token_pair
        
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Could not connect to Google: {str(e)}",
        )

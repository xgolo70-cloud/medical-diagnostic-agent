"""
Authentication API Router
Provides registration, login, refresh, logout, and password recovery endpoints.
Now uses database for user storage instead of mock credentials.
"""
import secrets
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException, status, Depends, Request
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from pydantic import BaseModel, Field, EmailStr

from app.core.auth import (
    create_token_pair,
    rotate_tokens,
    revoke_token,
    verify_password,
    hash_password,
    TokenPair,
    get_current_user,
    User as AuthUser
)
from app.database.connection import get_db
from app.database.models import User, UserRole
from app.schemas.user import (
    UserCreate,
    UserResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    TokenResponse
)
from app.services.email_service import email_service
from app.core.rate_limit import rate_limit

router = APIRouter(prefix="/auth", tags=["Authentication"])

# ================== Request/Response Models ==================

class LoginRequest(BaseModel):
    """Login can be done with username or email"""
    username: str = Field(..., min_length=3, max_length=255)  # Can be username or email
    password: str = Field(..., min_length=6, max_length=100)

class RefreshRequest(BaseModel):
    refresh_token: str

class LogoutRequest(BaseModel):
    refresh_token: Optional[str] = None

class MessageResponse(BaseModel):
    message: str


# ================== Helper Functions ==================

def get_user_by_username_or_email(db: Session, identifier: str) -> Optional[User]:
    """Find user by username or email"""
    return db.query(User).filter(
        or_(User.username == identifier.lower(), User.email == identifier.lower())
    ).first()


def generate_reset_token() -> str:
    """Generate a secure random token for password reset"""
    return secrets.token_urlsafe(32)


# ================== Registration Endpoint ==================

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@rate_limit("register")
async def register(request: Request, user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user account.
    
    - Username must be unique and contain only letters, numbers, underscores, dots
    - Email must be unique
    - Password must be at least 8 characters with uppercase, lowercase, and number
    """
    # Check if username already exists
    existing_user = db.query(User).filter(User.username == user_data.username.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email already exists
    existing_email = db.query(User).filter(User.email == user_data.email.lower()).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    new_user = User(
        email=user_data.email.lower(),
        username=user_data.username.lower(),
        password_hash=hash_password(user_data.password),
        role=UserRole(user_data.role),
        full_name=user_data.full_name,
        phone=user_data.phone,
        is_verified=False,  # Will be set to True after email verification
        is_active=True,
        verification_token=secrets.token_urlsafe(32),
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Send verification email
    email_service.send_verification_email(
        to_email=new_user.email,
        username=new_user.username,
        verification_token=new_user.verification_token
    )
    
    return UserResponse(
        id=new_user.id,
        email=new_user.email,
        username=new_user.username,
        role=new_user.role.value,
        full_name=new_user.full_name,
        phone=new_user.phone,
        avatar_url=new_user.avatar_url,
        is_verified=new_user.is_verified,
        is_active=new_user.is_active,
        oauth_provider=new_user.oauth_provider,
        created_at=new_user.created_at,
        last_login=new_user.last_login,
    )


# ================== Login Endpoint ==================

@router.post("/login", response_model=TokenPair)
@rate_limit("login")
async def login(request: Request, login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate user and return access + refresh token pair.
    
    Login can be done with either username or email.
    """
    # Find user by username or email
    user = get_user_by_username_or_email(db, login_data.username)
    
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username/email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if account is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Please contact support."
        )
    
    # Update last login timestamp
    user.last_login = datetime.now(timezone.utc)
    db.commit()
    
    return create_token_pair(user.username, user.role.value)


# ================== Google OAuth Endpoint ==================

class GoogleAuthRequest(BaseModel):
    """Google OAuth token from frontend"""
    access_token: str

@router.post("/google", response_model=TokenPair)
@rate_limit("google_auth")
async def google_auth(request: Request, auth_data: GoogleAuthRequest, db: Session = Depends(get_db)):
    """
    Authenticate user via Google OAuth.
    
    - Verifies the Google access token
    - Creates a new user if they don't exist
    - Links existing user if email matches
    - Returns JWT token pair for our app
    """
    import httpx
    
    # Verify Google token and get user info
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {auth_data.access_token}"}
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid Google token"
                )
            
            google_user = response.json()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Failed to verify Google token: {str(e)}"
        )
    
    # Extract Google user info
    email = google_user.get("email", "").lower()
    name = google_user.get("name", "")
    picture = google_user.get("picture", "")
    google_id = google_user.get("sub", "")
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account must have an email"
        )
    
    # Check if user exists by email
    user = db.query(User).filter(User.email == email).first()
    
    if user:
        # Update existing user with Google info if not already linked
        if not user.oauth_provider:
            user.oauth_provider = "google"
            user.oauth_id = google_id
            user.is_verified = True  # Google accounts are pre-verified
        if picture and not user.avatar_url:
            user.avatar_url = picture
        if name and not user.full_name:
            user.full_name = name
        user.last_login = datetime.now(timezone.utc)
        db.commit()
    else:
        # Create new user from Google account
        # Generate a unique username from email
        base_username = email.split("@")[0].lower()
        username = base_username
        counter = 1
        while db.query(User).filter(User.username == username).first():
            username = f"{base_username}{counter}"
            counter += 1
        
        user = User(
            email=email,
            username=username,
            password_hash="",  # No password for OAuth users
            role=UserRole.PATIENT,  # Default role for OAuth users
            full_name=name,
            avatar_url=picture,
            oauth_provider="google",
            oauth_id=google_id,
            is_verified=True,  # Google accounts are pre-verified
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Send welcome email for new users
        email_service.send_welcome_email(
            to_email=user.email,
            username=user.username
        )
    
    # Check if account is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Please contact support."
        )
    
    return create_token_pair(user.username, user.role.value)


# ================== Token Refresh Endpoint ==================

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


# ================== Logout Endpoint ==================

@router.post("/logout", response_model=MessageResponse)
async def logout(
    request: LogoutRequest,
    current_user: AuthUser = Depends(get_current_user)
):
    """
    Logout user by revoking tokens.
    Requires authentication via access token.
    """
    if request.refresh_token:
        revoke_token(request.refresh_token)
    
    return MessageResponse(message="Successfully logged out")


# ================== Email Verification Endpoints ==================

@router.get("/verify-email", response_model=MessageResponse)
async def verify_email(token: str, db: Session = Depends(get_db)):
    """
    Verify user's email using the token sent via email.
    """
    # Find user with this verification token
    user = db.query(User).filter(User.verification_token == token).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token"
        )
    
    if user.is_verified:
        return MessageResponse(message="Email already verified")
    
    # Mark user as verified
    user.is_verified = True
    user.verification_token = None  # Clear the token
    db.commit()
    
    # Send welcome email
    email_service.send_welcome_email(
        to_email=user.email,
        username=user.username
    )
    
    return MessageResponse(message="Email verified successfully! Welcome to MedAI.")


@router.post("/resend-verification", response_model=MessageResponse)
async def resend_verification(email: EmailStr, db: Session = Depends(get_db)):
    """
    Resend verification email to user.
    """
    user = db.query(User).filter(User.email == email.lower()).first()
    
    # Always return success to prevent email enumeration
    if not user or user.is_verified:
        return MessageResponse(message="If the email exists and is not verified, a new verification link has been sent.")
    
    # Generate new token
    new_token = secrets.token_urlsafe(32)
    user.verification_token = new_token
    db.commit()
    
    # Send verification email
    email_service.send_verification_email(
        to_email=user.email,
        username=user.username,
        verification_token=new_token
    )
    
    return MessageResponse(message="If the email exists and is not verified, a new verification link has been sent.")


# ================== Password Recovery Endpoints ==================

@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Request a password reset.
    
    Sends a reset token to the user's email. In development mode,
    the token is returned in the response for testing.
    """
    user = db.query(User).filter(User.email == request.email.lower()).first()
    
    # Always return success to prevent email enumeration
    if not user:
        return MessageResponse(message="If an account exists with this email, a reset link has been sent.")
    
    # Generate reset token with 1 hour expiry
    reset_token = generate_reset_token()
    user.reset_token = hash_password(reset_token)  # Store hashed token
    user.reset_token_expires = datetime.now(timezone.utc) + timedelta(hours=1)
    db.commit()
    
    # Send password reset email
    email_service.send_password_reset_email(
        to_email=user.email,
        username=user.username,
        reset_token=reset_token
    )
    
    return MessageResponse(message="If an account exists with this email, a reset link has been sent.")


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Reset password using a valid reset token.
    """
    # Find user with valid reset token
    # Since tokens are hashed, we need to check each user with an unexpired token
    users_with_tokens = db.query(User).filter(
        User.reset_token.isnot(None),
        User.reset_token_expires > datetime.now(timezone.utc)
    ).all()
    
    target_user = None
    for user in users_with_tokens:
        if verify_password(request.token, user.reset_token):
            target_user = user
            break
    
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Update password and clear reset token
    target_user.password_hash = hash_password(request.new_password)
    target_user.reset_token = None
    target_user.reset_token_expires = None
    db.commit()
    
    return MessageResponse(message="Password reset successfully. You can now login with your new password.")


# ================== Current User Endpoint ==================

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current authenticated user information.
    Useful for validating tokens and getting user details.
    """
    user = db.query(User).filter(User.username == current_user.username).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        id=user.id,
        email=user.email,
        username=user.username,
        role=user.role.value,
        full_name=user.full_name,
        phone=user.phone,
        avatar_url=user.avatar_url,
        is_verified=user.is_verified,
        is_active=user.is_active,
        oauth_provider=user.oauth_provider,
        created_at=user.created_at,
        last_login=user.last_login,
    )


# ================== Profile Update Endpoint ==================

@router.put("/me", response_model=UserResponse)
async def update_profile(
    full_name: Optional[str] = None,
    phone: Optional[str] = None,
    avatar_url: Optional[str] = None,
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user's profile information.
    Only provided fields will be updated.
    If the user does not exist in the database (e.g. Supabase user), create them.
    """
    user = db.query(User).filter(User.username == current_user.username).first()
    
    if not user:
        # User not found in local DB, but authenticated via valid token (likely Supabase)
        # Create the user from the token information
        if not current_user.email:
             raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User email is required for initial profile creation"
            )
            
        # Check if user exists by email just in case of username mismatch
        user = db.query(User).filter(User.email == current_user.email).first()
        
        if not user:
            # Create new user
            user = User(
                username=current_user.username,
                email=current_user.email,
                role=UserRole(current_user.role) if current_user.role in [r.value for r in UserRole] else UserRole.PATIENT,
                password_hash="", # External auth
                is_verified=True,
                is_active=True,
                oauth_provider="supabase"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
    
    # Update only provided fields
    if full_name is not None:
        user.full_name = full_name
    if phone is not None:
        user.phone = phone
    if avatar_url is not None:
        user.avatar_url = avatar_url
    
    db.commit()
    db.refresh(user)
    
    return UserResponse(
        id=user.id,
        email=user.email,
        username=user.username,
        role=user.role.value,
        full_name=user.full_name,
        phone=user.phone,
        avatar_url=user.avatar_url,
        is_verified=user.is_verified,
        is_active=user.is_active,
        oauth_provider=user.oauth_provider,
        created_at=user.created_at,
        last_login=user.last_login,
    )


# ================== Password Change Endpoint ==================

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=100)
    confirm_password: str


@router.post("/me/password", response_model=MessageResponse)
async def change_password(
    request: PasswordChangeRequest,
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Change current user's password.
    Requires current password verification.
    """
    user = db.query(User).filter(User.username == current_user.username).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Verify current password
    if not verify_password(request.current_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Validate passwords match
    if request.new_password != request.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New passwords do not match"
        )
    
    # Validate password strength
    if len(request.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters"
        )
    
    # Update password
    user.password_hash = hash_password(request.new_password)
    db.commit()
    
    return MessageResponse(message="Password changed successfully")

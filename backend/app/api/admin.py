"""
Admin API Router
Provides endpoints for user management, accessible only to admins.
"""
from fastapi import APIRouter, HTTPException, status, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, Field

from app.core.auth import get_current_user, User as AuthUser
from app.database.connection import get_db
from app.database.models import User, UserRole
from app.schemas.user import UserResponse

router = APIRouter(prefix="/admin", tags=["Admin"])


# ================== Authorization Helper ==================

async def require_admin(current_user: AuthUser = Depends(get_current_user)) -> AuthUser:
    """Require admin role for access"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


# ================== Request/Response Models ==================

class UserListResponse(BaseModel):
    users: List[UserResponse]
    total: int
    page: int
    page_size: int


class UserUpdateRequest(BaseModel):
    role: Optional[str] = Field(None)
    is_active: Optional[bool] = Field(None)
    is_verified: Optional[bool] = Field(None)
    full_name: Optional[str] = Field(None, max_length=100)


class MessageResponse(BaseModel):
    message: str


class UserStatsResponse(BaseModel):
    total_users: int
    active_users: int
    verified_users: int
    by_role: dict


# ================== Endpoints ==================

@router.get("/users", response_model=UserListResponse)
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    current_user: AuthUser = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    List all users with pagination and filtering.
    Admin only.
    """
    query = db.query(User)
    
    # Apply filters
    if role:
        try:
            role_enum = UserRole(role)
            query = query.filter(User.role == role_enum)
        except ValueError:
            pass
    
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (User.username.ilike(search_term)) |
            (User.email.ilike(search_term)) |
            (User.full_name.ilike(search_term))
        )
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * page_size
    users = query.order_by(User.created_at.desc()).offset(offset).limit(page_size).all()
    
    return UserListResponse(
        users=[
            UserResponse(
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
            for user in users
        ],
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/users/stats", response_model=UserStatsResponse)
async def get_user_stats(
    current_user: AuthUser = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get user statistics.
    Admin only.
    """
    total = db.query(User).count()
    active = db.query(User).filter(User.is_active == True).count()
    verified = db.query(User).filter(User.is_verified == True).count()
    
    # Count by role
    by_role = {}
    for role in UserRole:
        count = db.query(User).filter(User.role == role).count()
        by_role[role.value] = count
    
    return UserStatsResponse(
        total_users=total,
        active_users=active,
        verified_users=verified,
        by_role=by_role
    )


@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user: AuthUser = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get a specific user by ID.
    Admin only.
    """
    user = db.query(User).filter(User.id == user_id).first()
    
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


@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    request: UserUpdateRequest,
    current_user: AuthUser = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Update a user's information.
    Admin only.
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent admin from deactivating themselves
    if user.username == current_user.username and request.is_active == False:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own account"
        )
    
    # Update fields
    if request.role is not None:
        try:
            user.role = UserRole(request.role)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid role: {request.role}"
            )
    
    if request.is_active is not None:
        user.is_active = request.is_active
    
    if request.is_verified is not None:
        user.is_verified = request.is_verified
    
    if request.full_name is not None:
        user.full_name = request.full_name
    
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


@router.delete("/users/{user_id}", response_model=MessageResponse)
async def delete_user(
    user_id: str,
    current_user: AuthUser = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Delete a user.
    Admin only.
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent admin from deleting themselves
    if user.username == current_user.username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    db.delete(user)
    db.commit()
    
    return MessageResponse(message=f"User {user.username} deleted successfully")


@router.post("/users/{user_id}/activate", response_model=MessageResponse)
async def activate_user(
    user_id: str,
    current_user: AuthUser = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Activate a user account.
    Admin only.
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_active = True
    db.commit()
    
    return MessageResponse(message=f"User {user.username} activated successfully")


@router.post("/users/{user_id}/deactivate", response_model=MessageResponse)
async def deactivate_user(
    user_id: str,
    current_user: AuthUser = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Deactivate a user account.
    Admin only.
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent admin from deactivating themselves
    if user.username == current_user.username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own account"
        )
    
    user.is_active = False
    db.commit()
    
    return MessageResponse(message=f"User {user.username} deactivated successfully")

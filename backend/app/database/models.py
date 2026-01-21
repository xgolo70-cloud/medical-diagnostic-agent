"""
Database Models
SQLAlchemy ORM models for the Medical Diagnostic Agent application.
"""
import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum
from sqlalchemy import (
    Column, String, Boolean, DateTime, Text, Enum, Index
)
from sqlalchemy.dialects.sqlite import TEXT as SQLiteText
from .connection import Base


class UserRole(str, PyEnum):
    """User role enumeration for role-based access control"""
    PATIENT = "patient"
    DOCTOR = "doctor"
    SPECIALIST = "specialist"
    ADMIN = "admin"
    AUDITOR = "auditor"
    GP = "gp"  # General Practitioner


def generate_uuid():
    """Generate a new UUID string"""
    return str(uuid.uuid4())


class User(Base):
    """
    User model for authentication and authorization.
    Stores all user account information including credentials and profile data.
    """
    __tablename__ = "users"
    
    # Primary key - UUID for better security and distributed systems compatibility
    id = Column(String(36), primary_key=True, default=generate_uuid)
    
    # Authentication fields
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    
    # Role-based access control
    role = Column(
        Enum(UserRole, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        default=UserRole.PATIENT
    )
    
    # Profile information
    full_name = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    avatar_url = Column(String(500), nullable=True)  # Profile picture URL
    
    # Account status
    is_verified = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # OAuth support (for Google sign-in, etc.)
    oauth_provider = Column(String(50), nullable=True)  # 'google', 'microsoft', etc.
    oauth_id = Column(String(255), nullable=True)  # Provider's user ID
    
    # Password reset support
    reset_token = Column(String(255), nullable=True)
    reset_token_expires = Column(DateTime(timezone=True), nullable=True)
    
    # Email verification support
    verification_token = Column(String(255), nullable=True)
    
    # Timestamps
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    # Indexes for common queries
    __table_args__ = (
        Index('ix_users_oauth', 'oauth_provider', 'oauth_id'),
        Index('ix_users_role_active', 'role', 'is_active'),
    )
    
    def __repr__(self):
        return f"<User(id={self.id}, username={self.username}, role={self.role})>"
    
    def to_dict(self, include_sensitive=False):
        """
        Convert user to dictionary for API responses.
        
        Args:
            include_sensitive: Include sensitive fields like reset tokens
        """
        data = {
            "id": self.id,
            "email": self.email,
            "username": self.username,
            "role": self.role.value if isinstance(self.role, UserRole) else self.role,
            "full_name": self.full_name,
            "phone": self.phone,
            "avatar_url": self.avatar_url,
            "is_verified": self.is_verified,
            "is_active": self.is_active,
            "oauth_provider": self.oauth_provider,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "last_login": self.last_login.isoformat() if self.last_login else None,
        }
        
        if include_sensitive:
            data.update({
                "reset_token": self.reset_token,
                "reset_token_expires": self.reset_token_expires.isoformat() if self.reset_token_expires else None,
                "verification_token": self.verification_token,
            })
        
        return data


class PasswordResetRequest(Base):
    """
    Track password reset requests for security and rate limiting.
    """
    __tablename__ = "password_reset_requests"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), nullable=False, index=True)
    token_hash = Column(String(255), nullable=False)
    ip_address = Column(String(45), nullable=True)  # IPv6 compatible
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    used_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    
    def is_expired(self):
        return datetime.now(timezone.utc) > self.expires_at
    
    def is_used(self):
        return self.used_at is not None

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


class Diagnosis(Base):
    """
    Stores diagnosis results generated by the AI.
    """
    __tablename__ = "diagnoses"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), nullable=True, index=True)  # Nullable for anonymous users
    
    # Patient info snapshot
    patient_id = Column(String(50), nullable=True)
    patient_age = Column(String(10), nullable=True)
    patient_gender = Column(String(20), nullable=True)
    
    # Diagnosis details
    symptoms = Column(Text, nullable=True)
    diagnosis_result = Column(Text, nullable=False) # JSON string of the full result
    primary_diagnosis = Column(String(255), nullable=True)
    confidence = Column(String(10), nullable=True) # Stored as string or float
    
    # Metadata
    model_version = Column(String(50), default="gemini-1.5-flash")
    image_url = Column(String(500), nullable=True)
    status = Column(String(20), default="completed") # completed, failed, pending_review
    
    # Smart Classification Fields
    severity = Column(String(20), nullable=True) # e.g., Critical, High, Medium, Low
    condition_category = Column(String(100), nullable=True) # e.g., Respiratory, Cardiovascular
    requires_immediate_attention = Column(Boolean, default=False)
    
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    
    def to_dict(self):
        import json
        try:
            result = json.loads(self.diagnosis_result)
        except (json.JSONDecodeError, TypeError, ValueError):
            result = {}
            
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "primary_diagnosis": self.primary_diagnosis,
            "confidence": float(self.confidence) if self.confidence else 0.0,
            "severity": self.severity,
            "condition_category": self.condition_category,
            "requires_immediate_attention": self.requires_immediate_attention,
            "date": self.created_at.isoformat(),
            "status": self.status,
            "result": result
        }


class Appointment(Base):
    """
    Stores appointments for the dashboard schedule.
    """
    __tablename__ = "appointments"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), nullable=True, index=True) # The doctor/user
    
    patient_name = Column(String(100), nullable=False)
    appointment_time = Column(DateTime(timezone=True), nullable=False)
    appointment_type = Column(String(50), default="Check-up")
    status = Column(String(20), default="pending") # pending, confirmed, cancelled
    
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    
    def to_dict(self):
        return {
            "id": self.id,
            "patient": self.patient_name,
            "time": self.appointment_time.strftime("%I:%M %p"),
            "date": self.appointment_time.strftime("%Y-%m-%d"),
            "type": self.appointment_type,
            "status": self.status
        }


class Medication(Base):
    """
    Stores active and historical medications for a patient.
    """
    __tablename__ = "medications"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), nullable=False, index=True) # ForeignKey conceptually
    
    name = Column(String(200), nullable=False)
    dosage = Column(String(100), nullable=False)
    frequency = Column(String(100), nullable=False)
    
    status = Column(String(50), default="active") # active, discontinued, completed
    instructions = Column(Text, nullable=True)
    prescribing_doctor = Column(String(100), nullable=True)
    
    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    
    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "name": self.name,
            "dosage": self.dosage,
            "frequency": self.frequency,
            "status": self.status,
            "instructions": self.instructions,
            "prescribing_doctor": self.prescribing_doctor,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "created_at": self.created_at.isoformat()
        }


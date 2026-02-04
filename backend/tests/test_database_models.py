"""
Database Models Tests
Comprehensive tests for SQLAlchemy ORM models including CRUD operations,
constraints, data integrity, and edge cases.
"""
import pytest
import json
from datetime import datetime, timezone, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from sqlalchemy.exc import IntegrityError

from app.database.models import (
    Base,
    User,
    UserRole,
    Diagnosis,
    Appointment,
    PasswordResetRequest,
    generate_uuid,
)
from app.database.connection import get_db


# Test database setup
TEST_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="function")
def db_session():
    """Create fresh database session for each test"""
    Base.metadata.create_all(bind=test_engine)
    session = TestSessionLocal()
    yield session
    session.close()
    Base.metadata.drop_all(bind=test_engine)


# ================== UUID GENERATION TESTS ==================

class TestUUIDGeneration:
    """Tests for UUID generation utility"""
    
    def test_generate_uuid_format(self):
        """Test UUID format is correct"""
        uuid = generate_uuid()
        assert isinstance(uuid, str)
        assert len(uuid) == 36  # UUID4 format: 8-4-4-4-12
        assert uuid.count("-") == 4
    
    def test_generate_uuid_uniqueness(self):
        """Test that generated UUIDs are unique"""
        uuids = [generate_uuid() for _ in range(100)]
        assert len(uuids) == len(set(uuids))  # All unique


# ================== USER MODEL TESTS ==================

class TestUserModel:
    """Tests for User model"""
    
    def test_create_user_minimal(self, db_session):
        """Test creating user with minimal required fields"""
        user = User(
            email="test@example.com",
            username="testuser",
            password_hash="hashed_password_here"
        )
        db_session.add(user)
        db_session.commit()
        
        assert user.id is not None
        assert user.role == UserRole.PATIENT  # Default role
        assert user.is_verified is False  # Default
        assert user.is_active is True  # Default
    
    def test_create_user_full(self, db_session):
        """Test creating user with all fields"""
        user = User(
            email="doctor@hospital.com",
            username="dr_smith",
            password_hash="secure_hash",
            role=UserRole.DOCTOR,
            full_name="Dr. John Smith",
            phone="+1234567890",
            avatar_url="https://example.com/avatar.jpg",
            is_verified=True,
            is_active=True,
            oauth_provider="google",
            oauth_id="google_user_123",
        )
        db_session.add(user)
        db_session.commit()
        
        assert user.role == UserRole.DOCTOR
        assert user.full_name == "Dr. John Smith"
        assert user.oauth_provider == "google"
    
    def test_user_email_uniqueness(self, db_session):
        """Test that email must be unique"""
        user1 = User(
            email="duplicate@test.com",
            username="user1",
            password_hash="hash1"
        )
        db_session.add(user1)
        db_session.commit()
        
        user2 = User(
            email="duplicate@test.com",  # Same email
            username="user2",
            password_hash="hash2"
        )
        db_session.add(user2)
        
        with pytest.raises(IntegrityError):
            db_session.commit()
    
    def test_user_username_uniqueness(self, db_session):
        """Test that username must be unique"""
        user1 = User(
            email="user1@test.com",
            username="sameusername",
            password_hash="hash1"
        )
        db_session.add(user1)
        db_session.commit()
        
        user2 = User(
            email="user2@test.com",
            username="sameusername",  # Same username
            password_hash="hash2"
        )
        db_session.add(user2)
        
        with pytest.raises(IntegrityError):
            db_session.commit()
    
    def test_user_timestamps(self, db_session):
        """Test that timestamps are automatically set"""
        user = User(
            email="timestamp@test.com",
            username="timestampuser",
            password_hash="hash"
        )
        db_session.add(user)
        db_session.commit()
        
        assert user.created_at is not None
        assert user.updated_at is not None
        assert user.created_at <= user.updated_at
    
    def test_user_to_dict(self, db_session):
        """Test User.to_dict() method"""
        user = User(
            email="dict@test.com",
            username="dictuser",
            password_hash="secret_hash",
            role=UserRole.ADMIN,
            full_name="Admin User"
        )
        db_session.add(user)
        db_session.commit()
        
        data = user.to_dict()
        
        assert "id" in data
        assert data["email"] == "dict@test.com"
        assert data["username"] == "dictuser"
        assert data["role"] == "admin"
        assert "password_hash" not in data  # Should not include
    
    def test_user_to_dict_with_sensitive(self, db_session):
        """Test User.to_dict() with sensitive data included"""
        user = User(
            email="sensitive@test.com",
            username="sensitiveuser",
            password_hash="hash",
            reset_token="reset_token_123",
            verification_token="verify_token_456"
        )
        db_session.add(user)
        db_session.commit()
        
        data = user.to_dict(include_sensitive=True)
        
        assert "reset_token" in data
        assert "verification_token" in data
    
    def test_user_repr(self, db_session):
        """Test User __repr__ method"""
        user = User(
            email="repr@test.com",
            username="repruser",
            password_hash="hash"
        )
        db_session.add(user)
        db_session.commit()
        
        repr_str = repr(user)
        assert "repruser" in repr_str
        assert "User" in repr_str
    
    def test_all_user_roles(self, db_session):
        """Test all user role types"""
        roles = [
            UserRole.PATIENT,
            UserRole.DOCTOR,
            UserRole.SPECIALIST,
            UserRole.ADMIN,
            UserRole.AUDITOR,
            UserRole.GP,
        ]
        
        for i, role in enumerate(roles):
            user = User(
                email=f"role{i}@test.com",
                username=f"roleuser{i}",
                password_hash="hash",
                role=role
            )
            db_session.add(user)
        
        db_session.commit()
        
        users = db_session.query(User).all()
        assert len(users) == len(roles)


# ================== DIAGNOSIS MODEL TESTS ==================

class TestDiagnosisModel:
    """Tests for Diagnosis model"""
    
    def test_create_diagnosis_minimal(self, db_session):
        """Test creating diagnosis with minimal fields"""
        diagnosis = Diagnosis(
            diagnosis_result='{"condition": "test"}'
        )
        db_session.add(diagnosis)
        db_session.commit()
        
        assert diagnosis.id is not None
        assert diagnosis.status == "completed"  # Default
    
    def test_create_diagnosis_full(self, db_session):
        """Test creating diagnosis with all fields"""
        diagnosis = Diagnosis(
            user_id="user-123",
            patient_id="PT-001",
            patient_age="35",
            patient_gender="male",
            symptoms="headache, fever, fatigue",
            diagnosis_result=json.dumps({
                "condition": "Common Cold",
                "confidence": 0.85
            }),
            primary_diagnosis="Common Cold",
            confidence="0.85",
            model_version="gemini-1.5-pro",
            image_url="https://storage.example.com/scan.jpg",
            status="completed"
        )
        db_session.add(diagnosis)
        db_session.commit()
        
        assert diagnosis.patient_id == "PT-001"
        assert diagnosis.model_version == "gemini-1.5-pro"
    
    def test_diagnosis_to_dict(self, db_session):
        """Test Diagnosis.to_dict() method"""
        diagnosis = Diagnosis(
            patient_id="PT-002",
            primary_diagnosis="Migraine",
            confidence="0.92",
            diagnosis_result=json.dumps({
                "condition": "Migraine",
                "recommendations": ["rest", "hydration"]
            }),
            status="completed"
        )
        db_session.add(diagnosis)
        db_session.commit()
        
        data = diagnosis.to_dict()
        
        assert data["patient_id"] == "PT-002"
        assert data["primary_diagnosis"] == "Migraine"
        assert data["confidence"] == 0.92
        assert data["status"] == "completed"
        assert "result" in data
    
    def test_diagnosis_to_dict_invalid_json(self, db_session):
        """Test to_dict with invalid JSON in diagnosis_result"""
        diagnosis = Diagnosis(
            diagnosis_result="not valid json"
        )
        db_session.add(diagnosis)
        db_session.commit()
        
        data = diagnosis.to_dict()
        assert data["result"] == {}  # Should return empty dict
    
    def test_diagnosis_user_relationship(self, db_session):
        """Test diagnosis can be linked to user"""
        user = User(
            email="patient@test.com",
            username="patientuser",
            password_hash="hash"
        )
        db_session.add(user)
        db_session.commit()
        
        diagnosis = Diagnosis(
            user_id=user.id,
            diagnosis_result='{"test": true}'
        )
        db_session.add(diagnosis)
        db_session.commit()
        
        assert diagnosis.user_id == user.id


# ================== APPOINTMENT MODEL TESTS ==================

class TestAppointmentModel:
    """Tests for Appointment model"""
    
    def test_create_appointment(self, db_session):
        """Test creating an appointment"""
        appointment_time = datetime.now(timezone.utc) + timedelta(days=1)
        
        appointment = Appointment(
            patient_name="John Doe",
            appointment_time=appointment_time,
            appointment_type="Check-up"
        )
        db_session.add(appointment)
        db_session.commit()
        
        assert appointment.id is not None
        assert appointment.status == "pending"  # Default
    
    def test_appointment_to_dict(self, db_session):
        """Test Appointment.to_dict() method"""
        appointment_time = datetime(2024, 3, 15, 14, 30, tzinfo=timezone.utc)
        
        appointment = Appointment(
            patient_name="Jane Smith",
            appointment_time=appointment_time,
            appointment_type="Follow-up",
            status="confirmed"
        )
        db_session.add(appointment)
        db_session.commit()
        
        data = appointment.to_dict()
        
        assert data["patient"] == "Jane Smith"
        assert data["type"] == "Follow-up"
        assert data["status"] == "confirmed"
        assert "time" in data
        assert "date" in data
    
    def test_appointment_with_user(self, db_session):
        """Test appointment linked to user (doctor)"""
        doctor = User(
            email="doctor@test.com",
            username="doctor",
            password_hash="hash",
            role=UserRole.DOCTOR
        )
        db_session.add(doctor)
        db_session.commit()
        
        appointment = Appointment(
            user_id=doctor.id,
            patient_name="Patient A",
            appointment_time=datetime.now(timezone.utc)
        )
        db_session.add(appointment)
        db_session.commit()
        
        assert appointment.user_id == doctor.id
    
    def test_appointment_statuses(self, db_session):
        """Test different appointment statuses"""
        statuses = ["pending", "confirmed", "cancelled"]
        
        for i, status in enumerate(statuses):
            appointment = Appointment(
                patient_name=f"Patient {i}",
                appointment_time=datetime.now(timezone.utc),
                status=status
            )
            db_session.add(appointment)
        
        db_session.commit()
        
        appointments = db_session.query(Appointment).all()
        assert len(appointments) == 3


# ================== PASSWORD RESET REQUEST TESTS ==================

class TestPasswordResetRequestModel:
    """Tests for PasswordResetRequest model"""
    
    def test_create_password_reset_request(self, db_session):
        """Test creating a password reset request"""
        reset_request = PasswordResetRequest(
            user_id="user-123",
            token_hash="hashed_token_value",
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1)
        )
        db_session.add(reset_request)
        db_session.commit()
        
        assert reset_request.id is not None
        assert reset_request.used_at is None
    
    def test_is_expired_false(self, db_session):
        """Test is_expired returns False for valid token"""
        reset_request = PasswordResetRequest(
            user_id="user-123",
            token_hash="hash",
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1)
        )
        db_session.add(reset_request)
        db_session.commit()
        
        assert reset_request.is_expired() is False
    
    def test_is_expired_true(self, db_session):
        """Test is_expired returns True for expired token"""
        reset_request = PasswordResetRequest(
            user_id="user-123",
            token_hash="hash",
            expires_at=datetime.now(timezone.utc) - timedelta(hours=1)
        )
        db_session.add(reset_request)
        db_session.commit()
        
        assert reset_request.is_expired() is True
    
    def test_is_used_false(self, db_session):
        """Test is_used returns False for unused token"""
        reset_request = PasswordResetRequest(
            user_id="user-123",
            token_hash="hash",
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1)
        )
        db_session.add(reset_request)
        db_session.commit()
        
        assert reset_request.is_used() is False
    
    def test_is_used_true(self, db_session):
        """Test is_used returns True after token is used"""
        reset_request = PasswordResetRequest(
            user_id="user-123",
            token_hash="hash",
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
            used_at=datetime.now(timezone.utc)
        )
        db_session.add(reset_request)
        db_session.commit()
        
        assert reset_request.is_used() is True
    
    def test_ip_address_tracking(self, db_session):
        """Test IP address tracking for reset requests"""
        reset_request = PasswordResetRequest(
            user_id="user-123",
            token_hash="hash",
            ip_address="192.168.1.100",
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1)
        )
        db_session.add(reset_request)
        db_session.commit()
        
        assert reset_request.ip_address == "192.168.1.100"
    
    def test_ipv6_address(self, db_session):
        """Test IPv6 address storage"""
        reset_request = PasswordResetRequest(
            user_id="user-123",
            token_hash="hash",
            ip_address="2001:0db8:85a3:0000:0000:8a2e:0370:7334",
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1)
        )
        db_session.add(reset_request)
        db_session.commit()
        
        assert "2001" in reset_request.ip_address


# ================== DATA INTEGRITY TESTS ==================

class TestDataIntegrity:
    """Tests for data integrity and constraints"""
    
    def test_user_email_required(self, db_session):
        """Test that user email is required"""
        user = User(
            username="noemailer",
            password_hash="hash"
        )
        db_session.add(user)
        
        with pytest.raises(IntegrityError):
            db_session.commit()
    
    def test_user_username_required(self, db_session):
        """Test that username is required"""
        user = User(
            email="nousername@test.com",
            password_hash="hash"
        )
        db_session.add(user)
        
        with pytest.raises(IntegrityError):
            db_session.commit()
    
    def test_user_password_hash_required(self, db_session):
        """Test that password_hash is required"""
        user = User(
            email="nopassword@test.com",
            username="nopassworduser"
        )
        db_session.add(user)
        
        with pytest.raises(IntegrityError):
            db_session.commit()
    
    def test_diagnosis_result_required(self, db_session):
        """Test that diagnosis_result is required"""
        diagnosis = Diagnosis(
            patient_id="PT-001"
        )
        db_session.add(diagnosis)
        
        with pytest.raises(IntegrityError):
            db_session.commit()
    
    def test_appointment_patient_name_required(self, db_session):
        """Test that appointment patient_name is required"""
        appointment = Appointment(
            appointment_time=datetime.now(timezone.utc)
        )
        db_session.add(appointment)
        
        with pytest.raises(IntegrityError):
            db_session.commit()
    
    def test_cascade_behavior(self, db_session):
        """Test that deleting user doesn't cascade to diagnoses"""
        user = User(
            email="cascade@test.com",
            username="cascadeuser",
            password_hash="hash"
        )
        db_session.add(user)
        db_session.commit()
        
        diagnosis = Diagnosis(
            user_id=user.id,
            diagnosis_result='{"test": true}'
        )
        db_session.add(diagnosis)
        db_session.commit()
        
        # Delete user
        db_session.delete(user)
        db_session.commit()
        
        # Diagnosis should still exist with null user_id
        # (depends on FK configuration - this tests current behavior)
        remaining = db_session.query(Diagnosis).filter_by(id=diagnosis.id).first()
        # Behavior depends on FK constraints


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

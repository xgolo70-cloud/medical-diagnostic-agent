"""
Pytest configuration and fixtures for API testing.
Sets up test database with sample users for authentication tests.
"""
# CRITICAL: Set environment variables BEFORE any other imports
# This ensures rate limiting is disabled when modules are loaded
import os
os.environ["RATE_LIMIT_ENABLED"] = "false"
os.environ["DEMO_MODE"] = "true"
os.environ["TESTING"] = "true"

import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database.models import Base, User, UserRole
from app.database.connection import get_db
from app.core.auth import hash_password


# Test database URL (in-memory SQLite)
TEST_DATABASE_URL = "sqlite:///:memory:"

# Create test engine with special settings for in-memory SQLite
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    """Override database dependency for tests"""
    try:
        db = TestSessionLocal()
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function", autouse=True)
def reset_rate_limiter():
    """Reset rate limiter before each test to prevent 429 errors"""
    try:
        from app.core.rate_limit import limiter
        if hasattr(limiter, '_backend') and hasattr(limiter._backend, '_requests'):
            limiter._backend._requests.clear()
        if hasattr(limiter, '_backend') and hasattr(limiter._backend, '_blocked'):
            limiter._backend._blocked.clear()
    except Exception:
        pass  # Rate limiter may not be available in all contexts
    yield


@pytest.fixture(scope="function")
def test_db():
    """Create test database and tables for each test function"""
    # Create all tables
    Base.metadata.create_all(bind=test_engine)
    
    # Override the database dependency
    app.dependency_overrides[get_db] = override_get_db
    
    # Create session for fixture
    db = TestSessionLocal()
    
    yield db
    
    # Cleanup
    db.close()
    Base.metadata.drop_all(bind=test_engine)
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def test_users(test_db):
    """Create test users in the database"""
    users = [
        User(
            email="admin@test.com",
            username="admin",
            password_hash=hash_password("Admin123!"),
            role=UserRole.ADMIN,
            full_name="Test Admin",
            is_verified=True,
            is_active=True,
        ),
        User(
            email="doctor@test.com",
            username="doctor",
            password_hash=hash_password("Doctor123!"),
            role=UserRole.SPECIALIST,
            full_name="Dr. Test",
            is_verified=True,
            is_active=True,
        ),
        User(
            email="patient@test.com",
            username="patient",
            password_hash=hash_password("Patient123!"),
            role=UserRole.PATIENT,
            full_name="Test Patient",
            is_verified=True,
            is_active=True,
        ),
    ]
    
    for user in users:
        test_db.add(user)
    test_db.commit()
    
    return users


@pytest.fixture(scope="function")
def client(test_db, test_users):
    """Create test client with test database"""
    return TestClient(app)


@pytest.fixture
def mock_gemini():
    """Mock Gemini API for tests"""
    with patch('google.generativeai.GenerativeModel') as mock:
        yield mock


@pytest.fixture
def mock_supabase_storage():
    """Mock Supabase storage for tests"""
    with patch('app.core.storage.get_storage_client') as mock:
        storage_mock = MagicMock()
        storage_mock.from_.return_value.upload.return_value = {"path": "test/file.jpg"}
        storage_mock.from_.return_value.create_signed_url.return_value = {"signedURL": "https://example.com/signed"}
        storage_mock.from_.return_value.get_public_url.return_value = "https://example.com/public"
        storage_mock.from_.return_value.remove.return_value = None
        storage_mock.from_.return_value.list.return_value = []
        storage_mock.get_bucket.return_value = {"name": "medical-images"}
        storage_mock.create_bucket.return_value = {"name": "medical-images"}
        mock.return_value = storage_mock
        yield storage_mock


@pytest.fixture
def auth_headers(client):
    """Get authentication headers for a logged-in admin user"""
    response = client.post("/api/auth/login", json={
        "username": "admin",
        "password": "Admin123!"
    })
    if response.status_code == 200:
        tokens = response.json()
        return {"Authorization": f"Bearer {tokens['access_token']}"}
    return {}


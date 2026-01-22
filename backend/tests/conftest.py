"""
Pytest configuration and fixtures for API testing.
Sets up test database with sample users for authentication tests.
"""
import pytest
from unittest.mock import patch
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

"""
Tests for core security module.
Tests password hashing, verification, and token creation.
"""
import pytest
from app.core.security import verify_password, get_password_hash, create_access_token


def test_password_hash_and_verify():
    """Hashing then verifying should succeed"""
    password = "TestPassword123!"
    hashed = get_password_hash(password)
    
    # Hash should be different from plain text
    assert hashed != password
    
    # Verification should work
    assert verify_password(password, hashed) is True


def test_password_verify_wrong():
    """Wrong password should fail verification"""
    hashed = get_password_hash("CorrectPassword123!")
    assert verify_password("WrongPassword123!", hashed) is False


def test_create_access_token():
    """Token creation should return a valid JWT string"""
    token = create_access_token(data={"sub": "testuser", "role": "admin"})
    assert isinstance(token, str)
    assert len(token) > 0
    # JWT tokens have 3 parts separated by dots
    assert len(token.split('.')) == 3

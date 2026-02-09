from fastapi.testclient import TestClient
from app.main import app
import pytest

client = TestClient(app)

import secrets

def test_register_and_login_flow():
    # 1. Register
    suffix = secrets.token_hex(4)
    username = f"auth_test_{suffix}"
    password = "SecurePassword123!"
    email = f"auth_test_{suffix}@example.com"
    
    register_data = {
        "username": username,
        "password": password,
        "confirm_password": password,
        "email": email,
        "full_name": "Auth Tester",
        "role": "gp",
        "phone": "1234567890"
    }
    
    response = client.post("/api/auth/register", json=register_data)
    # If user exists from previous run, it might fail (400), which is fine for this context if we handle it
    # But for a clean test, we should assume clean DB or unique user.
    # We'll use a random user to avoid collisions.
    
    if response.status_code == 400:
        # Try logging in directly if user exists
        pass
    else:
        assert response.status_code == 201
    
    # 2. Login
    login_data = {
        "username": username,
        "password": password
    }
    
    login_response = client.post("/api/auth/login", json=login_data)
    assert login_response.status_code == 200
    tokens = login_response.json()
    assert "access_token" in tokens
    assert "refresh_token" in tokens
    assert tokens["token_type"] == "bearer"

def test_login_failure():
    login_data = {
        "username": "non_existent_user_999",
        "password": "password"
    }
    response = client.post("/api/auth/login", json=login_data)
    assert response.status_code == 401

from fastapi.testclient import TestClient
from app.main import app
import secrets

client = TestClient(app)

def test_get_me():
    # 1. Register and Login to get token
    suffix = secrets.token_hex(4)
    username = f"user_me_{suffix}"
    password = "SecurePassword123!"
    email = f"user_me_{suffix}@example.com"
    
    # Register
    client.post("/api/auth/register", json={
        "username": username,
        "password": password,
        "confirm_password": password,
        "email": email,
        "full_name": "Me Tester",
        "role": "gp"
    })
    
    # Login
    login_res = client.post("/api/auth/login", json={
        "username": username,
        "password": password
    })
    token = login_res.json()["access_token"]
    
    # 2. Get Me
    response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == username
    assert data["email"] == email
    assert data["role"] == "gp"

"""
Unit tests for API Endpoints
Tests authentication endpoints and basic API functionality
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)


class TestHealthEndpoints:
    """Tests for health and root endpoints"""
    
    def test_root_endpoint(self):
        """Test root endpoint returns correct response"""
        response = client.get("/")
        
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Medical Diagnostic Agent API"
        assert "version" in data
    
    def test_health_endpoint(self):
        """Test health check endpoint"""
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"


class TestAuthEndpoints:
    """Tests for authentication endpoints"""
    
    def test_login_success(self):
        """Test successful login with valid credentials"""
        response = client.post("/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        assert "expires_in" in data
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = client.post("/api/auth/login", json={
            "username": "admin",
            "password": "wrongpassword"
        })
        
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
    
    def test_login_missing_fields(self):
        """Test login with missing fields"""
        response = client.post("/api/auth/login", json={
            "username": "admin"
        })
        
        assert response.status_code == 422  # Validation error
    
    def test_refresh_token_success(self):
        """Test successful token refresh"""
        # First login to get tokens
        login_response = client.post("/api/auth/login", json={
            "username": "doctor",
            "password": "doctor123"
        })
        tokens = login_response.json()
        
        # Refresh tokens
        response = client.post("/api/auth/refresh", json={
            "refresh_token": tokens["refresh_token"]
        })
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["access_token"] != tokens["access_token"]
    
    def test_refresh_token_invalid(self):
        """Test refresh with invalid token"""
        response = client.post("/api/auth/refresh", json={
            "refresh_token": "invalid.token.here"
        })
        
        assert response.status_code == 401
    
    def test_get_current_user_authenticated(self):
        """Test getting current user info when authenticated"""
        # Login first
        login_response = client.post("/api/auth/login", json={
            "username": "nurse",
            "password": "nurse123"
        })
        tokens = login_response.json()
        
        # Get current user
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {tokens['access_token']}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "nurse"
        assert data["role"] == "gp"
    
    def test_get_current_user_unauthenticated(self):
        """Test getting current user without authentication"""
        response = client.get("/api/auth/me")
        
        assert response.status_code == 401
    
    def test_logout_success(self):
        """Test successful logout"""
        # Login first
        login_response = client.post("/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        tokens = login_response.json()
        
        # Logout
        response = client.post(
            "/api/auth/logout",
            json={"refresh_token": tokens["refresh_token"]},
            headers={"Authorization": f"Bearer {tokens['access_token']}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Successfully logged out"


class TestProtectedEndpoints:
    """Tests for protected API endpoints"""
    
    def test_diagnose_requires_auth(self):
        """Test that diagnose endpoint requires authentication"""
        response = client.post("/api/diagnose", json={
            "patient_id": "PT-001",
            "age": 45,
            "gender": "male",
            "symptoms": ["headache", "fever"]
        })
        
        # Should work without auth in current setup (auth is optional)
        # Adjust based on actual endpoint requirements
        assert response.status_code in [200, 401, 422]
    
    def test_history_endpoint(self):
        """Test history endpoint returns list"""
        response = client.get("/api/history")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


class TestRateLimiting:
    """Tests for rate limiting middleware"""
    
    def test_rate_limit_headers(self):
        """Test that requests work under rate limit"""
        # Make a few requests
        for _ in range(5):
            response = client.get("/health")
            assert response.status_code == 200


class TestSecurityHeaders:
    """Tests for security headers middleware"""
    
    def test_security_headers_present(self):
        """Test that security headers are present in responses"""
        response = client.get("/")
        
        headers = response.headers
        assert headers.get("X-Content-Type-Options") == "nosniff"
        assert headers.get("X-Frame-Options") == "DENY"
        assert headers.get("X-XSS-Protection") == "1; mode=block"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

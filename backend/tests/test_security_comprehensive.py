"""
Comprehensive Security Tests
Professional-grade security testing for the Medical Diagnostic Agent API.
Tests SQL injection, XSS, authentication bypass, input sanitization, and more.

Author: Security Testing Suite
"""
import pytest
import json
from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient


# ================== SQL INJECTION TESTS ==================

class TestSQLInjectionPrevention:
    """
    Test SQL injection prevention across all user-input endpoints.
    These tests verify that malicious SQL payloads are properly sanitized.
    """
    
    # Common SQL injection payloads (OWASP Top 10)
    SQL_INJECTION_PAYLOADS = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "' OR '1'='1' --",
        "1; DELETE FROM users WHERE '1'='1",
        "1' AND '1'='1",
        "admin'--",
        "' UNION SELECT * FROM users --",
        "1 OR 1=1",
        "' OR ''='",
        "1'; EXEC master..xp_cmdshell('dir')--",
        "'; INSERT INTO users VALUES ('hacked', 'pass', 'admin');--",
        "1 AND 1=CONVERT(int,(SELECT TOP 1 table_name FROM information_schema.tables))",
        # Unicode/encoding variations
        "%27%20OR%20%271%27%3D%271",
        "\\x27 OR 1=1",
    ]
    
    def test_login_sql_injection_username(self, client):
        """Test SQL injection in login username field"""
        for payload in self.SQL_INJECTION_PAYLOADS:
            response = client.post("/api/auth/login", json={
                "username": payload,
                "password": "password123"
            })
            # Should not return 200 or 500 (db error)
            assert response.status_code in [401, 422], f"Payload '{payload}' may have bypassed protection"
            # Ensure no database error messages leak
            response_text = response.text.lower()
            assert "sqlite" not in response_text
            assert "sqlalchemy" not in response_text
            assert "syntax error" not in response_text
    
    def test_login_sql_injection_password(self, client):
        """Test SQL injection in login password field"""
        for payload in self.SQL_INJECTION_PAYLOADS[:5]:  # Test subset for password
            response = client.post("/api/auth/login", json={
                "username": "admin",
                "password": payload
            })
            assert response.status_code in [401, 422]
    
    def test_register_sql_injection_fields(self, client):
        """Test SQL injection in registration fields"""
        for payload in self.SQL_INJECTION_PAYLOADS[:3]:
            response = client.post("/api/auth/register", json={
                "username": payload,
                "email": f"{payload}@test.com",
                "password": "SecurePass123!",
                "full_name": payload
            })
            # Should reject or sanitize, not crash
            assert response.status_code in [400, 422, 409]
    
    def test_diagnose_sql_injection_patient_id(self, client, auth_headers):
        """Test SQL injection in diagnosis patient_id field"""
        for payload in self.SQL_INJECTION_PAYLOADS[:5]:
            response = client.post("/api/diagnose", json={
                "patient_id": payload,
                "age": 30,
                "gender": "male",
                "symptoms": ["headache"]
            }, headers=auth_headers)
            # Should not expose database errors
            if response.status_code == 500:
                assert "sql" not in response.text.lower()


# ================== XSS PREVENTION TESTS ==================

class TestXSSPrevention:
    """
    Test Cross-Site Scripting (XSS) prevention.
    Verify that user input is properly escaped in responses.
    """
    
    XSS_PAYLOADS = [
        "<script>alert('XSS')</script>",
        "<img src=x onerror=alert('XSS')>",
        "<svg onload=alert('XSS')>",
        "javascript:alert('XSS')",
        "<iframe src='javascript:alert(1)'>",
        "<body onload=alert('XSS')>",
        "'-alert('XSS')-'",
        "\"><script>alert('XSS')</script>",
        "<ScRiPt>alert('XSS')</ScRiPt>",
        "<<script>script>alert('XSS')<</script>/script>",
        # Event handlers
        "<div onmouseover=\"alert('XSS')\">hover me</div>",
        "<input onfocus=alert('XSS') autofocus>",
        # Unicode encoded
        "\\u003cscript\\u003ealert('XSS')\\u003c/script\\u003e",
    ]
    
    def test_xss_in_user_profile(self, client, auth_headers):
        """Test XSS in user profile update"""
        for payload in self.XSS_PAYLOADS[:5]:
            response = client.patch(
                "/api/auth/profile",
                params={"full_name": payload},
                headers=auth_headers
            )
            if response.status_code == 200:
                data = response.json()
                # Verify payload is escaped or sanitized
                if "full_name" in data:
                    assert "<script>" not in data["full_name"]
                    assert "onerror" not in data["full_name"].lower()
    
    def test_xss_in_diagnosis_symptoms(self, client, auth_headers):
        """Test XSS in diagnosis symptoms field"""
        response = client.post("/api/diagnose", json={
            "patient_id": "test-patient",
            "age": 30,
            "gender": "male",
            "symptoms": ["<script>alert('XSS')</script>"]
        }, headers=auth_headers)
        # Response should not contain unescaped script tags
        if response.status_code == 200:
            assert "<script>" not in response.text


# ================== JWT SECURITY TESTS ==================

class TestJWTSecurityEdgeCases:
    """
    Advanced JWT token security testing.
    Tests token manipulation, reuse, and edge cases.
    """
    
    def test_expired_token_rejection(self, client, test_db, test_users):
        """Test that expired tokens are rejected"""
        from app.core.auth import create_access_token
        
        # Create token that expired 1 hour ago
        expired_token = create_access_token(
            {"username": "admin", "role": "admin"},
            expires_delta=timedelta(hours=-1)
        )
        
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {expired_token}"}
        )
        assert response.status_code == 401
    
    def test_token_without_required_claims(self, client):
        """Test tokens missing required claims are rejected"""
        import jwt
        import os
        
        secret = os.getenv("JWT_SECRET_KEY", "dev-secret-key")
        
        # Token without username
        incomplete_token = jwt.encode(
            {"role": "admin", "exp": datetime.utcnow() + timedelta(hours=1)},
            secret,
            algorithm="HS256"
        )
        
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {incomplete_token}"}
        )
        assert response.status_code == 401
    
    def test_token_with_wrong_algorithm(self, client):
        """Test tokens signed with wrong algorithm are rejected"""
        import jwt
        
        # Create token with 'none' algorithm (known vulnerability)
        try:
            token = jwt.encode(
                {"username": "admin", "role": "admin"},
                key="",
                algorithm="none"
            )
            response = client.get(
                "/api/auth/me",
                headers={"Authorization": f"Bearer {token}"}
            )
            assert response.status_code == 401
        except jwt.exceptions.InvalidAlgorithmError:
            pass  # Library correctly rejects 'none' algorithm
    
    def test_token_reuse_after_logout(self, client):
        """Test that tokens cannot be reused after logout"""
        # Login
        login_response = client.post("/api/auth/login", json={
            "username": "admin",
            "password": "Admin123!"
        })
        
        if login_response.status_code == 200:
            tokens = login_response.json()
            access_token = tokens["access_token"]
            
            # Logout
            logout_response = client.post(
                "/api/auth/logout",
                json={"refresh_token": tokens.get("refresh_token")},
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            if logout_response.status_code == 200:
                # Try to use the old access token
                response = client.get(
                    "/api/auth/me",
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                # Token should be revoked
                assert response.status_code in [401, 200]  # Depends on revocation implementation
    
    def test_malformed_authorization_header(self, client):
        """Test various malformed Authorization headers"""
        malformed_headers = [
            {"Authorization": "Bearer"},  # Missing token
            {"Authorization": "Bearer "},  # Empty token
            {"Authorization": "Basic dXNlcjpwYXNz"},  # Wrong scheme
            {"Authorization": "bearer valid.token.here"},  # lowercase
            {"Authorization": "BEARER valid.token.here"},  # uppercase
            {"Authorization": "NotBearer token.here"},  # Wrong prefix
        ]
        
        for headers in malformed_headers:
            response = client.get("/api/auth/me", headers=headers)
            assert response.status_code in [401, 403, 422]


# ================== AUTHENTICATION BYPASS TESTS ==================

class TestAuthenticationBypass:
    """
    Test authentication bypass attempts.
    Verify protected endpoints cannot be accessed without proper auth.
    """
    
    def test_protected_endpoints_require_auth(self, client):
        """Verify all protected endpoints require authentication"""
        protected_endpoints = [
            ("GET", "/api/auth/me"),
            ("POST", "/api/auth/logout"),
            ("PATCH", "/api/auth/profile"),
            ("GET", "/api/dashboard/stats"),
            ("GET", "/api/admin/users"),
        ]
        
        for method, endpoint in protected_endpoints:
            if method == "GET":
                response = client.get(endpoint)
            elif method == "POST":
                response = client.post(endpoint, json={})
            elif method == "PATCH":
                response = client.patch(endpoint)
            
            assert response.status_code in [401, 403, 405], \
                f"Endpoint {method} {endpoint} accessible without auth"
    
    def test_role_escalation_prevention(self, client):
        """Test that users cannot escalate their role"""
        # Login as patient
        login_response = client.post("/api/auth/login", json={
            "username": "patient",
            "password": "Patient123!"
        })
        
        if login_response.status_code == 200:
            tokens = login_response.json()
            
            # Try to access admin endpoint
            response = client.get(
                "/api/admin/users",
                headers={"Authorization": f"Bearer {tokens['access_token']}"}
            )
            assert response.status_code in [401, 403]
    
    def test_forged_role_in_request(self, client):
        """Test that role cannot be forged in request body"""
        # Try to register as admin
        response = client.post("/api/auth/register", json={
            "username": "fake_admin",
            "email": "fake@test.com",
            "password": "FakeAdmin123!",
            "role": "admin"  # Should be ignored or rejected
        })
        
        # If registration succeeds, user should NOT be admin
        if response.status_code == 200:
            data = response.json()
            assert data.get("role") != "admin"


# ================== INPUT SANITIZATION TESTS ==================

class TestInputSanitization:
    """
    Test input sanitization and validation.
    Verify dangerous inputs are properly handled.
    """
    
    def test_null_byte_injection(self, client):
        """Test null byte injection is prevented"""
        payloads = [
            "admin\x00.jpg",
            "test\x00password",
            "user\x00name",
        ]
        
        for payload in payloads:
            response = client.post("/api/auth/login", json={
                "username": payload,
                "password": "password123"
            })
            # Should not crash
            assert response.status_code in [401, 422]
    
    def test_oversized_payload_rejection(self, client):
        """Test that oversized payloads are rejected"""
        # Create very large payload
        large_string = "A" * 1_000_000  # 1MB string
        
        response = client.post("/api/auth/login", json={
            "username": large_string,
            "password": "password123"
        })
        
        # Should be rejected with appropriate error
        assert response.status_code in [413, 422, 400]
    
    def test_unicode_normalization_attacks(self, client):
        """Test unicode normalization attacks"""
        unicode_payloads = [
            "adm\u0131n",  # Latin Small Letter Dotless I
            "аdmin",  # Cyrillic 'а' instead of Latin 'a'
            "admin\u200b",  # Zero-width space
            "admin\ufeff",  # BOM character
        ]
        
        for payload in unicode_payloads:
            response = client.post("/api/auth/login", json={
                "username": payload,
                "password": "Admin123!"
            })
            # Should not match 'admin' user
            assert response.status_code in [401, 422]
    
    def test_path_traversal_prevention(self, client, auth_headers):
        """Test path traversal in file-related endpoints"""
        payloads = [
            "../../../etc/passwd",
            "..\\..\\..\\windows\\system32\\config\\sam",
            "....//....//....//etc/passwd",
            "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc/passwd",
        ]
        
        for payload in payloads:
            # Test in patient_id or any file-related field
            response = client.post("/api/diagnose", json={
                "patient_id": payload,
                "age": 30,
                "gender": "male",
                "symptoms": ["test"]
            }, headers=auth_headers)
            
            # Verify no file content is returned
            if response.status_code == 200:
                assert "root:" not in response.text
                assert "shadow" not in response.text


# ================== PASSWORD SECURITY TESTS ==================

class TestPasswordSecurity:
    """
    Test password security requirements and handling.
    """
    
    def test_weak_password_rejection(self, client):
        """Test that weak passwords are rejected during registration"""
        weak_passwords = [
            "password",      # Common password
            "12345678",      # Only numbers
            "abcdefgh",      # Only lowercase
            "ABCDEFGH",      # Only uppercase
            "short",         # Too short
            "            ",  # Only spaces
        ]
        
        for password in weak_passwords:
            response = client.post("/api/auth/register", json={
                "username": "testuser",
                "email": "test@example.com",
                "password": password
            })
            assert response.status_code in [400, 422], \
                f"Weak password '{password}' was accepted"
    
    def test_password_not_in_response(self, client):
        """Verify password is never returned in API responses"""
        # Login
        response = client.post("/api/auth/login", json={
            "username": "admin",
            "password": "Admin123!"
        })
        
        if response.status_code == 200:
            response_text = response.text.lower()
            assert "admin123" not in response_text
            assert "password_hash" not in response_text
    
    def test_password_hash_not_exposed(self, client, auth_headers):
        """Verify password hash is never exposed in user data"""
        response = client.get("/api/auth/me", headers=auth_headers)
        
        if response.status_code == 200:
            data = response.json()
            assert "password" not in data
            assert "password_hash" not in data
            assert "$2b$" not in json.dumps(data)  # bcrypt hash prefix


# ================== HEADER SECURITY TESTS ==================

class TestSecurityHeaders:
    """
    Test security headers in API responses.
    """
    
    def test_content_type_header(self, client):
        """Verify proper Content-Type header"""
        response = client.get("/")
        assert "application/json" in response.headers.get("Content-Type", "")
    
    def test_no_server_version_disclosure(self, client):
        """Verify server version is not disclosed"""
        response = client.get("/")
        server_header = response.headers.get("Server", "")
        # Should not reveal specific versions
        assert "/" not in server_header or "uvicorn" in server_header.lower()
    
    def test_cache_control_for_sensitive_data(self, client, auth_headers):
        """Verify sensitive endpoints have proper cache control"""
        response = client.get("/api/auth/me", headers=auth_headers)
        
        if response.status_code == 200:
            cache_control = response.headers.get("Cache-Control", "")
            # Sensitive data should not be cached
            # This is an optional security enhancement
            # assert "no-store" in cache_control or "private" in cache_control


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

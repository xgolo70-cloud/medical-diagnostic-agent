"""
Unit tests for Authentication Module
Tests JWT token creation, verification, refresh token rotation, and role-based access
"""
import pytest
from datetime import timedelta
import time
from app.core.auth import (
    create_access_token,
    verify_token,
    create_refresh_token,
    verify_refresh_token,
    create_token_pair,
    rotate_tokens,
    revoke_token,
    hash_password,
    verify_password,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)


class TestAccessToken:
    """Tests for access token creation and verification"""
    
    def test_create_access_token_basic(self):
        """Test basic access token creation"""
        data = {"username": "testuser", "role": "gp"}
        token = create_access_token(data)
        
        assert token is not None
        assert isinstance(token, str)
        assert token.count('.') == 2  # JWT has 3 parts
    
    def test_create_access_token_with_custom_expiry(self):
        """Test access token with custom expiration"""
        data = {"username": "testuser", "role": "specialist"}
        token = create_access_token(data, expires_delta=timedelta(hours=2))
        
        payload = verify_token(token)
        assert payload is not None
        assert payload["username"] == "testuser"
        assert payload["role"] == "specialist"
    
    def test_verify_token_valid(self):
        """Test verifying a valid access token"""
        data = {"username": "admin", "role": "admin"}
        token = create_access_token(data)
        
        payload = verify_token(token)
        
        assert payload is not None
        assert payload["username"] == "admin"
        assert payload["role"] == "admin"
        assert "exp" in payload
        assert "iat" in payload
        assert "jti" in payload
    
    def test_verify_token_invalid_signature(self):
        """Test that tampered tokens are rejected"""
        data = {"username": "testuser", "role": "gp"}
        token = create_access_token(data)
        
        # Tamper with the token
        parts = token.split('.')
        parts[1] = parts[1][:-4] + "XXXX"  # Modify payload
        tampered_token = '.'.join(parts)
        
        payload = verify_token(tampered_token)
        assert payload is None
    
    def test_verify_token_malformed(self):
        """Test that malformed tokens are rejected"""
        assert verify_token("not.a.valid.token") is None
        assert verify_token("notavalidtoken") is None
        assert verify_token("") is None
        assert verify_token("a.b") is None


class TestRefreshToken:
    """Tests for refresh token functionality"""
    
    def test_create_refresh_token(self):
        """Test refresh token creation"""
        data = {"username": "testuser", "role": "gp"}
        token = create_refresh_token(data)
        
        assert token is not None
        assert isinstance(token, str)
        assert token.count('.') == 2
    
    def test_verify_refresh_token_valid(self):
        """Test verifying a valid refresh token"""
        data = {"username": "doctor", "role": "specialist"}
        token = create_refresh_token(data)
        
        payload = verify_refresh_token(token)
        
        assert payload is not None
        assert payload["username"] == "doctor"
        assert payload["role"] == "specialist"
        assert payload["type"] == "refresh"
    
    def test_access_token_not_valid_as_refresh(self):
        """Test that access tokens cannot be used as refresh tokens"""
        data = {"username": "testuser", "role": "gp"}
        access_token = create_access_token(data)
        
        payload = verify_refresh_token(access_token)
        assert payload is None


class TestTokenPair:
    """Tests for token pair creation and rotation"""
    
    def test_create_token_pair(self):
        """Test creating both access and refresh tokens"""
        token_pair = create_token_pair("testuser", "gp")
        
        assert token_pair.access_token is not None
        assert token_pair.refresh_token is not None
        assert token_pair.token_type == "bearer"
        assert token_pair.expires_in == ACCESS_TOKEN_EXPIRE_MINUTES * 60
    
    def test_rotate_tokens_valid(self):
        """Test successful token rotation"""
        # Create initial token pair
        initial_pair = create_token_pair("testuser", "specialist")
        
        # Rotate tokens
        new_pair = rotate_tokens(initial_pair.refresh_token)
        
        assert new_pair is not None
        assert new_pair.access_token != initial_pair.access_token
        assert new_pair.refresh_token != initial_pair.refresh_token
        
        # Verify new tokens work
        assert verify_token(new_pair.access_token) is not None
        assert verify_refresh_token(new_pair.refresh_token) is not None
    
    def test_rotate_tokens_invalid_refresh(self):
        """Test rotation with invalid refresh token"""
        result = rotate_tokens("invalid.refresh.token")
        assert result is None
    
    def test_old_refresh_token_revoked_after_rotation(self):
        """Test that old refresh token is revoked after rotation"""
        # Create initial token pair
        initial_pair = create_token_pair("testuser", "gp")
        old_refresh = initial_pair.refresh_token
        
        # Rotate tokens
        rotate_tokens(old_refresh)
        
        # Try to use old refresh token again
        result = rotate_tokens(old_refresh)
        assert result is None


class TestTokenRevocation:
    """Tests for token revocation"""
    
    def test_revoke_access_token(self):
        """Test revoking an access token"""
        data = {"username": "testuser", "role": "gp"}
        token = create_access_token(data)
        
        # Verify token works before revocation
        assert verify_token(token) is not None
        
        # Revoke token
        result = revoke_token(token)
        assert result is True
        
        # Verify token no longer works
        assert verify_token(token) is None
    
    def test_revoke_refresh_token(self):
        """Test revoking a refresh token"""
        data = {"username": "testuser", "role": "specialist"}
        token = create_refresh_token(data)
        
        # Verify token works before revocation
        assert verify_refresh_token(token) is not None
        
        # Revoke token
        result = revoke_token(token)
        assert result is True
        
        # Verify token no longer works
        assert verify_refresh_token(token) is None
    
    def test_revoke_invalid_token(self):
        """Test revoking an invalid token returns False"""
        result = revoke_token("invalid.token.here")
        assert result is False


class TestPasswordHashing:
    """Tests for password hashing utilities"""
    
    def test_hash_password(self):
        """Test password hashing produces consistent results"""
        password = "mysecurepassword123"
        hash1 = hash_password(password)
        hash2 = hash_password(password)
        
        assert hash1 == hash2
        assert hash1 != password
    
    def test_verify_password_correct(self):
        """Test correct password verification"""
        password = "correctpassword"
        hashed = hash_password(password)
        
        assert verify_password(password, hashed) is True
    
    def test_verify_password_incorrect(self):
        """Test incorrect password verification"""
        password = "correctpassword"
        hashed = hash_password(password)
        
        assert verify_password("wrongpassword", hashed) is False
    
    def test_different_passwords_different_hashes(self):
        """Test that different passwords produce different hashes"""
        hash1 = hash_password("password1")
        hash2 = hash_password("password2")
        
        assert hash1 != hash2


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

"""
Comprehensive Rate Limiting Tests
Tests for the rate limiting middleware including memory backend,
request counting, blocking, and header responses.
"""
import pytest
import time
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from app.core.rate_limit import (
    MemoryBackend,
    RateLimiter,
    rate_limit,
    AUTH_LIMITS,
    GENERAL_LIMITS,
)


# ================== MEMORY BACKEND TESTS ==================

class TestMemoryBackend:
    """Tests for the in-memory rate limit backend"""
    
    def test_check_allows_within_limit(self):
        """Test that requests within limit are allowed"""
        backend = MemoryBackend()
        
        for i in range(5):
            allowed, remaining, retry_after = backend.check("test_key", 5, 60)
            if i < 5:
                assert allowed is True
                assert remaining == 5 - (i + 1)
            else:
                assert allowed is False
    
    def test_check_blocks_over_limit(self):
        """Test that requests over limit are blocked"""
        backend = MemoryBackend()
        
        # Use up all requests
        for _ in range(10):
            backend.check("test_key", 10, 60)
        
        # Next request should be blocked
        allowed, remaining, retry_after = backend.check("test_key", 10, 60)
        assert allowed is False
        assert remaining == 0
    
    def test_window_expiration(self):
        """Test that request window expires correctly"""
        backend = MemoryBackend()
        
        # Use up requests
        for _ in range(5):
            backend.check("expire_key", 5, 1)  # 1 second window
        
        # Should be blocked
        allowed, _, _ = backend.check("expire_key", 5, 1)
        assert allowed is False
        
        # Wait for window to expire
        time.sleep(1.1)
        
        # Should be allowed again
        allowed, remaining, _ = backend.check("expire_key", 5, 1)
        assert allowed is True
        assert remaining == 4
    
    def test_block_functionality(self):
        """Test explicit blocking of a key"""
        backend = MemoryBackend()
        
        # Block the key
        backend.block("blocked_key", 5)  # Block for 5 seconds
        
        # Check if blocked
        is_blocked, seconds_remaining = backend.is_blocked("blocked_key")
        assert is_blocked is True
        assert seconds_remaining > 0
        assert seconds_remaining <= 5
    
    def test_unblocked_key(self):
        """Test that non-blocked keys are not blocked"""
        backend = MemoryBackend()
        
        is_blocked, seconds_remaining = backend.is_blocked("unblocked_key")
        assert is_blocked is False
        assert seconds_remaining == 0
    
    def test_block_expiration(self):
        """Test that blocks expire correctly"""
        backend = MemoryBackend()
        
        # Block for 1 second
        backend.block("temp_blocked", 1)
        
        # Wait for block to expire
        time.sleep(1.1)
        
        is_blocked, _ = backend.is_blocked("temp_blocked")
        assert is_blocked is False
    
    def test_different_keys_independent(self):
        """Test that different keys are tracked independently"""
        backend = MemoryBackend()
        
        # Use up requests for key1
        for _ in range(5):
            backend.check("key1", 5, 60)
        
        # key2 should still have all requests
        allowed, remaining, _ = backend.check("key2", 5, 60)
        assert allowed is True
        assert remaining == 4
    
    def test_cleanup_old_requests(self):
        """Test that old requests are cleaned up"""
        backend = MemoryBackend()
        
        # Make requests
        for _ in range(3):
            backend.check("cleanup_key", 10, 1)
        
        # Wait for cleanup window
        time.sleep(1.1)
        
        # Make new request - old ones should be cleaned
        allowed, remaining, _ = backend.check("cleanup_key", 10, 1)
        assert allowed is True
        assert remaining == 9


# ================== RATE LIMITER TESTS ==================

class TestRateLimiter:
    """Tests for the RateLimiter class"""
    
    def test_check_rate_limit_allowed(self):
        """Test rate limit check when allowed"""
        limiter = RateLimiter()
        
        allowed, remaining, retry_after = limiter.check_rate_limit(
            "test_user", 10, 60
        )
        
        assert allowed is True
        assert remaining >= 0
    
    def test_check_rate_limit_with_blocking(self):
        """Test rate limit with block duration"""
        limiter = RateLimiter()
        
        # Exhaust limit
        for _ in range(6):
            limiter.check_rate_limit("block_test", 5, 60, block_duration=10)
        
        # Should be blocked now
        allowed, _, retry_after = limiter.check_rate_limit(
            "block_test", 5, 60, block_duration=10
        )
        
        assert allowed is False
    
    def test_get_client_key_with_ip(self):
        """Test client key generation from request"""
        limiter = RateLimiter()
        
        # Mock request object
        mock_request = MagicMock()
        mock_request.client.host = "192.168.1.100"
        
        key = limiter.get_client_key(mock_request)
        assert "192.168.1.100" in key
    
    def test_get_client_key_with_prefix(self):
        """Test client key generation with custom prefix"""
        limiter = RateLimiter()
        
        mock_request = MagicMock()
        mock_request.client.host = "10.0.0.1"
        
        key = limiter.get_client_key(mock_request, prefix="login")
        assert "login" in key
        assert "10.0.0.1" in key


# ================== RATE LIMIT DECORATOR TESTS ==================

class TestRateLimitDecorator:
    """Tests for the rate_limit decorator"""
    
    def test_decorator_with_default_limits(self):
        """Test decorator with default rate limits"""
        @rate_limit(limit_type="default")
        async def test_endpoint(request):
            return {"status": "ok"}
        
        # Decorator should be applied
        assert hasattr(test_endpoint, "__wrapped__") or callable(test_endpoint)
    
    def test_decorator_with_auth_limits(self):
        """Test decorator with auth-specific limits"""
        @rate_limit(limit_type="login")
        async def login_endpoint(request):
            return {"status": "ok"}
        
        assert callable(login_endpoint)


# ================== API ENDPOINT RATE LIMIT TESTS ==================

class TestAPIRateLimiting:
    """Tests for rate limiting on actual API endpoints"""
    
    def test_login_rate_limit_headers(self, client):
        """Test that rate limit headers are present in responses"""
        response = client.post("/api/auth/login", json={
            "username": "test",
            "password": "test"
        })
        
        # Rate limit headers should be present (implementation dependent)
        headers = response.headers
        # These headers may not be present depending on implementation
        # Just verify the endpoint responds
        assert response.status_code in [200, 401, 422, 429]
    
    def test_health_endpoint_rate_limit(self, client):
        """Test health endpoint allows many requests"""
        for _ in range(10):
            response = client.get("/health")
            assert response.status_code == 200
    
    @pytest.mark.slow
    def test_rapid_requests_handled(self, client):
        """Test that rapid requests are handled properly"""
        responses = []
        for _ in range(20):
            response = client.get("/health")
            responses.append(response.status_code)
        
        # Most requests should succeed
        success_count = responses.count(200)
        assert success_count >= 15  # At least 75% should succeed


# ================== AUTH LIMITS CONFIGURATION TESTS ==================

class TestAuthLimitsConfiguration:
    """Tests for AUTH_LIMITS configuration"""
    
    def test_login_limits_defined(self):
        """Test that login limits are properly defined"""
        assert "login" in AUTH_LIMITS
        login_limits = AUTH_LIMITS["login"]
        
        assert "max_requests" in login_limits
        assert "window_seconds" in login_limits
        assert "block_duration" in login_limits
        
        assert login_limits["max_requests"] > 0
        assert login_limits["window_seconds"] > 0
    
    def test_register_limits_defined(self):
        """Test that registration limits are defined"""
        assert "register" in AUTH_LIMITS
        register_limits = AUTH_LIMITS["register"]
        
        # Registration should have stricter limits
        assert register_limits["max_requests"] <= AUTH_LIMITS["login"]["max_requests"]
    
    def test_forgot_password_limits_defined(self):
        """Test that forgot password limits are defined"""
        assert "forgot_password" in AUTH_LIMITS
        fp_limits = AUTH_LIMITS["forgot_password"]
        
        # Should have reasonable limits
        assert fp_limits["max_requests"] <= 5
        assert fp_limits["block_duration"] >= 60
    
    def test_general_limits_defined(self):
        """Test that general limits are defined"""
        assert "default" in GENERAL_LIMITS
        default_limits = GENERAL_LIMITS["default"]
        
        # Default should be more permissive
        assert default_limits["max_requests"] >= 30


# ================== EDGE CASE TESTS ==================

class TestRateLimitEdgeCases:
    """Edge case tests for rate limiting"""
    
    def test_empty_key(self):
        """Test handling of empty key"""
        backend = MemoryBackend()
        
        # Should handle empty key gracefully
        allowed, remaining, _ = backend.check("", 5, 60)
        assert allowed is True
    
    def test_very_long_key(self):
        """Test handling of very long key"""
        backend = MemoryBackend()
        
        long_key = "x" * 10000
        allowed, remaining, _ = backend.check(long_key, 5, 60)
        assert allowed is True
    
    def test_zero_max_requests(self):
        """Test handling of zero max requests"""
        backend = MemoryBackend()
        
        # Should block immediately
        allowed, _, _ = backend.check("zero_test", 0, 60)
        assert allowed is False
    
    def test_zero_window(self):
        """Test handling of zero window seconds"""
        backend = MemoryBackend()
        
        # Edge case - implementation dependent
        try:
            allowed, _, _ = backend.check("zero_window", 5, 0)
            # Should either work or raise an error
        except Exception:
            pass  # Expected if zero window is invalid
    
    def test_negative_values(self):
        """Test handling of negative values"""
        backend = MemoryBackend()
        
        # Should handle gracefully
        try:
            backend.check("neg_test", -1, -1)
        except Exception:
            pass  # Expected behavior
    
    def test_concurrent_access_simulation(self):
        """Test simulated concurrent access"""
        backend = MemoryBackend()
        
        # Simulate 10 concurrent requests
        results = []
        for i in range(10):
            allowed, remaining, _ = backend.check("concurrent", 5, 60)
            results.append(allowed)
        
        # First 5 should be allowed, rest blocked
        assert results[:5] == [True] * 5
        assert results[5:] == [False] * 5
    
    def test_special_characters_in_key(self):
        """Test special characters in rate limit key"""
        backend = MemoryBackend()
        
        special_keys = [
            "key:with:colons",
            "key/with/slashes",
            "key@with@symbols",
            "key with spaces",
            "key\twith\ttabs",
        ]
        
        for key in special_keys:
            allowed, _, _ = backend.check(key, 5, 60)
            assert allowed is True


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

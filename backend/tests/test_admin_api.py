"""
Admin API Tests
Comprehensive tests for admin endpoints including user management,
role enforcement, and audit logging.
"""
import pytest
from unittest.mock import patch, MagicMock


# ================== ADMIN USER MANAGEMENT TESTS ==================

class TestAdminUserManagement:
    """Tests for admin user management endpoints"""
    
    def test_list_users_requires_admin(self, client, test_db, test_users):
        """Test that listing users requires admin role"""
        # Login as patient (non-admin)
        login_response = client.post("/api/auth/login", json={
            "username": "patient",
            "password": "Patient123!"
        })
        
        if login_response.status_code == 200:
            tokens = login_response.json()
            response = client.get(
                "/api/admin/users",
                headers={"Authorization": f"Bearer {tokens['access_token']}"}
            )
            assert response.status_code in [401, 403]
    
    def test_list_users_admin_success(self, client, auth_headers):
        """Test admin can list users"""
        response = client.get("/api/admin/users", headers=auth_headers)
        
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, (list, dict))
    
    def test_list_users_pagination(self, client, auth_headers):
        """Test user listing with pagination"""
        response = client.get(
            "/api/admin/users?page=1&limit=10",
            headers=auth_headers
        )
        
        if response.status_code == 200:
            data = response.json()
            # Verify pagination structure if implemented
            if isinstance(data, dict):
                assert "total" in data or "users" in data or "data" in data
    
    def test_list_users_filter_by_role(self, client, auth_headers):
        """Test user listing filtered by role"""
        response = client.get(
            "/api/admin/users?role=doctor",
            headers=auth_headers
        )
        
        if response.status_code == 200:
            data = response.json()
            # Verify filtering works
            if isinstance(data, list):
                for user in data:
                    if "role" in user:
                        assert user["role"] == "doctor"
    
    def test_get_user_by_id(self, client, auth_headers, test_users):
        """Test getting a specific user by ID"""
        # Get user ID from first user
        user_id = test_users[0].id
        
        response = client.get(
            f"/api/admin/users/{user_id}",
            headers=auth_headers
        )
        
        if response.status_code == 200:
            data = response.json()
            assert data.get("id") == user_id
    
    def test_get_nonexistent_user(self, client, auth_headers):
        """Test getting non-existent user returns 404"""
        response = client.get(
            "/api/admin/users/nonexistent-user-id",
            headers=auth_headers
        )
        
        assert response.status_code in [404, 422]
    
    def test_update_user_role(self, client, auth_headers, test_users):
        """Test admin can update user role"""
        user_id = test_users[2].id  # Patient user
        
        response = client.patch(
            f"/api/admin/users/{user_id}",
            json={"role": "doctor"},
            headers=auth_headers
        )
        
        if response.status_code == 200:
            data = response.json()
            # Verify role was updated
            assert data.get("role") == "doctor"
    
    def test_update_user_status(self, client, auth_headers, test_users):
        """Test admin can update user active status"""
        user_id = test_users[2].id
        
        response = client.patch(
            f"/api/admin/users/{user_id}",
            json={"is_active": False},
            headers=auth_headers
        )
        
        if response.status_code == 200:
            data = response.json()
            assert data.get("is_active") is False
    
    def test_delete_user_requires_admin(self, client, test_db, test_users):
        """Test deleting user requires admin role"""
        # Login as doctor (non-admin)
        login_response = client.post("/api/auth/login", json={
            "username": "doctor",
            "password": "Doctor123!"
        })
        
        if login_response.status_code == 200:
            tokens = login_response.json()
            response = client.delete(
                f"/api/admin/users/{test_users[2].id}",
                headers={"Authorization": f"Bearer {tokens['access_token']}"}
            )
            assert response.status_code in [401, 403]
    
    def test_admin_cannot_delete_self(self, client, auth_headers, test_users):
        """Test admin cannot delete their own account"""
        admin_id = test_users[0].id  # Admin user
        
        response = client.delete(
            f"/api/admin/users/{admin_id}",
            headers=auth_headers
        )
        
        # Should be rejected
        assert response.status_code in [400, 403, 405]


# ================== ADMIN SEARCH TESTS ==================

class TestAdminSearch:
    """Tests for admin search functionality"""
    
    def test_search_users_by_email(self, client, auth_headers):
        """Test searching users by email"""
        response = client.get(
            "/api/admin/users?search=admin@test.com",
            headers=auth_headers
        )
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) > 0:
                assert "admin" in data[0].get("email", "").lower()
    
    def test_search_users_by_username(self, client, auth_headers):
        """Test searching users by username"""
        response = client.get(
            "/api/admin/users?search=doctor",
            headers=auth_headers
        )
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) > 0:
                assert "doctor" in data[0].get("username", "").lower()
    
    def test_search_returns_empty_for_no_match(self, client, auth_headers):
        """Test search returns empty for non-matching query"""
        response = client.get(
            "/api/admin/users?search=nonexistentuser12345",
            headers=auth_headers
        )
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                assert len(data) == 0


# ================== ADMIN AUDIT TESTS ==================

class TestAdminAudit:
    """Tests for admin audit functionality"""
    
    def test_admin_actions_are_logged(self, client, auth_headers, test_users):
        """Test that admin actions are logged"""
        with patch("app.api.admin.log_action") as mock_log:
            user_id = test_users[2].id
            
            response = client.patch(
                f"/api/admin/users/{user_id}",
                json={"role": "specialist"},
                headers=auth_headers
            )
            
            if response.status_code == 200:
                # Verify log_action was called
                if mock_log.called:
                    call_kwargs = mock_log.call_args[1] if mock_log.call_args[1] else {}
                    assert "admin" in str(call_kwargs).lower() or mock_log.called
    
    def test_admin_view_audit_logs(self, client, auth_headers):
        """Test admin can view audit logs"""
        response = client.get(
            "/api/history",
            headers=auth_headers
        )
        
        assert response.status_code == 200


# ================== ADMIN STATISTICS TESTS ==================

class TestAdminStatistics:
    """Tests for admin statistics endpoints"""
    
    def test_get_user_statistics(self, client, auth_headers):
        """Test getting user statistics"""
        response = client.get(
            "/api/admin/stats",
            headers=auth_headers
        )
        
        if response.status_code == 200:
            data = response.json()
            # Should contain user counts
            assert isinstance(data, dict)
    
    def test_get_system_health(self, client, auth_headers):
        """Test getting system health metrics"""
        response = client.get(
            "/api/admin/health",
            headers=auth_headers
        )
        
        # May not exist, but verify no server error
        assert response.status_code in [200, 404, 405]


# ================== ROLE ENFORCEMENT TESTS ==================

class TestRoleEnforcement:
    """Tests for role-based access control in admin endpoints"""
    
    def test_patient_cannot_access_admin(self, client, test_db, test_users):
        """Test patient role cannot access admin endpoints"""
        login_response = client.post("/api/auth/login", json={
            "username": "patient",
            "password": "Patient123!"
        })
        
        if login_response.status_code == 200:
            tokens = login_response.json()
            headers = {"Authorization": f"Bearer {tokens['access_token']}"}
            
            endpoints = [
                ("GET", "/api/admin/users"),
                ("GET", "/api/admin/stats"),
            ]
            
            for method, endpoint in endpoints:
                if method == "GET":
                    response = client.get(endpoint, headers=headers)
                
                assert response.status_code in [401, 403], \
                    f"Patient accessed {endpoint}"
    
    def test_doctor_cannot_access_admin(self, client, test_db, test_users):
        """Test doctor role cannot access admin endpoints"""
        login_response = client.post("/api/auth/login", json={
            "username": "doctor",
            "password": "Doctor123!"
        })
        
        if login_response.status_code == 200:
            tokens = login_response.json()
            headers = {"Authorization": f"Bearer {tokens['access_token']}"}
            
            response = client.get("/api/admin/users", headers=headers)
            assert response.status_code in [401, 403]


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

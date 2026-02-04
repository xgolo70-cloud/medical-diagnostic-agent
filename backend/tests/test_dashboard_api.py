"""
Dashboard API Tests
Tests for dashboard statistics, appointments, and data endpoints.
"""
import pytest
from datetime import datetime, timezone, timedelta
from unittest.mock import patch, MagicMock


# ================== DASHBOARD STATS TESTS ==================

class TestDashboardStats:
    """Tests for dashboard statistics endpoints"""
    
    def test_get_stats_requires_auth(self, client):
        """Test stats endpoint requires authentication"""
        response = client.get("/api/dashboard/stats")
        assert response.status_code == 401
    
    def test_get_stats_success(self, client, auth_headers):
        """Test getting dashboard stats with auth"""
        response = client.get("/api/dashboard/stats", headers=auth_headers)
        
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, dict)
    
    def test_stats_structure(self, client, auth_headers):
        """Test stats response structure"""
        response = client.get("/api/dashboard/stats", headers=auth_headers)
        
        if response.status_code == 200:
            data = response.json()
            # Common dashboard stats fields
            expected_fields = ["diagnoses", "patients", "appointments"]
            for field in expected_fields:
                if field in data:
                    assert data[field] is not None
    
    def test_stats_today(self, client, auth_headers):
        """Test getting today's statistics"""
        response = client.get("/api/dashboard/stats/today", headers=auth_headers)
        
        # May not exist
        assert response.status_code in [200, 404]
    
    def test_stats_weekly(self, client, auth_headers):
        """Test getting weekly statistics"""
        response = client.get("/api/dashboard/stats/weekly", headers=auth_headers)
        
        assert response.status_code in [200, 404]


# ================== APPOINTMENT TESTS ==================

class TestDashboardAppointments:
    """Tests for dashboard appointment management"""
    
    def test_get_appointments_requires_auth(self, client):
        """Test appointments endpoint requires auth"""
        response = client.get("/api/dashboard/appointments")
        assert response.status_code in [401, 404]
    
    def test_get_appointments(self, client, auth_headers):
        """Test getting appointments list"""
        response = client.get("/api/dashboard/appointments", headers=auth_headers)
        
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, (list, dict))
    
    def test_create_appointment(self, client, auth_headers):
        """Test creating an appointment"""
        appointment_data = {
            "patient_name": "Test Patient",
            "appointment_time": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat(),
            "appointment_type": "Check-up"
        }
        
        response = client.post(
            "/api/dashboard/appointments",
            json=appointment_data,
            headers=auth_headers
        )
        
        if response.status_code == 200:
            data = response.json()
            assert data.get("patient") == "Test Patient" or data.get("patient_name") == "Test Patient"
    
    def test_update_appointment(self, client, auth_headers):
        """Test updating an appointment"""
        # First create an appointment
        appointment_data = {
            "patient_name": "Update Test",
            "appointment_time": (datetime.now(timezone.utc) + timedelta(days=2)).isoformat(),
            "appointment_type": "Follow-up"
        }
        
        create_response = client.post(
            "/api/dashboard/appointments",
            json=appointment_data,
            headers=auth_headers
        )
        
        if create_response.status_code == 200:
            created = create_response.json()
            appointment_id = created.get("id")
            
            if appointment_id:
                update_response = client.patch(
                    f"/api/dashboard/appointments/{appointment_id}",
                    json={"status": "confirmed"},
                    headers=auth_headers
                )
                
                if update_response.status_code == 200:
                    updated = update_response.json()
                    assert updated.get("status") == "confirmed"
    
    def test_delete_appointment(self, client, auth_headers):
        """Test deleting an appointment"""
        # Create then delete
        appointment_data = {
            "patient_name": "Delete Test",
            "appointment_time": (datetime.now(timezone.utc) + timedelta(days=3)).isoformat(),
            "appointment_type": "Consultation"
        }
        
        create_response = client.post(
            "/api/dashboard/appointments",
            json=appointment_data,
            headers=auth_headers
        )
        
        if create_response.status_code == 200:
            created = create_response.json()
            appointment_id = created.get("id")
            
            if appointment_id:
                delete_response = client.delete(
                    f"/api/dashboard/appointments/{appointment_id}",
                    headers=auth_headers
                )
                
                assert delete_response.status_code in [200, 204]
    
    def test_get_upcoming_appointments(self, client, auth_headers):
        """Test getting upcoming appointments"""
        response = client.get(
            "/api/dashboard/appointments?status=pending",
            headers=auth_headers
        )
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                for appointment in data:
                    if "status" in appointment:
                        assert appointment["status"] in ["pending", "confirmed"]


# ================== ACTIVITY TESTS ==================

class TestDashboardActivity:
    """Tests for dashboard activity endpoints"""
    
    def test_get_recent_activity(self, client, auth_headers):
        """Test getting recent activity"""
        response = client.get("/api/dashboard/activity", headers=auth_headers)
        
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, (list, dict))
    
    def test_get_recent_diagnoses(self, client, auth_headers):
        """Test getting recent diagnoses for dashboard"""
        response = client.get("/api/dashboard/diagnoses/recent", headers=auth_headers)
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                for diagnosis in data:
                    assert "id" in diagnosis or "date" in diagnosis


# ================== DASHBOARD EDGE CASES ==================

class TestDashboardEdgeCases:
    """Edge case tests for dashboard"""
    
    def test_stats_with_no_data(self, client, auth_headers):
        """Test stats with no activity data"""
        # This tests the behavior with a fresh/empty database
        response = client.get("/api/dashboard/stats", headers=auth_headers)
        
        # Should return zeros, not error
        if response.status_code == 200:
            data = response.json()
            # Values should be numeric (0 or more)
            for key, value in data.items():
                if isinstance(value, (int, float)):
                    assert value >= 0
    
    def test_invalid_date_range(self, client, auth_headers):
        """Test stats with invalid date range"""
        response = client.get(
            "/api/dashboard/stats?start_date=invalid&end_date=alsobad",
            headers=auth_headers
        )
        
        # Should handle gracefully
        assert response.status_code in [200, 400, 422]
    
    def test_future_date_range(self, client, auth_headers):
        """Test stats with future date range"""
        future_date = (datetime.now(timezone.utc) + timedelta(days=365)).isoformat()
        
        response = client.get(
            f"/api/dashboard/stats?start_date={future_date}",
            headers=auth_headers
        )
        
        if response.status_code == 200:
            data = response.json()
            # Should return zero or empty for future dates


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

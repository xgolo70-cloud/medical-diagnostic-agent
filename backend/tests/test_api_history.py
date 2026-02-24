"""
Tests for /api/history endpoint.
Now requires authentication since audit logs are protected.
"""
import pytest
from unittest.mock import patch


def test_get_history_endpoint(client, auth_headers):
    """Test the GET /api/history endpoint (authenticated)"""
    mock_logs = [
        {
            "timestamp": "2023-01-01T12:00:00Z",
            "action": "test_action",
            "user_id": "test_user",
            "details": {"foo": "bar"}
        },
        {
            "timestamp": "2023-01-01T11:00:00Z",
            "action": "another_action",
            "user_id": "another_user",
            "details": {}
        }
    ]

    with patch("app.api.history.get_audit_logs", return_value=mock_logs) as mock_get_logs:
        response = client.get("/api/history?page=1&limit=10", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert data[0]["action"] == "test_action"
        
        # Verify mock was called with correct args
        mock_get_logs.assert_called_once_with(limit=10, offset=0)

def test_get_history_pagination(client, auth_headers):
    """Test pagination parameters for /api/history"""
    with patch("app.api.history.get_audit_logs", return_value=[]) as mock_get_logs:
        # Page 2, Limit 5 -> Offset should be 5
        client.get("/api/history?page=2&limit=5", headers=auth_headers)
        mock_get_logs.assert_called_with(limit=5, offset=5)

def test_get_history_error_handling(client, auth_headers):
    """Test error handling for /api/history"""
    with patch("app.api.history.get_audit_logs", side_effect=Exception("Read error")):
        response = client.get("/api/history", headers=auth_headers)
        assert response.status_code == 500
        assert response.json()["detail"] == "Failed to retrieve audit logs"

def test_get_history_requires_auth(client):
    """Test that /api/history requires authentication"""
    response = client.get("/api/history")
    assert response.status_code in [401, 403]

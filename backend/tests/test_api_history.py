from fastapi.testclient import TestClient
from unittest.mock import patch
from app.main import app

client = TestClient(app)

def test_get_history_endpoint():
    """Test the GET /api/history endpoint"""
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
        response = client.get("/api/history?page=1&limit=10")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert data[0]["action"] == "test_action"
        
        # Verify mock was called with correct args
        mock_get_logs.assert_called_once_with(limit=10, offset=0)

def test_get_history_pagination():
    """Test pagination parameters for /api/history"""
    with patch("app.api.history.get_audit_logs", return_value=[]) as mock_get_logs:
        # Page 2, Limit 5 -> Offset should be 5
        client.get("/api/history?page=2&limit=5")
        mock_get_logs.assert_called_with(limit=5, offset=5)

def test_get_history_error_handling():
    """Test error handling for /api/history"""
    with patch("app.api.history.get_audit_logs", side_effect=Exception("Read error")):
        response = client.get("/api/history")
        assert response.status_code == 500
        assert response.json()["detail"] == "Failed to retrieve audit logs"

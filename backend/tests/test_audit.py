import json
import pytest
import os
from unittest.mock import patch, mock_open
from app.core.audit import log_action

def test_audit_logging():
    """Test that log_action writes correct JSON structure"""
    action = "patient_data_access"
    user_id = "user_123"
    details = {"record_id": "rec_456"}
    
    # Mock the file open to capture what's written
    written_data = []
    
    def mock_write(data):
        written_data.append(data)
    
    mock_file = mock_open()
    mock_file.return_value.write = mock_write
    
    with patch("builtins.open", mock_file):
        log_action(action, user_id, details)
    
    # Verify the file was opened
    mock_file.assert_called_once()
    
    # Verify the written data
    assert len(written_data) > 0
    log_content = written_data[0].strip()
    log_entry = json.loads(log_content)
    
    assert log_entry["action"] == action
    assert log_entry["user_id"] == user_id
    assert log_entry["details"] == details
    assert "timestamp" in log_entry


def test_audit_logging_sanitizes_user_id():
    """Test that user_id is sanitized to prevent injection"""
    malicious_user_id = "user\n{\"injected\": true}\rmore"
    
    written_data = []
    mock_file = mock_open()
    mock_file.return_value.write = lambda data: written_data.append(data)
    
    with patch("builtins.open", mock_file):
        log_action("test", malicious_user_id, {})
    
    log_content = written_data[0].strip()
    log_entry = json.loads(log_content)
    
    # User ID should have newlines removed
    assert "\n" not in log_entry["user_id"]
    assert "\r" not in log_entry["user_id"]


def test_audit_logging_handles_io_error(capsys):
    """Test that IOError is handled gracefully"""
    with patch("builtins.open", side_effect=IOError("Write failed")):
        # Should not raise, just print to stderr
        log_action("test", "user", {})
    
    captured = capsys.readouterr()
    assert "Audit log write failed" in captured.err

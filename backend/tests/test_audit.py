import json
import pytest
from app.core.audit import log_action

def test_audit_logging(tmp_path):
    log_file = tmp_path / "audit.log"
    
    # Configure logging to use the temp file
    # In a real scenario, this might be handled via environment variables or dependency injection
    # For this test, we'll assume log_action writes to a specific path or handler we can verify
    
    action = "patient_data_access"
    user_id = "user_123"
    details = {"record_id": "rec_456"}
    
    # We need a way to redirect the audit log to our test file
    # For this skeleton, we'll pass the file path directly or mock the handler
    # Let's assume log_action accepts a file path for testing purposes
    
    log_action(action, user_id, details, log_file_path=str(log_file))
    
    assert log_file.exists()
    content = log_file.read_text()
    log_entry = json.loads(content)
    
    assert log_entry["action"] == action
    assert log_entry["user_id"] == user_id
    assert log_entry["details"] == details
    assert "timestamp" in log_entry

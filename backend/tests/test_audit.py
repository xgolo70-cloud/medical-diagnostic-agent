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


def test_get_audit_logs_pagination():
    """Test reading audit logs with pagination and reverse order"""
    from app.core.audit import get_audit_logs, LOG_DIRECTORY, ALLOWED_LOG_FILENAME
    
    # Create a temporary log file
    test_log_path = os.path.join(LOG_DIRECTORY, ALLOWED_LOG_FILENAME)
    
    # Ensure directory exists
    os.makedirs(LOG_DIRECTORY, exist_ok=True)
    
    # Write 5 entries
    entries = []
    for i in range(5):
        entry = {
            "timestamp": f"2023-01-01T10:00:0{i}Z",
            "action": f"action_{i}",
            "user_id": "user",
            "details": {"val": i}
        }
        entries.append(entry)
    
    # Write to file (append mode)
    # We mock 'open' in other tests, but here we might want real file IO or mock it carefully.
    # Since 'get_audit_logs' also uses 'open', we can use 'mock_open' but 'read' mocks are tricky for generators.
    # It's often easier to use a real temporary file or 'pyfakefs'.
    # Given the environment, let's use 'unittest.mock.patch' for 'open' to simulate the file content for reading.
    
    log_content = "\n".join([json.dumps(e) for e in entries])
    
    # We need to mock 'os.path.exists' too because the function checks it.
    with patch("os.path.exists", return_value=True):
        # We need a sophisticated mock for 'open' that supports seek/read for the reverse reader.
        # 'mock_open' doesn't support 'seek' well.
        # A simpler approach for the UNIT TEST of the logic is to mock '_reverse_readline' directly.
        # Testing '_reverse_readline' itself requires a real file or a BytesIO-like mock.
        pass

    # Let's write a test that mocks `_reverse_readline` to verify `get_audit_logs` pagination logic.
    
    mock_lines = [json.dumps(e) for e in reversed(entries)] # Generator yields newest first
    
    with patch("app.core.audit._reverse_readline", side_effect=lambda *args: iter(mock_lines)):
        with patch("os.path.exists", return_value=True):
            # Test Page 1, Limit 2 (Should get action_4, action_3)
            page1 = get_audit_logs(limit=2, offset=0)
            assert len(page1) == 2
            assert page1[0]["action"] == "action_4"
            assert page1[1]["action"] == "action_3"
            
            # Test Page 2, Limit 2 (Should get action_2, action_1)
            page2 = get_audit_logs(limit=2, offset=2)
            assert len(page2) == 2
            assert page2[0]["action"] == "action_2"
            assert page2[1]["action"] == "action_1"
            
            # Test Page 3, Limit 2 (Should get action_0)
            page3 = get_audit_logs(limit=2, offset=4)
            assert len(page3) == 1
            assert page3[0]["action"] == "action_0"

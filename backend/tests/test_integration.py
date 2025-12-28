from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app.main import app
from app.api.diagnose import get_engine
import json
import os

client = TestClient(app)

def test_e2e_diagnosis_flow(tmp_path):
    # 1. Setup
    # Mock the Diagnosis Engine to return a deterministic response
    mock_engine = MagicMock()
    expected_diagnosis = {
        "differential_diagnosis": [
            {"condition": "Common Cold", "confidence": 0.8, "rationale": "Symptoms match."}
        ],
        "recommended_tests": [],
        "citations": []
    }
    mock_engine.generate_diagnosis.return_value = expected_diagnosis
    
    app.dependency_overrides[get_engine] = lambda: mock_engine
    
    # Use a temporary file for audit logs
    log_file = tmp_path / "integration_audit.log"
    
    # 2. Execute
    # Submit patient data to the diagnose endpoint
    # We also patch log_action's default file path or ensure the environment uses it
    # Since log_action takes a file path argument, but the endpoint uses the default,
    # we'll patch the default argument or the function call within the endpoint.
    # Actually, simpler: patch 'app.core.audit.open' or similar, OR 
    # since we want to verifying the *file writing*, let's patch the file path constant if possible.
    # But `log_action` has a default arg.
    
    # Instead of patching `log_action`, let's patch the open() call inside it or 
    # redirect the log file via an environment variable if the app supported it.
    # Given the current implementation of `log_action`, let's patch `app.api.diagnose.log_action`
    # to redirect to our temp file? No, that mocks the function.
    
    # Best approach for integration without changing code:
    # Patch `app.core.audit.open` is risky. 
    # Let's assume we can verify the mock of log_action first (like previous tests),
    # BUT for a true "integration" test, we want to see the side effect (file creation).
    
    # Let's temporarily modify how log_action is called or just verify the side effect 
    # by letting it write to the default "audit.log" and cleaning it up?
    # No, that's messy.
    
    # Let's try to patch the `log_file_path` default in `app.core.audit`.
    # Since it's a default arg, it's bound at definition time.
    
    # Workaround: Patch `app.core.audit.log_action` to forward to the real logic but with our path.
    from app.core.audit import log_action as real_log_action
    
    def side_effect_log_action(*args, **kwargs):
        kwargs['log_file_path'] = str(log_file)
        return real_log_action(*args, **kwargs)
        
    with patch("app.api.diagnose.log_action", side_effect=side_effect_log_action):
        payload = {
            "patient_id": "e2e_patient_1",
            "age": 25,
            "gender": "male",
            "symptoms": ["sneezing"],
            "medical_history": [],
            "vitals": None
        }
        
        response = client.post("/api/diagnose", json=payload)
        
        # 3. Verify Response
        assert response.status_code == 200
        assert response.json() == expected_diagnosis
        
        # 4. Verify Audit Log Side Effect
        assert log_file.exists()
        content = log_file.read_text()
        log_entry = json.loads(content)
        
        assert log_entry["action"] == "generate_diagnosis"
        assert log_entry["details"]["patient_id"] == "e2e_patient_1"
        assert "timestamp" in log_entry

    # Cleanup
    app.dependency_overrides = {}

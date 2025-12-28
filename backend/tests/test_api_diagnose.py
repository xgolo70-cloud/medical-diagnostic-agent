from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app.main import app
from app.api.diagnose import get_engine

client = TestClient(app)

def test_diagnose_endpoint():
    # Mock data
    payload = {
        "patient_id": "p123",
        "age": 45,
        "gender": "female",
        "symptoms": ["headache", "nausea"],
        "medical_history": ["migraine"],
        "vitals": {"temperature": 37.0}
    }
    
    expected_diagnosis = {
        "differential_diagnosis": [
            {"condition": "Migraine", "confidence": 0.95, "rationale": "History of migraines matches symptoms."}
        ],
        "recommended_tests": [],
        "citations": []
    }

    # Mock the engine
    mock_engine = MagicMock()
    mock_engine.generate_diagnosis.return_value = expected_diagnosis

    # Override the dependency
    app.dependency_overrides[get_engine] = lambda: mock_engine

    try:
        with patch("app.api.diagnose.log_action") as mock_log:
            response = client.post("/api/diagnose", json=payload)
            
            # Verify response
            assert response.status_code == 200
            data = response.json()
            assert data == expected_diagnosis
            
            # Verify engine call
            mock_engine.generate_diagnosis.assert_called_once()
            
            # Verify audit logging
            mock_log.assert_called_once()
            args, kwargs = mock_log.call_args
            assert kwargs["action"] == "generate_diagnosis"
            assert kwargs["user_id"] == "system"
            assert kwargs["details"]["patient_id"] == "p123"
    finally:
        # Clean up override
        app.dependency_overrides = {}

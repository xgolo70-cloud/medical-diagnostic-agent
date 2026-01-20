from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock, mock_open
from app.main import app
from app.api.diagnose import get_engine
import json
import os

client = TestClient(app)

def test_e2e_diagnosis_flow():
    """End-to-end test for the diagnosis flow"""
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
    
    # Capture audit log calls
    audit_calls = []
    
    def capture_log_action(*args, **kwargs):
        audit_calls.append({"args": args, "kwargs": kwargs})
    
    try:
        with patch("app.api.diagnose.log_action", side_effect=capture_log_action):
            payload = {
                "patient_id": "e2e_patient_1",
                "age": 25,
                "gender": "male",
                "symptoms": ["sneezing"],
                "medical_history": [],
                "vitals": None
            }
            
            response = client.post("/api/diagnose", json=payload)
            
            # Verify Response
            assert response.status_code == 200
            assert response.json() == expected_diagnosis
            
            # Verify Audit Log was called
            assert len(audit_calls) == 1
            call_kwargs = audit_calls[0]["kwargs"]
            assert call_kwargs["action"] == "generate_diagnosis"
            assert call_kwargs["details"]["patient_id"] == "e2e_patient_1"
    finally:
        # Cleanup
        app.dependency_overrides = {}


def test_e2e_unified_diagnosis_flow():
    """End-to-end test for the unified diagnosis flow with file upload"""
    mock_engine = MagicMock()
    expected_diagnosis = {
        "differential_diagnosis": [
            {"condition": "Anemia", "confidence": 0.85, "rationale": "Lab results indicate."}
        ],
        "recommended_tests": ["Iron Panel"],
        "citations": []
    }
    mock_engine.generate_diagnosis.return_value = expected_diagnosis
    
    app.dependency_overrides[get_engine] = lambda: mock_engine
    
    try:
        with patch("app.api.diagnose.log_action") as mock_log, \
             patch("app.api.diagnose.extract_text_from_pdf") as mock_pdf:
            
            mock_pdf.return_value = "Hemoglobin: 10 g/dL"
            
            patient_json = json.dumps({
                "patient_id": "e2e_patient_2",
                "age": 35,
                "gender": "female",
                "symptoms": ["fatigue", "weakness"],
                "medical_history": [],
                "vitals": None
            })
            
            files = {'file': ('labs.pdf', b'%PDF-1.4...', 'application/pdf')}
            data = {'patient_data': patient_json}
            
            response = client.post("/api/diagnose/unified", files=files, data=data)
            
            assert response.status_code == 200
            assert response.json() == expected_diagnosis
            
            # Verify audit logging was called
            mock_log.assert_called_once()
            call_kwargs = mock_log.call_args[1]
            assert call_kwargs["action"] == "generate_diagnosis_unified"
            
    finally:
        app.dependency_overrides = {}


def test_health_endpoint():
    """Test the health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

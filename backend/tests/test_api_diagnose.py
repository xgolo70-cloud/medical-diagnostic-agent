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
            assert kwargs["user_id"] == "anonymous"
            assert kwargs["details"]["patient_id"] == "p123"
    finally:
        # Clean up override
        app.dependency_overrides = {}

def test_diagnose_unified_endpoint():
    # Mock data
    patient_json = '{"patient_id": "p123", "age": 45, "gender": "male", "symptoms": ["fatigue"], "medical_history": [], "vitals": null}'
    
    expected_diagnosis = {
        "differential_diagnosis": [
            {"condition": "Anemia", "confidence": 0.85, "rationale": "Lab results show low iron."}
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
        with patch("app.api.diagnose.log_action") as mock_log, \
             patch("app.api.diagnose.extract_text_from_pdf") as mock_pdf:
            
            mock_pdf.return_value = "Hemoglobin: 10 g/dL"
            
            # Prepare multipart upload
            files = {'file': ('labs.pdf', b'%PDF-1.4...', 'application/pdf')}
            data = {'patient_data': patient_json}
            
            response = client.post("/api/diagnose/unified", files=files, data=data)
            
            # Verify response
            assert response.status_code == 200
            data = response.json()
            assert data == expected_diagnosis
            
            # Verify engine call with lab results
            mock_engine.generate_diagnosis.assert_called_once()
            call_args = mock_engine.generate_diagnosis.call_args
            assert call_args[1]['lab_results'] == "Hemoglobin: 10 g/dL"
            
            # Verify audit logging
            mock_log.assert_called_once()
            args, kwargs = mock_log.call_args
            assert kwargs["action"] == "generate_diagnosis_unified"
            assert kwargs["details"]["filename"] == "labs.pdf"

    finally:
        app.dependency_overrides = {}

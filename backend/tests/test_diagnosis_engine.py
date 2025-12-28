import pytest
from unittest.mock import MagicMock, patch
from app.core.engine.diagnosis import DiagnosisEngine
from app.schemas.patient import PatientData

def test_diagnosis_generation_structure(mock_gemini):
    # Setup mock response
    mock_model = mock_gemini.return_value
    mock_response = MagicMock()
    
    expected_json = '''
    {
        "differential_diagnosis": [
            {"condition": "Flu", "confidence": 0.9, "rationale": "Matches symptoms"}
        ],
        "recommended_tests": ["CBC"],
        "citations": ["Source A"]
    }
    '''
    mock_response.text = expected_json
    mock_model.generate_content.return_value = mock_response

    engine = DiagnosisEngine()
    patient_data = PatientData(
        patient_id="123",
        age=30,
        gender="male",
        symptoms=["fever"],
        medical_history=[],
        vitals=None
    )

    result = engine.generate_diagnosis(patient_data)

    assert "differential_diagnosis" in result
    assert result["differential_diagnosis"][0]["condition"] == "Flu"
    assert result["differential_diagnosis"][0]["confidence"] == 0.9

def test_diagnosis_json_error(mock_gemini):
    mock_model = mock_gemini.return_value
    mock_response = MagicMock()
    mock_response.text = "Invalid JSON"
    mock_model.generate_content.return_value = mock_response

    engine = DiagnosisEngine()
    patient_data = PatientData(
        patient_id="123",
        age=30,
        gender="male",
        symptoms=["fever"],
        medical_history=[],
        vitals=None
    )

    result = engine.generate_diagnosis(patient_data)
    assert "error" in result
    assert result["error"] == "Failed to parse AI response"

def test_rationale_traceability(mock_gemini):
    # Setup mock response with a rationale that references input
    mock_model = mock_gemini.return_value
    mock_response = MagicMock()
    
    # We expect the prompt refinement to encourage this structure
    expected_json = '''
    {
        "differential_diagnosis": [
            {
                "condition": "Flu", 
                "confidence": 0.9, 
                "rationale": "Patient presents with fever and cough, consistent with influenza."
            }
        ],
        "recommended_tests": [],
        "citations": []
    }
    '''
    mock_response.text = expected_json
    mock_model.generate_content.return_value = mock_response

    engine = DiagnosisEngine()
    patient_data = PatientData(
        patient_id="123",
        age=30,
        gender="male",
        symptoms=["fever", "cough"],
        medical_history=[],
        vitals=None
    )

    result = engine.generate_diagnosis(patient_data)
    rationale = result["differential_diagnosis"][0]["rationale"]
    
    # Check if rationale contains keywords from input
    assert "fever" in rationale.lower() or "cough" in rationale.lower()

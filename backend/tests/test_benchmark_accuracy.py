import pytest
from unittest.mock import MagicMock
from app.core.engine.diagnosis import DiagnosisEngine
from app.schemas.patient import PatientData
from app.api.diagnose import get_engine

# Benchmark Cases: Input Data -> Expected Top Diagnosis
BENCHMARK_CASES = [
    {
        "name": "Influenza Case",
        "input": {
            "patient_id": "bench_1",
            "age": 30,
            "gender": "male",
            "symptoms": ["fever", "dry cough", "body aches", "fatigue"],
            "medical_history": [],
            "vitals": {"temperature": 39.0}
        },
        "expected_condition": "Influenza",
        "mock_response": {
            "differential_diagnosis": [
                {"condition": "Influenza", "confidence": 0.92, "rationale": "Classic presentation of flu."}
            ],
            "recommended_tests": [],
            "citations": []
        }
    },
    {
        "name": "Migraine Case",
        "input": {
            "patient_id": "bench_2",
            "age": 25,
            "gender": "female",
            "symptoms": ["throbbing headache", "nausea", "sensitivity to light"],
            "medical_history": ["family history of migraines"],
            "vitals": {"temperature": 36.8}
        },
        "expected_condition": "Migraine",
        "mock_response": {
            "differential_diagnosis": [
                {"condition": "Migraine", "confidence": 0.88, "rationale": "Unilateral throbbing pain with nausea."}
            ],
            "recommended_tests": [],
            "citations": []
        }
    }
]

def test_benchmark_accuracy(mock_gemini):
    # This test verifies that the engine correctly processes inputs and maps 
    # the LLM's response (even if mocked) to the expected structure for known cases.
    
    mock_model = mock_gemini.return_value
    engine = DiagnosisEngine()

    for case in BENCHMARK_CASES:
        # Setup specific mock response for this case
        mock_response = MagicMock()
        import json
        mock_response.text = json.dumps(case["mock_response"])
        mock_model.generate_content.return_value = mock_response
        
        patient_data = PatientData(**case["input"])
        
        # Execute
        result = engine.generate_diagnosis(patient_data)
        
        # Verify
        top_diagnosis = result["differential_diagnosis"][0]
        assert top_diagnosis["condition"] == case["expected_condition"], f"Failed case: {case['name']}"
        assert top_diagnosis["confidence"] > 0.8, f"Low confidence for case: {case['name']}"

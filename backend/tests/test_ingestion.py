from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_manual_ingestion_valid_data():
    payload = {
        "patient_id": "p123",
        "age": 45,
        "gender": "male",
        "symptoms": ["fever", "cough"],
        "medical_history": ["hypertension"],
        "vitals": {
            "temperature": 38.5,
            "blood_pressure": "120/80"
        }
    }
    response = client.post("/api/ingest/manual", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "success"
    assert data["data"]["patient_id"] == "p123"

def test_manual_ingestion_validation_error():
    # Missing required field 'age'
    payload = {
        "patient_id": "p123",
        "gender": "male",
        "symptoms": ["headache"]
    }
    response = client.post("/api/ingest/manual", json=payload)
    assert response.status_code == 422

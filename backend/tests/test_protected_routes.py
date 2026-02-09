from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_diagnose_protected():
    # Attempt to call diagnose without token
    response = client.post("/api/diagnose", json={
        "patient_id": "P123",
        "age": 30,
        "gender": "male",
        "symptoms": ["cough"]
    })
    assert response.status_code == 401

def test_ingest_protected():
    # Attempt to call ingest without token
    response = client.post("/api/ingest/manual", json={
        "patient_id": "P123",
        "age": 30,
        "gender": "male",
        "symptoms": ["cough"]
    })
    assert response.status_code == 401

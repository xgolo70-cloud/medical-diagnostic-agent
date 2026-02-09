from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_validation_error_structure():
    # Send bad data to register endpoint
    response = client.post("/api/auth/register", json={})
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data
    assert isinstance(data["detail"], list)
    assert len(data["detail"]) > 0
    first_error = data["detail"][0]
    assert "loc" in first_error
    assert "msg" in first_error
    assert "type" in first_error

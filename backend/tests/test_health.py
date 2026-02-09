from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check_structure():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "degraded", "unhealthy"]
    assert "components" in data
    assert "database" in data["components"]
    assert "ai_engine" in data["components"]

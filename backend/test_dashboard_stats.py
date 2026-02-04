from fastapi.testclient import TestClient
from app.main import app
from app.database.connection import get_db, Base, engine
from app.database.models import Diagnosis, Appointment
from sqlalchemy.orm import sessionmaker
import datetime
import json
import pytest

# Setup test DB
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

from app.core.auth import get_current_user, User

@pytest.fixture(scope="module")
def client():
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Override authentication
    app.dependency_overrides[get_current_user] = lambda: User(username="testuser", role="gp")
    
    with TestClient(app) as c:
        yield c
        
    app.dependency_overrides.clear()

def test_dashboard_stats(client):
    response = client.get("/api/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    assert "stats" in data
    assert "diagnosisBreakdown" in data
    assert "totalAnalyses" in data["stats"]

def test_recent_patients(client):
    # Ensure at least one diagnosis exists?
    # We can rely on existing data or create one.
    response = client.get("/api/dashboard/recent-patients")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_appointments(client):
    response = client.get("/api/dashboard/appointments")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

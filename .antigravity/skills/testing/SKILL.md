---
name: testing
description: Creates and runs tests for the medical diagnostic application. Use when writing unit tests, integration tests, or E2E tests for both backend (pytest) and frontend (Playwright) components.
---

# Testing Skill

This skill guides comprehensive testing for the medical diagnostic application, ensuring reliability and compliance.

## Testing Stack

| Layer | Backend | Frontend |
|-------|---------|----------|
| Unit | pytest | Vitest |
| Integration | pytest + TestClient | React Testing Library |
| E2E | - | Playwright |

## Backend Testing (Python/pytest)

### Directory Structure
```
backend/
├── tests/
│   ├── conftest.py          # Fixtures and configuration
│   ├── test_main.py         # Main app tests
│   ├── test_api_diagnose.py # Diagnosis endpoint tests
│   ├── test_security.py     # Security tests
│   └── test_integration.py  # Integration tests
```

### Test File Template
```python
# backend/tests/test_feature.py

import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch, AsyncMock

from app.main import app
from app.models.diagnosis import DiagnosisRequest, DiagnosisResponse


# Fixtures
@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)


@pytest.fixture
def mock_ai_service():
    """Mock the AI diagnostic service."""
    with patch('app.services.diagnosis.AIService') as mock:
        mock.return_value.diagnose = AsyncMock(return_value={
            "diagnosis": "Example Diagnosis",
            "confidence": 0.95,
            "icd10_code": "A00.0"
        })
        yield mock


@pytest.fixture
def sample_patient_data():
    """Sample patient data for testing (no real PHI)."""
    return {
        "patient_id": "test-patient-001",
        "symptoms": ["fever", "cough", "fatigue"],
        "medical_history": ["hypertension"],
        "lab_results": [
            {"test": "WBC", "value": 11.5, "unit": "K/uL"}
        ]
    }


# Unit Tests
class TestDiagnosisService:
    """Tests for the diagnosis service."""
    
    def test_validate_symptoms_valid(self):
        """Test symptom validation with valid input."""
        from app.services.diagnosis import validate_symptoms
        
        symptoms = ["fever", "headache"]
        result = validate_symptoms(symptoms)
        
        assert result is True
    
    def test_validate_symptoms_empty(self):
        """Test symptom validation with empty list."""
        from app.services.diagnosis import validate_symptoms
        
        with pytest.raises(ValueError, match="At least one symptom required"):
            validate_symptoms([])


# Integration Tests
class TestDiagnosisEndpoint:
    """Integration tests for diagnosis API."""
    
    def test_create_diagnosis_success(
        self, 
        client, 
        mock_ai_service, 
        sample_patient_data,
        auth_headers
    ):
        """Test successful diagnosis creation."""
        response = client.post(
            "/api/v1/diagnose/",
            json=sample_patient_data,
            headers=auth_headers
        )
        
        assert response.status_code == 201
        data = response.json()
        assert "diagnosis" in data
        assert "confidence" in data
        assert 0.0 <= data["confidence"] <= 1.0
    
    def test_create_diagnosis_unauthorized(self, client, sample_patient_data):
        """Test diagnosis creation without auth fails."""
        response = client.post(
            "/api/v1/diagnose/",
            json=sample_patient_data
        )
        
        assert response.status_code == 401
    
    def test_create_diagnosis_invalid_input(self, client, auth_headers):
        """Test diagnosis with invalid input."""
        response = client.post(
            "/api/v1/diagnose/",
            json={"invalid": "data"},
            headers=auth_headers
        )
        
        assert response.status_code == 422


# Security Tests
class TestSecurityCompliance:
    """Security and HIPAA compliance tests."""
    
    def test_no_phi_in_error_response(self, client, auth_headers):
        """Ensure PHI is not exposed in error messages."""
        response = client.get(
            "/api/v1/patient/nonexistent-id",
            headers=auth_headers
        )
        
        # Error should NOT contain patient details
        error_text = response.text.lower()
        assert "name" not in error_text
        assert "ssn" not in error_text
        assert "dob" not in error_text
    
    def test_audit_log_created(self, client, auth_headers, sample_patient_data):
        """Verify audit log entry is created for data access."""
        with patch('app.utils.audit.audit_log') as mock_audit:
            client.post(
                "/api/v1/diagnose/",
                json=sample_patient_data,
                headers=auth_headers
            )
            
            mock_audit.assert_called_once()
```

### Running Backend Tests
```bash
# Run all tests
cd backend && pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_diagnosis.py

# Run with verbose output
pytest -v

# Run only security tests
pytest -k "security"
```

## Frontend Testing (React/Playwright)

### Unit Tests (Vitest + React Testing Library)
```typescript
// frontend/src/test/ComponentName.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ComponentName } from '../components/ComponentName';

describe('ComponentName', () => {
  it('renders correctly with required props', () => {
    render(<ComponentName title="Test Title" />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
  
  it('calls onAction when button is clicked', async () => {
    const mockOnAction = vi.fn();
    render(<ComponentName title="Test" onAction={mockOnAction} />);
    
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    expect(mockOnAction).toHaveBeenCalledTimes(1);
  });
  
  it('displays loading state while fetching', async () => {
    render(<ComponentName isLoading={true} />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByLabelText(/loading/i)).toBeInTheDocument();
  });
  
  it('handles error state gracefully', () => {
    render(<ComponentName error="Something went wrong" />);
    
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
  });
});
```

### E2E Tests (Playwright)
```typescript
// frontend/e2e/diagnosis.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Diagnosis Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });
  
  test('creates a new diagnosis successfully', async ({ page }) => {
    await page.goto('/diagnose/new');
    
    // Fill in patient symptoms
    await page.fill('[name="symptoms"]', 'fever, cough');
    await page.click('button:has-text("Add Symptom")');
    
    // Submit diagnosis request
    await page.click('button:has-text("Generate Diagnosis")');
    
    // Wait for results
    await expect(page.locator('.diagnosis-result')).toBeVisible({
      timeout: 10000
    });
    
    // Verify confidence score is displayed
    await expect(page.locator('.confidence-score')).toContainText('%');
  });
  
  test('displays error for empty symptoms', async ({ page }) => {
    await page.goto('/diagnose/new');
    
    await page.click('button:has-text("Generate Diagnosis")');
    
    await expect(page.locator('.error-message')).toContainText(
      'At least one symptom is required'
    );
  });
});
```

## Test Data Guidelines (HIPAA)

**NEVER use real patient data in tests!**

```python
# ✅ GOOD - Synthetic test data
sample_data = {
    "patient_id": "TEST-001",
    "name": "Test Patient",
    "symptoms": ["headache", "fever"]
}

# 🔴 BAD - Real or realistic PHI
sample_data = {
    "patient_id": "123-45-6789",  # Looks like SSN
    "name": "John Smith",
    "dob": "1990-01-15"
}
```

## Running Tests

```bash
# Backend
cd backend && pytest --cov=app

# Frontend Unit
cd frontend && npm run test

# Frontend E2E
cd frontend && npx playwright test

# All tests (CI)
./scripts/run-all-tests.sh
```

## Test Coverage Requirements

| Component | Minimum Coverage |
|-----------|-----------------|
| Core diagnosis logic | 90% |
| API endpoints | 85% |
| Security functions | 95% |
| UI components | 70% |
| E2E critical paths | 100% |

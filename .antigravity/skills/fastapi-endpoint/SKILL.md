---
name: fastapi-endpoint
description: Creates new FastAPI endpoints following project conventions. Use when adding new API routes, implementing new features, or modifying the backend diagnostic services.
---

# FastAPI Endpoint Development Skill

This skill guides the creation of new API endpoints for the medical diagnostic backend.

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py           # FastAPI application entry
│   ├── routers/          # API route handlers
│   ├── services/         # Business logic
│   ├── models/           # Pydantic models
│   └── utils/            # Helper functions
├── tests/                # Test files
└── requirements.txt
```

## Endpoint Template

### Router File
```python
# backend/app/routers/feature_name.py

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel, Field

from app.services.auth import get_current_user
from app.models.user import User
from app.services.feature_service import FeatureService

router = APIRouter(
    prefix="/api/v1/feature",
    tags=["Feature Name"],
    responses={
        401: {"description": "Unauthorized"},
        403: {"description": "Forbidden"},
        500: {"description": "Internal Server Error"},
    },
)

# Request/Response Models
class FeatureRequest(BaseModel):
    """Request model for feature operation."""
    field_name: str = Field(..., description="Description of the field")
    optional_field: Optional[int] = Field(None, ge=0, le=100)

    class Config:
        json_schema_extra = {
            "example": {
                "field_name": "example_value",
                "optional_field": 50
            }
        }


class FeatureResponse(BaseModel):
    """Response model for feature operation."""
    id: str
    result: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    created_at: str


# Endpoints
@router.post(
    "/",
    response_model=FeatureResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new feature",
    description="Detailed description of what this endpoint does."
)
async def create_feature(
    request: FeatureRequest,
    current_user: User = Depends(get_current_user),
    service: FeatureService = Depends(),
) -> FeatureResponse:
    """
    Create a new feature with the following parameters:
    
    - **field_name**: Required field description
    - **optional_field**: Optional field description
    
    Returns the created feature with a unique ID.
    """
    try:
        result = await service.create(request, user_id=current_user.id)
        return FeatureResponse(**result)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        # Log the error, don't expose internals
        logger.error(f"Error creating feature: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )


@router.get("/{feature_id}", response_model=FeatureResponse)
async def get_feature(
    feature_id: str,
    current_user: User = Depends(get_current_user),
    service: FeatureService = Depends(),
) -> FeatureResponse:
    """Retrieve a specific feature by ID."""
    result = await service.get_by_id(feature_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Feature with id '{feature_id}' not found"
        )
    return FeatureResponse(**result)
```

## HIPAA Compliance Requirements

**Critical for this medical application:**

### 1. Audit Logging
```python
import logging
from app.utils.audit import audit_log

@router.post("/diagnose")
async def create_diagnosis(request: DiagnosisRequest, user: User = Depends(get_current_user)):
    # Log the access (NOT the PHI content)
    audit_log(
        action="DIAGNOSIS_CREATE",
        user_id=user.id,
        resource_type="diagnosis",
        resource_id=None,  # Set after creation
        ip_address=request.client.host
    )
    # ... process request
```

### 2. Input Validation
```python
from pydantic import validator

class PatientDataRequest(BaseModel):
    patient_id: str
    symptoms: List[str]
    
    @validator('patient_id')
    def validate_patient_id(cls, v):
        # Ensure proper format, prevent injection
        if not v.isalnum():
            raise ValueError('Invalid patient ID format')
        return v
```

### 3. Error Handling (No PHI Leakage)
```python
# GOOD - Generic error message
raise HTTPException(status_code=400, detail="Invalid request parameters")

# BAD - Exposes PHI
raise HTTPException(status_code=400, detail=f"Patient {patient.name} not found")
```

## Testing Pattern

```python
# backend/tests/test_feature.py

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


class TestFeatureEndpoints:
    """Test suite for feature endpoints."""
    
    @pytest.fixture
    def auth_headers(self, test_user):
        """Generate authentication headers."""
        return {"Authorization": f"Bearer {test_user.token}"}
    
    def test_create_feature_success(self, auth_headers):
        """Test successful feature creation."""
        response = client.post(
            "/api/v1/feature/",
            json={"field_name": "test_value"},
            headers=auth_headers
        )
        assert response.status_code == 201
        assert "id" in response.json()
    
    def test_create_feature_unauthorized(self):
        """Test feature creation without authentication."""
        response = client.post(
            "/api/v1/feature/",
            json={"field_name": "test_value"}
        )
        assert response.status_code == 401
    
    def test_create_feature_invalid_input(self, auth_headers):
        """Test feature creation with invalid input."""
        response = client.post(
            "/api/v1/feature/",
            json={"invalid_field": "value"},
            headers=auth_headers
        )
        assert response.status_code == 422
```

## Endpoint Creation Checklist

1. [ ] Create router file in `app/routers/`
2. [ ] Define Pydantic request/response models
3. [ ] Implement authentication dependency
4. [ ] Add HIPAA-compliant audit logging
5. [ ] Implement proper error handling (no PHI exposure)
6. [ ] Add input validation
7. [ ] Write comprehensive tests
8. [ ] Register router in `main.py`
9. [ ] Update API documentation/OpenAPI schema
10. [ ] Run security scan before deployment

## Register Router in main.py

```python
# backend/app/main.py
from app.routers import feature_name

app.include_router(feature_name.router)
```

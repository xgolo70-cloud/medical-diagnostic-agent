from typing import List, Optional
from pydantic import BaseModel, Field, field_validator
import re

class Vitals(BaseModel):
    temperature: Optional[float] = Field(None, ge=30.0, le=45.0, description="Body temperature in Celsius")
    blood_pressure: Optional[str] = Field(None, max_length=20, description="Blood pressure reading (e.g., 120/80)")
    heart_rate: Optional[int] = Field(None, ge=20, le=300, description="Heart rate in BPM")
    
    @field_validator('blood_pressure')
    @classmethod
    def validate_blood_pressure(cls, v):
        if v is not None:
            # Validate format like "120/80" or "120/80 mmHg"
            if not re.match(r'^\d{2,3}/\d{2,3}(\s*mmHg)?$', v.strip()):
                raise ValueError('Blood pressure must be in format "120/80" or "120/80 mmHg"')
        return v

class PatientData(BaseModel):
    patient_id: str = Field(..., min_length=1, max_length=50, pattern=r'^[a-zA-Z0-9_-]+$', 
                            description="Unique patient identifier (alphanumeric, underscores, hyphens)")
    age: int = Field(..., ge=0, le=150, description="Patient age in years")
    gender: str = Field(..., min_length=1, max_length=20, description="Patient gender")
    symptoms: List[str] = Field(..., min_length=1, max_length=50, description="List of symptoms")
    medical_history: List[str] = Field(default=[], max_length=100, description="List of medical history items")
    vitals: Optional[Vitals] = None
    
    @field_validator('gender')
    @classmethod
    def validate_gender(cls, v):
        allowed = ['male', 'female', 'other', 'm', 'f', 'ذكر', 'أنثى']
        if v.lower() not in allowed:
            raise ValueError(f'Gender must be one of: {", ".join(allowed)}')
        return v.lower()
    
    @field_validator('symptoms')
    @classmethod
    def validate_symptoms(cls, v):
        # Sanitize and limit each symptom
        return [s.strip()[:200] for s in v if s.strip()]
    
    @field_validator('medical_history')
    @classmethod
    def validate_medical_history(cls, v):
        # Sanitize and limit each history item
        return [h.strip()[:500] for h in v if h.strip()]


from typing import List, Optional, Dict
from pydantic import BaseModel

class Vitals(BaseModel):
    temperature: Optional[float] = None
    blood_pressure: Optional[str] = None
    heart_rate: Optional[int] = None

class PatientData(BaseModel):
    patient_id: str
    age: int
    gender: str
    symptoms: List[str]
    medical_history: List[str] = []
    vitals: Optional[Vitals] = None

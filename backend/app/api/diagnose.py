from fastapi import APIRouter, HTTPException, Depends
from app.schemas.patient import PatientData
from app.core.engine.diagnosis import DiagnosisEngine
from app.core.audit import log_action

router = APIRouter()

def get_engine():
    return DiagnosisEngine()

@router.post("")
async def diagnose_patient(patient: PatientData, engine: DiagnosisEngine = Depends(get_engine)):
    try:
        # Generate diagnosis
        diagnosis = engine.generate_diagnosis(patient)
        
        # Log the action
        log_action(
            action="generate_diagnosis",
            user_id="system", # In a real app, extract from auth token
            details={"patient_id": patient.patient_id}
        )
        
        return diagnosis
    except Exception as e:
        # In a real app, we'd log the error specifically
        raise HTTPException(status_code=500, detail=str(e))

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from app.schemas.patient import PatientData
from app.core.engine.diagnosis import DiagnosisEngine
from app.core.audit import log_action
from app.core.ingestion.pdf_parser import extract_text_from_pdf
import json

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

@router.post("/unified")
async def diagnose_unified(
    file: UploadFile = File(...), 
    patient_data: str = Form(...),
    engine: DiagnosisEngine = Depends(get_engine)
):
    try:
        # Parse patient data
        try:
            patient_dict = json.loads(patient_data)
            patient = PatientData(**patient_dict)
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Invalid patient data JSON: {str(e)}")

        # Extract text from PDF
        if file.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="File must be a PDF")
        
        lab_results_text = extract_text_from_pdf(file.file)
        
        # Generate diagnosis with combined data
        diagnosis = engine.generate_diagnosis(patient, lab_results=lab_results_text)
        
        # Log the action
        log_action(
            action="generate_diagnosis_unified",
            user_id="system",
            details={
                "patient_id": patient.patient_id,
                "filename": file.filename
            }
        )
        
        return diagnosis

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

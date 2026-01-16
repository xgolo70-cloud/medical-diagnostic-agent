from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from app.schemas.patient import PatientData
from app.core.engine.diagnosis import DiagnosisEngine
from app.core.audit import log_action
from app.core.auth import get_current_user, get_optional_user, User
from app.core.ingestion.pdf_parser import extract_text_from_pdf
import json
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Maximum file size for PDF uploads (10MB)
MAX_FILE_SIZE = 10 * 1024 * 1024

def get_engine():
    return DiagnosisEngine()

@router.post("")
async def diagnose_patient(
    patient: PatientData, 
    engine: DiagnosisEngine = Depends(get_engine),
    current_user: User = Depends(get_optional_user)  # Optional auth for backward compatibility
):
    try:
        # Generate diagnosis
        diagnosis = engine.generate_diagnosis(patient)
        
        # Log the action with actual user if authenticated
        user_id = current_user.username if current_user else "anonymous"
        log_action(
            action="generate_diagnosis",
            user_id=user_id,
            details={"patient_id": patient.patient_id}
        )
        
        return diagnosis
    except ValueError as e:
        # Business logic errors
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Log internal error details, but don't expose to client
        logger.error(f"Diagnosis failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="An internal error occurred during diagnosis")

@router.post("/unified")
async def diagnose_unified(
    file: UploadFile = File(...), 
    patient_data: str = Form(...),
    engine: DiagnosisEngine = Depends(get_engine),
    current_user: User = Depends(get_optional_user)
):
    try:
        # Parse patient data
        try:
            patient_dict = json.loads(patient_data)
            patient = PatientData(**patient_dict)
        except json.JSONDecodeError:
            raise HTTPException(status_code=422, detail="Invalid JSON in patient_data")
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Invalid patient data: {str(e)}")

        # Validate file type
        if file.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="File must be a PDF")
        
        # Read and validate file size
        file_content = await file.read()
        if len(file_content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large. Maximum size is 10MB")
        
        # Reset file position for PDF parser
        file.file.seek(0)
        
        # Extract text from PDF
        lab_results_text = extract_text_from_pdf(file.file)
        
        # Generate diagnosis with combined data
        diagnosis = engine.generate_diagnosis(patient, lab_results=lab_results_text)
        
        # Log the action
        user_id = current_user.username if current_user else "anonymous"
        log_action(
            action="generate_diagnosis_unified",
            user_id=user_id,
            details={
                "patient_id": patient.patient_id,
                "filename": file.filename,
                "file_size": len(file_content)
            }
        )
        
        return diagnosis

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unified diagnosis failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="An internal error occurred during diagnosis")


from fastapi import APIRouter, status, Depends, UploadFile, File, HTTPException
from app.schemas.patient import PatientData
from app.core.auth import get_current_user, User
from app.core.ingestion.pdf_parser import extract_text_from_pdf

router = APIRouter()

@router.post("/manual", status_code=status.HTTP_201_CREATED)
async def ingest_manual_data(data: PatientData, current_user: User = Depends(get_current_user)):
    # In a real app, we would save this to the database
    # For now, we just return the received data to confirm ingestion
    return {
        "status": "success",
        "data": data.model_dump()
    }

@router.post("/pdf")
async def ingest_pdf(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    try:
        text = extract_text_from_pdf(file.file)
        return {"status": "success", "extracted_text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

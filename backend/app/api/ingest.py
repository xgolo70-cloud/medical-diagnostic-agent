from fastapi import APIRouter, status, Depends
from app.schemas.patient import PatientData
from app.core.auth import get_current_user, User

router = APIRouter()

@router.post("/manual", status_code=status.HTTP_201_CREATED)
async def ingest_manual_data(data: PatientData, current_user: User = Depends(get_current_user)):
    # In a real app, we would save this to the database
    # For now, we just return the received data to confirm ingestion
    return {
        "status": "success",
        "data": data.model_dump()
    }

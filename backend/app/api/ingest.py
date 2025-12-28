from fastapi import APIRouter, status
from app.schemas.patient import PatientData

router = APIRouter()

@router.post("/manual", status_code=status.HTTP_201_CREATED)
async def ingest_manual_data(data: PatientData):
    # In a real app, we would save this to the database
    # For now, we just return the received data to confirm ingestion
    return {
        "status": "success",
        "data": data.model_dump()
    }

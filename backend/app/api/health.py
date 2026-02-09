from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database.connection import get_db
import importlib.util

router = APIRouter(tags=["Health"])

@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """
    Detailed system health check.
    Checks:
    - Database connection
    - AI Engine availability (checking if torch/transformers are importable/loaded)
    """
    health_status = {
        "status": "healthy",
        "components": {
            "database": "unknown",
            "ai_engine": "unknown"
        }
    }
    
    # Check Database
    try:
        db.execute(text("SELECT 1"))
        health_status["components"]["database"] = "connected"
    except Exception as e:
        health_status["components"]["database"] = f"error: {str(e)}"
        health_status["status"] = "degraded"

    # Check AI Engine (Simulated check if model service is responsive)
    # In a real scenario, we might ping the model service or check if weights are loaded.
    # For now, we check if we can import the service configuration.
    try:
        # Check if torch is available (basic check)
        if importlib.util.find_spec("torch"):
            health_status["components"]["ai_engine"] = "available"
        else:
            health_status["components"]["ai_engine"] = "missing_dependencies"
            health_status["status"] = "degraded"
    except Exception as e:
        health_status["components"]["ai_engine"] = f"error: {str(e)}"
        health_status["status"] = "degraded"
        
    return health_status

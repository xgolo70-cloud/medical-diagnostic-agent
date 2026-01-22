from fastapi import APIRouter, Query, HTTPException
from typing import List, Dict, Any
from app.core.audit import get_audit_logs

router = APIRouter()

@router.get("", response_model=List[Dict[str, Any]])
async def get_history(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page")
):
    """
    Retrieve the audit history with pagination.
    
    Args:
        page: Page number (starts at 1)
        limit: Number of items per page (max 100)
    
    Returns:
        List of audit log entries, most recent first.
    """
    offset = (page - 1) * limit
    try:
        return get_audit_logs(limit=limit, offset=offset)
    except Exception as e:
        # In a real app, log the error internally
        raise HTTPException(status_code=500, detail="Failed to retrieve audit logs")
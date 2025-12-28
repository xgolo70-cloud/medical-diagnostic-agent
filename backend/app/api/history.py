from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import json
import os

router = APIRouter()

@router.get("", response_model=List[Dict[str, Any]])
async def get_history(limit: int = 100):
    """
    Retrieve the audit history from the audit log file.
    
    Args:
        limit: Maximum number of entries to return (default: 100)
    
    Returns:
        List of audit log entries, most recent first.
    """
    log_file_path = "audit.log"
    
    if not os.path.exists(log_file_path):
        return []
    
    try:
        entries = []
        with open(log_file_path, "r") as f:
            for line in f:
                line = line.strip()
                if line:
                    try:
                        entry = json.loads(line)
                        entries.append(entry)
                    except json.JSONDecodeError:
                        # Skip malformed lines
                        continue
        
        # Return most recent first, limited
        return entries[::-1][:limit]
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read audit log: {str(e)}")

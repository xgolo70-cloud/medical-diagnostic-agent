import json
import datetime
from typing import Dict, Any, Optional

def log_action(action: str, user_id: str, details: Dict[str, Any], log_file_path: Optional[str] = "audit.log"):
    """
    Logs an audit event to a file in a structured JSON format.
    
    Args:
        action: The name of the action being performed.
        user_id: The ID of the user performing the action.
        details: A dictionary containing additional details about the action.
        log_file_path: The path to the log file. Defaults to "audit.log".
    """
    entry = {
        "timestamp": datetime.datetime.now(datetime.UTC).isoformat(),
        "action": action,
        "user_id": user_id,
        "details": details
    }
    
    with open(log_file_path, "a") as f:
        f.write(json.dumps(entry) + "\n")

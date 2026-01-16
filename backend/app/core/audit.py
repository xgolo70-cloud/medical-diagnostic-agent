import json
import datetime
import os
from typing import Dict, Any, Optional

# Secure log directory - can be configured via environment variable
LOG_DIRECTORY = os.getenv("AUDIT_LOG_DIR", os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
ALLOWED_LOG_FILENAME = "audit.log"

def log_action(action: str, user_id: str, details: Dict[str, Any], log_file_path: Optional[str] = None):
    """
    Logs an audit event to a file in a structured JSON format.
    
    Args:
        action: The name of the action being performed.
        user_id: The ID of the user performing the action.
        details: A dictionary containing additional details about the action.
        log_file_path: IGNORED for security - always uses secure default path.
    
    Security Note: log_file_path parameter is ignored to prevent path traversal attacks.
    The log file is always written to the secure LOG_DIRECTORY.
    """
    # SECURITY: Always use the secure path, ignore user-provided path
    safe_path = os.path.join(LOG_DIRECTORY, ALLOWED_LOG_FILENAME)
    
    # Sanitize user_id to prevent injection
    safe_user_id = str(user_id).replace("\n", "").replace("\r", "")[:100]
    
    entry = {
        "timestamp": datetime.datetime.now(datetime.UTC).isoformat(),
        "action": action,
        "user_id": safe_user_id,
        "details": details
    }
    
    try:
        with open(safe_path, "a") as f:
            f.write(json.dumps(entry) + "\n")
    except IOError as e:
        # Log to stderr if file logging fails, but don't expose internal errors
        import sys
        print(f"Audit log write failed: {type(e).__name__}", file=sys.stderr)


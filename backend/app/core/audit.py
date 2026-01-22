import json
import datetime
import os
from typing import Dict, Any, Optional, Generator

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


def _reverse_readline(filename: str, buf_size: int = 8192) -> Generator[str, None, None]:
    """
    A generator that returns the lines of a file in reverse order.
    Efficiently reads blocks from the end of the file.
    """
    if not os.path.exists(filename):
        return

    with open(filename, 'rb') as fh:
        segment = None
        offset = 0
        fh.seek(0, os.SEEK_END)
        file_size = fh.tell()
        total_size = file_size

        if file_size == 0:
            return

        while total_size > 0:
            if total_size > buf_size:
                read_size = buf_size
                total_size -= read_size
            else:
                read_size = total_size
                total_size = 0
            
            fh.seek(total_size, 0)
            buffer = fh.read(read_size)
            
            # If we have a segment from previous iteration, prepend it
            if segment:
                buffer += segment
            
            lines = buffer.split(b'\n')
            
            # The first element is the partial line at the start of the block
            # We save it for the next iteration (which reads the preceding block)
            segment = lines[0]
            
            # The rest are complete lines, but in file order.
            # We want to yield them in reverse order.
            # lines[1:] contains the complete lines from this block.
            for line in reversed(lines[1:]):
                if line: # Skip empty lines (e.g. trailing newline)
                    yield line.decode('utf-8')
        
        # Yield the final segment (start of file) if it exists
        if segment:
            yield segment.decode('utf-8')


def get_audit_logs(limit: int = 20, offset: int = 0) -> List[Dict[str, Any]]:
    """
    Retrieves audit logs with pagination support, reading most recent first.
    
    Args:
        limit: Maximum number of entries to return.
        offset: Number of entries to skip.
    
    Returns:
        List of audit log entries.
    """
    safe_path = os.path.join(LOG_DIRECTORY, ALLOWED_LOG_FILENAME)
    
    if not os.path.exists(safe_path):
        return []

    entries = []
    skipped = 0
    count = 0
    
    try:
        # Use generator to read line-by-line in reverse
        for line in _reverse_readline(safe_path):
            if not line.strip():
                continue
                
            if skipped < offset:
                skipped += 1
                continue
            
            if count >= limit:
                break
                
            try:
                entry = json.loads(line)
                entries.append(entry)
                count += 1
            except json.JSONDecodeError:
                continue
                
        return entries
        
    except Exception as e:
        # In case of read error, return empty list or raise
        # For a log reader, returning what we have or empty is safer than crashing
        import sys
        print(f"Audit log read failed: {str(e)}", file=sys.stderr)
        return []


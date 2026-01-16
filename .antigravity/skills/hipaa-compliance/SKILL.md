---
name: hipaa-compliance
description: Ensures all code and features comply with HIPAA regulations. Use when handling patient data, implementing security features, reviewing healthcare-related code, or deploying to production.
---

# HIPAA Compliance Skill

This skill ensures all development work complies with HIPAA (Health Insurance Portability and Accountability Act) regulations for this medical diagnostic application.

## HIPAA Overview for Developers

### Protected Health Information (PHI)
PHI includes any individually identifiable health information:
- Patient names
- Dates (birth, admission, discharge, death)
- Contact information (address, phone, email)
- Social Security Numbers
- Medical record numbers
- Health plan beneficiary numbers
- Device identifiers and serial numbers
- Biometric identifiers
- Photographs
- Any other unique identifier

## The 18 HIPAA Identifiers

| # | Identifier | Example |
|---|------------|---------|
| 1 | Names | John Smith |
| 2 | Geographic data | Street address, city |
| 3 | Dates | DOB, admission date |
| 4 | Phone numbers | (555) 123-4567 |
| 5 | Fax numbers | (555) 123-4568 |
| 6 | Email addresses | patient@email.com |
| 7 | SSN | 123-45-6789 |
| 8 | Medical record numbers | MRN-123456 |
| 9 | Health plan numbers | HPN-789012 |
| 10 | Account numbers | ACC-345678 |
| 11 | Certificate/license numbers | License #456 |
| 12 | Vehicle identifiers | VIN, plate numbers |
| 13 | Device identifiers | Serial numbers |
| 14 | Web URLs | patient-portal.example.com/user/123 |
| 15 | IP addresses | 192.168.1.100 |
| 16 | Biometric identifiers | Fingerprints, voiceprints |
| 17 | Photos | Face images |
| 18 | Any unique identifier | Patient UUID in URL |

## Development Guidelines

### 1. Encryption

#### At Rest
```python
# Database encryption
from cryptography.fernet import Fernet

class PHIEncryption:
    def __init__(self, key: bytes):
        self.cipher = Fernet(key)
    
    def encrypt(self, data: str) -> bytes:
        return self.cipher.encrypt(data.encode())
    
    def decrypt(self, encrypted: bytes) -> str:
        return self.cipher.decrypt(encrypted).decode()

# PostgreSQL with encryption
# Use Cloud SQL with encryption at rest enabled
# Key stored in Google Cloud KMS
```

#### In Transit
```python
# FastAPI with HTTPS only
from fastapi import FastAPI
from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware

app = FastAPI()
app.add_middleware(HTTPSRedirectMiddleware)

# TLS 1.2+ required
# HSTS headers enabled
```

### 2. Access Controls

```python
from enum import Enum
from typing import Set

class Role(Enum):
    ADMIN = "admin"
    PHYSICIAN = "physician"
    NURSE = "nurse"
    PATIENT = "patient"

# Role-based access control
ROLE_PERMISSIONS = {
    Role.ADMIN: {"read", "write", "delete", "admin"},
    Role.PHYSICIAN: {"read", "write", "diagnose"},
    Role.NURSE: {"read", "write"},
    Role.PATIENT: {"read_own"},
}

def check_permission(user_role: Role, required: str) -> bool:
    return required in ROLE_PERMISSIONS.get(user_role, set())

# Endpoint protection
@router.get("/patient/{patient_id}")
async def get_patient(
    patient_id: str,
    current_user: User = Depends(get_current_user)
):
    # Verify user has permission to access this patient
    if not can_access_patient(current_user, patient_id):
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Audit log the access
    audit_log(
        action="PATIENT_VIEW",
        user_id=current_user.id,
        resource_id=patient_id
    )
    
    return await get_patient_data(patient_id)
```

### 3. Audit Logging (Required)

```python
# backend/app/utils/audit.py

import logging
from datetime import datetime, timezone
from typing import Optional

# Configure audit logger
audit_logger = logging.getLogger('hipaa_audit')
audit_logger.setLevel(logging.INFO)

# File handler with secure permissions
handler = logging.FileHandler('audit.log')
handler.setFormatter(logging.Formatter(
    '%(asctime)s | %(levelname)s | %(message)s'
))
audit_logger.addHandler(handler)


def audit_log(
    action: str,
    user_id: str,
    resource_type: str,
    resource_id: Optional[str] = None,
    ip_address: Optional[str] = None,
    outcome: str = "SUCCESS",
    details: Optional[str] = None
):
    """
    Log HIPAA-required audit event.
    
    Required fields:
    - Who: user_id
    - What: action, resource_type
    - When: timestamp (auto)
    - Where: ip_address
    - Outcome: success/failure
    """
    log_entry = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "user_id": user_id,
        "action": action,
        "resource_type": resource_type,
        "resource_id": resource_id,
        "ip_address": ip_address,
        "outcome": outcome,
        "details": details  # NO PHI in details!
    }
    
    audit_logger.info(str(log_entry))


# Audit log retention: 6 years (HIPAA requirement)
```

### 4. Minimum Necessary Principle

Only access/expose the minimum PHI needed:

```python
# ✅ GOOD - Return only necessary fields
class PatientSummary(BaseModel):
    """Summary view - no sensitive details."""
    id: str
    display_name: str  # "J. Smith" not full name
    age_range: str     # "40-50" not exact DOB
    primary_diagnosis: str

# 🔴 BAD - Exposing full PHI when not needed
class PatientFull(BaseModel):
    """Don't use this for list views!"""
    id: str
    full_name: str
    ssn: str
    dob: datetime
    address: str
    # ... all fields
```

### 5. Error Handling (No PHI Leakage)

```python
# ✅ GOOD - Generic error messages
try:
    patient = await get_patient(patient_id)
except PatientNotFound:
    raise HTTPException(
        status_code=404,
        detail="Requested resource not found"
    )
except Exception as e:
    logger.error(f"Error accessing patient {patient_id}: {type(e).__name__}")
    raise HTTPException(
        status_code=500,
        detail="An unexpected error occurred"
    )

# 🔴 BAD - PHI in error messages
raise HTTPException(
    status_code=404,
    detail=f"Patient John Smith (DOB: 1990-01-01) not found"
)
```

### 6. Session Management

```python
# Session security requirements
SESSION_CONFIG = {
    "timeout_minutes": 15,      # Auto-logout after inactivity
    "max_sessions": 1,          # Single session per user
    "secure_cookie": True,      # HTTPS only
    "httponly": True,           # No JavaScript access
    "samesite": "strict",       # CSRF protection
}

# Implement automatic session timeout
@app.middleware("http")
async def session_timeout(request: Request, call_next):
    if is_authenticated(request):
        last_activity = get_last_activity(request.user.id)
        if is_session_expired(last_activity):
            invalidate_session(request.user.id)
            return RedirectResponse("/login?expired=true")
        update_last_activity(request.user.id)
    
    return await call_next(request)
```

## Compliance Checklist

Before deploying any feature handling PHI:

### Data Protection
- [ ] PHI encrypted at rest (AES-256)
- [ ] PHI encrypted in transit (TLS 1.2+)
- [ ] Database has encryption enabled
- [ ] Backup encryption verified

### Access Control
- [ ] Authentication required for all PHI endpoints
- [ ] Role-based access control implemented
- [ ] Minimum necessary principle applied
- [ ] Session timeout configured (≤15 min)

### Audit Trail
- [ ] All PHI access logged
- [ ] Logs include who, what, when, where
- [ ] No PHI in log messages
- [ ] Log retention policy: 6 years

### Security
- [ ] No PHI in error messages
- [ ] No PHI in URLs
- [ ] No PHI in browser localStorage
- [ ] Input validation on all fields
- [ ] SQL injection prevention

### Testing
- [ ] No real PHI in test data
- [ ] Security tests passing
- [ ] Penetration testing completed

## Incident Response

If a potential breach is detected:

1. **Contain**: Isolate affected systems
2. **Assess**: Determine scope and data involved
3. **Notify**: Alert security team immediately
4. **Document**: Record all details for investigation
5. **Report**: HIPAA breaches must be reported within 60 days

```python
def report_security_incident(
    incident_type: str,
    description: str,
    affected_records: int
):
    """
    Report potential HIPAA security incident.
    Triggers immediate notification to security team.
    """
    # Log with maximum priority
    security_logger.critical({
        "type": "SECURITY_INCIDENT",
        "incident_type": incident_type,
        "description": description,
        "affected_records": affected_records,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    # Notify security team
    send_alert_to_security_team(...)
```

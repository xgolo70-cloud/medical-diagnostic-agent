import secrets
import string
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field

from app.database.connection import get_db
from app.database.models import User, UserRole, Medication, Diagnosis
from app.core.auth import get_current_user, hash_password

router = APIRouter(prefix="/api/patients", tags=["Patients"])

# --- Pydantic Schemas ---

class PatientSummary(BaseModel):
    id: str
    username: str
    email: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    created_at: str

class PatientCreate(BaseModel):
    """Schema for creating a new patient from the clinical UI."""
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=20)
    username: Optional[str] = Field(None, max_length=50)
    password: Optional[str] = Field(None, min_length=8, max_length=100)

class PatientCreateResponse(BaseModel):
    patient: PatientSummary
    generated_password: Optional[str] = None
    message: str
    
class MedicationCreate(BaseModel):
    name: str = Field(..., min_length=2)
    dosage: str = Field(..., min_length=1)
    frequency: str = Field(..., min_length=1)
    instructions: Optional[str] = None

class MedicationResponse(BaseModel):
    id: str
    name: str
    dosage: str
    frequency: str
    status: str
    instructions: Optional[str] = None
    prescribing_doctor: Optional[str] = None
    start_date: Optional[str] = None
    created_at: str

class PatientDetail(PatientSummary):
    medications: List[MedicationResponse]
    diagnoses: list


def _generate_password(length: int = 12) -> str:
    """Generate a secure random password meeting all requirements."""
    upper = secrets.choice(string.ascii_uppercase)
    lower = secrets.choice(string.ascii_lowercase)
    digit = secrets.choice(string.digits)
    rest = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(length - 3))
    pw = list(upper + lower + digit + rest)
    secrets.SystemRandom().shuffle(pw)
    return ''.join(pw)


# --- Endpoints ---

@router.get("", response_model=List[PatientSummary])
async def get_all_patients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve all users registered with the PATIENT role.
    Accessible by DOCTOR, SPECIALIST, ADMIN.
    """
    if current_user.role not in [UserRole.DOCTOR.value, UserRole.SPECIALIST.value, UserRole.ADMIN.value]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Access restricted to clinical staff."
        )
        
    patients = db.query(User).filter(User.role == UserRole.PATIENT).all()
    
    return sorted([
        PatientSummary(
            id=p.id,
            username=p.username,
            email=p.email,
            full_name=p.full_name,
            phone=p.phone,
            created_at=p.created_at.isoformat() if p.created_at else ""
        ) for p in patients
    ], key=lambda p: p.created_at, reverse=True)


@router.post("", response_model=PatientCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_patient(
    data: PatientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Register a new patient account from the clinical UI.
    Accessible by DOCTOR, SPECIALIST, ADMIN.
    Auto-generates username and password if not provided.
    """
    if current_user.role not in [UserRole.DOCTOR.value, UserRole.SPECIALIST.value, UserRole.ADMIN.value]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only clinical staff can register patients."
        )

    # Check duplicate email
    if db.query(User).filter(User.email == data.email.lower()).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A patient with this email already exists."
        )

    # Auto-generate username from email if not provided
    username = data.username
    if not username:
        base = data.email.split('@')[0].lower().replace('.', '_').replace('-', '_')
        username = base
        counter = 1
        while db.query(User).filter(User.username == username).first():
            username = f"{base}{counter}"
            counter += 1
    else:
        username = username.lower()
        if db.query(User).filter(User.username == username).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This username is already taken."
            )

    # Auto-generate password if not provided
    generated_password = None
    if data.password:
        password = data.password
    else:
        password = _generate_password()
        generated_password = password

    new_patient = User(
        email=data.email.lower(),
        username=username,
        password_hash=hash_password(password),
        role=UserRole.PATIENT,
        full_name=data.full_name,
        phone=data.phone,
        is_verified=True,
        is_active=True,
    )

    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)

    patient_summary = PatientSummary(
        id=new_patient.id,
        username=new_patient.username,
        email=new_patient.email,
        full_name=new_patient.full_name,
        phone=new_patient.phone,
        created_at=new_patient.created_at.isoformat() if new_patient.created_at else ""
    )

    return PatientCreateResponse(
        patient=patient_summary,
        generated_password=generated_password,
        message=f"Patient '{data.full_name}' registered successfully."
    )


@router.get("/{patient_id}", response_model=PatientDetail)
async def get_patient_profile(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get full profile for a single patient, including medications and EMR history.
    """
    if current_user.role not in [UserRole.DOCTOR.value, UserRole.SPECIALIST.value, UserRole.ADMIN.value]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access restricted.")

    patient = db.query(User).filter(User.id == patient_id, User.role == UserRole.PATIENT).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    meds = db.query(Medication).filter(Medication.patient_id == patient_id).all()
    diagnoses = db.query(Diagnosis).filter(
        or_(Diagnosis.user_id == patient_id, Diagnosis.patient_id == patient_id)
    ).order_by(Diagnosis.created_at.desc()).all()
    
    med_responses = [
        MedicationResponse(
            id=m.id, name=m.name, dosage=m.dosage, frequency=m.frequency, 
            status=m.status, instructions=m.instructions, prescribing_doctor=m.prescribing_doctor,
            start_date=m.start_date.isoformat() if m.start_date else None,
            created_at=m.created_at.isoformat()
        ) for m in meds
    ]
    diag_responses = [d.to_dict() for d in diagnoses]
    
    return PatientDetail(
        id=patient.id, username=patient.username, email=patient.email,
        full_name=patient.full_name, phone=patient.phone,
        created_at=patient.created_at.isoformat() if patient.created_at else "",
        medications=med_responses,
        diagnoses=diag_responses
    )


@router.post("/{patient_id}/medications", response_model=MedicationResponse)
async def add_medication(
    patient_id: str,
    med_data: MedicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Prescribe a new medication to a patient.
    """
    if current_user.role not in [UserRole.DOCTOR.value, UserRole.SPECIALIST.value]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only doctors can prescribe medications.")
        
    patient = db.query(User).filter(User.id == patient_id, User.role == UserRole.PATIENT).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    new_med = Medication(
        patient_id=patient.id,
        name=med_data.name,
        dosage=med_data.dosage,
        frequency=med_data.frequency,
        instructions=med_data.instructions,
        prescribing_doctor=current_user.full_name or current_user.username
    )
    db.add(new_med)
    db.commit()
    db.refresh(new_med)
    
    return MedicationResponse(
        id=new_med.id, name=new_med.name, dosage=new_med.dosage, frequency=new_med.frequency,
        status=new_med.status, instructions=new_med.instructions, prescribing_doctor=new_med.prescribing_doctor,
        start_date=new_med.start_date.isoformat() if new_med.start_date else None,
        created_at=new_med.created_at.isoformat()
    )

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
from app.database.connection import get_db
from app.database.models import Diagnosis, Appointment
from app.core.auth import get_current_user, User as AuthUser
import datetime

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Total Analyses
    total_analyses = db.query(Diagnosis).count()
    
    # Pending Review (Mock logic or based on status)
    pending_review = db.query(Diagnosis).filter(Diagnosis.status == 'pending_review').count()
    
    # Model Accuracy (Mock logic or average confidence)
    # Cast confidence to float for average calculation if stored as string
    # SQLite might need specific handling if stored as Text, but generally ok if numeric strings
    # For safety, let's fetch and calc in python if volume is low, or try SQL cast
    # Given the scale, python calc is fine
    all_confidences = db.query(Diagnosis.confidence).all()
    
    valid_confidences = []
    for (c,) in all_confidences:
        try:
            if c:
                valid_confidences.append(float(c))
        except ValueError:
            pass
            
    avg_conf = sum(valid_confidences) / len(valid_confidences) if valid_confidences else 0.0
    model_accuracy = round(avg_conf * 100, 1)
    
    # System Load (Mock)
    system_load = 24
    
    # Diagnosis Breakdown
    # Group by keywords in primary_diagnosis
    diagnoses = db.query(Diagnosis.primary_diagnosis).all()
    categories = {"Cardiology": 0, "Radiology": 0, "Pathology": 0, "Others": 0}
    
    for (dx,) in diagnoses:
        dx_lower = str(dx).lower()
        if any(x in dx_lower for x in ["heart", "cardio", "chest", "ecg", "myocardial", "atrial"]):
            categories["Cardiology"] += 1
        elif any(x in dx_lower for x in ["x-ray", "fracture", "lung", "ct", "mri", "bone", "pneumonia"]):
            categories["Radiology"] += 1
        elif any(x in dx_lower for x in ["blood", "patho", "cell", "anemia", "leukemia"]):
            categories["Pathology"] += 1
        else:
            categories["Others"] += 1
            
    total = sum(categories.values()) or 1
    breakdown = [
        {"type": k, "count": v, "percentage": round((v/total)*100), "color": _get_color(k)}
        for k, v in categories.items()
    ]
    
    return {
        "stats": {
            "totalAnalyses": total_analyses,
            "pendingReview": pending_review,
            "modelAccuracy": model_accuracy,
            "systemLoad": system_load
        },
        "diagnosisBreakdown": breakdown
    }

def _get_color(category):
    colors = {
        "Cardiology": "bg-rose-500",
        "Radiology": "bg-blue-500",
        "Pathology": "bg-amber-500",
        "Others": "bg-gray-400"
    }
    return colors.get(category, "bg-gray-400")

@router.get("/recent-patients")
async def get_recent_patients(
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get recent unique patients from Diagnoses
    recent = db.query(Diagnosis).order_by(Diagnosis.created_at.desc()).limit(20).all()
    
    patients = []
    seen = set()
    
    for dx in recent:
        if dx.patient_id in seen:
            continue
        seen.add(dx.patient_id)
        
        # Determine condition based on diagnosis confidence (mock heuristic)
        condition = "Stable"
        try:
            conf = float(dx.confidence or 0)
            if conf > 0.8: # High confidence usually means clear pathology -> Critical/Monitoring? 
                # Actually let's flip it or randomise slightly for demo variety if identical
                # For now: High confidence of illness = Critical
                condition = "Critical"
            elif conf > 0.6:
                 condition = "Monitoring"
            elif conf > 0.4:
                condition = "Improving"
        except:
            pass
            
        patients.append({
            "id": dx.id,
            "name": f"Patient #{dx.patient_id}", 
            "lastVisit": dx.created_at.isoformat(), 
            "condition": condition,
            "avatar": dx.patient_id[:2].upper() if dx.patient_id else "??",
            "patientId": dx.patient_id
        })
        if len(patients) >= 4:
            break
            
    return patients

@router.get("/appointments")
async def get_appointments(
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get appointments for today and future
    today = datetime.datetime.now(datetime.timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    
    appointments = db.query(Appointment).filter(
        Appointment.appointment_time >= today
    ).order_by(Appointment.appointment_time.asc()).limit(10).all()
    
    return [appt.to_dict() for appt in appointments]

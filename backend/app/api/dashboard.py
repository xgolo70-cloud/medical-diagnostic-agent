import logging
import time
import os
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from app.database.connection import get_db
from app.database.models import Diagnosis, Appointment
from app.core.auth import get_current_user, User as AuthUser
import datetime

logger = logging.getLogger(__name__)

router = APIRouter()

# ================== Startup Time ==================
_startup_time = time.time()


# ================== Request/Response Models ==================

class AppointmentStatusUpdate(BaseModel):
    status: str  # 'confirmed', 'pending', 'cancelled'


# ================== Dashboard Stats ==================

@router.get("/stats")
async def get_dashboard_stats(
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Main dashboard statistics with real data from the database."""
    # Total Analyses
    total_analyses = db.query(Diagnosis).count()
    
    # Pending Review
    pending_review = db.query(Diagnosis).filter(Diagnosis.status == 'pending_review').count()
    
    # Model Accuracy (average confidence across all diagnoses)
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
    
    # System Load — diagnoses in last hour as % of baseline capacity (100/hr)
    one_hour_ago = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=1)
    recent_count = db.query(Diagnosis).filter(Diagnosis.created_at >= one_hour_ago).count()
    capacity_baseline = int(os.getenv("SYSTEM_CAPACITY_PER_HOUR", "100"))
    system_load = min(round((recent_count / capacity_baseline) * 100), 100)
    
    # Total this month
    now = datetime.datetime.now(datetime.timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    total_this_month = db.query(Diagnosis).filter(Diagnosis.created_at >= month_start).count()
    
    # Diagnosis Breakdown by category
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
        {"type": k, "count": v, "percentage": round((v / total) * 100), "color": _get_color(k)}
        for k, v in categories.items()
    ]
    
    return {
        "stats": {
            "totalAnalyses": total_analyses,
            "pendingReview": pending_review,
            "modelAccuracy": model_accuracy,
            "systemLoad": system_load,
            "totalThisMonth": total_this_month,
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


# ================== Weekly Stats ==================

@router.get("/stats/weekly")
async def get_weekly_stats(
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns daily diagnosis counts for the past 7 days."""
    now = datetime.datetime.now(datetime.timezone.utc)
    days = []
    day_names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    
    for i in range(6, -1, -1):
        day_start = (now - datetime.timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + datetime.timedelta(days=1)
        
        count = db.query(Diagnosis).filter(
            Diagnosis.created_at >= day_start,
            Diagnosis.created_at < day_end
        ).count()
        
        days.append({
            "label": day_names[day_start.weekday()],
            "value": count,
            "date": day_start.strftime("%Y-%m-%d")
        })
    
    total = sum(d["value"] for d in days)
    # Calculate week-over-week change
    prev_week_start = (now - datetime.timedelta(days=13)).replace(hour=0, minute=0, second=0, microsecond=0)
    prev_week_end = (now - datetime.timedelta(days=6)).replace(hour=0, minute=0, second=0, microsecond=0)
    prev_total = db.query(Diagnosis).filter(
        Diagnosis.created_at >= prev_week_start,
        Diagnosis.created_at < prev_week_end
    ).count()
    
    change_pct = 0.0
    if prev_total > 0:
        change_pct = round(((total - prev_total) / prev_total) * 100, 1)
    
    return {
        "days": days,
        "total": total,
        "changePct": change_pct,
    }


# ================== System Health ==================

@router.get("/system-health")
async def get_system_health(
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns real system health metrics."""
    # Measure DB latency
    start = time.time()
    db.execute(func.count(Diagnosis.id)).scalar()
    db_latency_ms = round((time.time() - start) * 1000)
    
    # Uptime
    uptime_seconds = int(time.time() - _startup_time)
    hours, remainder = divmod(uptime_seconds, 3600)
    minutes, _ = divmod(remainder, 60)
    uptime_str = f"{hours}h {minutes}m"
    
    # Memory usage (process-level, no extra deps needed)
    try:
        import resource
        mem_mb = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / (1024 * 1024)  # macOS returns bytes
        # On Linux it returns KB, on macOS it returns bytes
        import sys
        if sys.platform == 'darwin':
            mem_mb = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / (1024 * 1024)
        else:
            mem_mb = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / 1024
    except Exception:
        mem_mb = 0
    
    # Memory as % (estimate based on 8GB system)
    total_mem_mb = int(os.getenv("TOTAL_SYSTEM_MEMORY_MB", "8192"))
    mem_pct = min(round((mem_mb / total_mem_mb) * 100), 100) if mem_mb > 0 else 0
    
    return {
        "apiLatency": db_latency_ms,
        "memoryUsage": mem_pct,
        "memoryMb": round(mem_mb),
        "uptime": uptime_str,
        "uptimeSeconds": uptime_seconds,
        "status": "healthy" if db_latency_ms < 500 else "degraded",
    }


# ================== Recent Patients ==================

@router.get("/recent-patients")
async def get_recent_patients(
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get recent unique patients from diagnoses."""
    recent = db.query(Diagnosis).order_by(Diagnosis.created_at.desc()).limit(20).all()
    
    patients = []
    seen = set()
    
    for dx in recent:
        if dx.patient_id in seen:
            continue
        seen.add(dx.patient_id)
        
        condition = "Stable"
        try:
            conf = float(dx.confidence or 0)
            if conf > 0.8:
                condition = "Critical"
            elif conf > 0.6:
                condition = "Monitoring"
            elif conf > 0.4:
                condition = "Improving"
        except (ValueError, TypeError):
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


# ================== Appointments ==================

@router.get("/appointments")
async def get_appointments(
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get upcoming appointments."""
    today = datetime.datetime.now(datetime.timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    
    appointments = db.query(Appointment).filter(
        Appointment.appointment_time >= today
    ).order_by(Appointment.appointment_time.asc()).limit(10).all()
    
    return [appt.to_dict() for appt in appointments]


@router.patch("/appointments/{appointment_id}/status")
async def update_appointment_status(
    appointment_id: str,
    update: AppointmentStatusUpdate,
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update appointment status (confirmed/pending/cancelled)."""
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    if update.status not in ('confirmed', 'pending', 'cancelled'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status. Must be: confirmed, pending, or cancelled"
        )
    
    appointment.status = update.status
    db.commit()
    
    return appt_to_response(appointment)


def appt_to_response(appt: Appointment):
    return appt.to_dict()

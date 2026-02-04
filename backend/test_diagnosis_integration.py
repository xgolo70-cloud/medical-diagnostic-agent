import sys
import os
from app.core.engine.diagnosis import DiagnosisEngine
from app.schemas.patient import PatientData

# Mock patient data
patient = PatientData(
    patient_id="TEST-001",
    age=30,
    gender="male",
    symptoms=["cough"],
    image_url="https://post.medicalnewstoday.com/wp-content/uploads/sites/3/2020/02/323533_2200-800x1200.jpg", # Sample X-ray URL
    image_type="xray"
)

# Initialize engine
print("Initializing engine...")
engine = DiagnosisEngine()

# Run diagnosis
print("Running diagnosis...")
try:
    result = engine.generate_diagnosis(patient)
    print("Diagnosis successful!")
    print(result)
except Exception as e:
    print(f"Diagnosis failed: {e}")
    sys.exit(1)

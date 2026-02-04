// Patient data types matching backend schema

export interface Vitals {
    temperature?: number | null;
    blood_pressure?: string | null;
    heart_rate?: number | null;
}

export interface PatientData {
    patient_id: string;
    age: number;
    gender: string;
    symptoms: string[];
    medical_history?: string[];
    vitals?: Vitals | null;
    image_url?: string | null;
    image_type?: string | null;
}

// Diagnosis response types
export interface Diagnosis {
    diagnosis_id: string;
    primary_diagnosis: string;
    confidence: number;
    rationale: string;
}

export interface DiagnosisResult {
    patient_id: string;
    differential_diagnosis: Diagnosis[];
    recommended_tests: string[];
    citations: string[];
    clinical_notes: string;
    timestamp: string;
}

// API response types
export interface IngestResponse {
    status: 'success' | 'error';
    data: PatientData;
}

export interface ApiError {
    detail: string;
    status_code?: number;
}

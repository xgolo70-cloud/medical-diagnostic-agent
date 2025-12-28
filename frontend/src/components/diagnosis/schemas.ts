import { z } from 'zod';

// Vitals validation schema
export const vitalsSchema = z.object({
    temperature: z.number().min(35).max(43).nullable().optional(),
    blood_pressure: z.string().regex(/^\d{2,3}\/\d{2,3}$/, 'Format: 120/80').nullable().optional(),
    heart_rate: z.number().min(30).max(250).nullable().optional(),
});

// Patient data validation schema
export const patientDataSchema = z.object({
    patient_id: z.string().min(1, 'Patient ID is required'),
    age: z.number().min(0, 'Age must be positive').max(150, 'Age must be realistic'),
    gender: z.enum(['male', 'female', 'other']),
    symptoms: z.array(z.string().min(1)).min(1, 'At least one symptom is required'),
    medical_history: z.array(z.string()),
    vitals: vitalsSchema.nullable().optional(),
});

export type PatientDataFormValues = z.infer<typeof patientDataSchema>;

// Common symptom suggestions
export const commonSymptoms = [
    'Fever',
    'Cough',
    'Headache',
    'Fatigue',
    'Nausea',
    'Chest pain',
    'Shortness of breath',
    'Abdominal pain',
    'Dizziness',
    'Joint pain',
    'Back pain',
    'Sore throat',
    'Runny nose',
    'Muscle aches',
];

// Common medical history items
export const commonMedicalHistory = [
    'Diabetes',
    'Hypertension',
    'Heart disease',
    'Asthma',
    'COPD',
    'Cancer',
    'Kidney disease',
    'Liver disease',
    'Stroke',
    'Thyroid disorders',
];

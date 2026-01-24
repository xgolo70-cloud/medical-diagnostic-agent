/**
 * Mock Data for Demo Mode
 * Provides realistic demo data when running without a backend
 */

import type { Notification, Appointment, RecentPatient, DiagnosisStats } from '../hooks/useDashboard';

// ================== Demo Notifications ==================

export const DEMO_NOTIFICATIONS: Notification[] = [
    { 
        id: '1', 
        title: 'Critical Lab Result', 
        message: 'Patient Ahmed Al-Rashid requires immediate cardiology consultation - elevated troponin levels detected', 
        time: '5m ago', 
        type: 'urgent', 
        read: false, 
        createdAt: Date.now() - 300000 
    },
    { 
        id: '2', 
        title: 'CT Scan Analysis Complete', 
        message: 'AI analysis detected possible nodule in chest CT for Patient #2847 - confidence 94.2%', 
        time: '23m ago', 
        type: 'warning', 
        read: false, 
        createdAt: Date.now() - 1380000 
    },
    { 
        id: '3', 
        title: 'Lab Results Ready', 
        message: 'Blood panel results available for Sarah Johnson - all values within normal range', 
        time: '1h ago', 
        type: 'info', 
        read: false, 
        createdAt: Date.now() - 3600000 
    },
    { 
        id: '4', 
        title: 'System Update', 
        message: 'MedGemma AI model updated to v2.1.0 - improved cardiac diagnosis accuracy by 3.2%', 
        time: '2h ago', 
        type: 'success', 
        read: true, 
        createdAt: Date.now() - 7200000 
    },
    { 
        id: '5', 
        title: 'ECG Analysis Complete', 
        message: 'Automated ECG interpretation complete for 12 patients - 2 flagged for review', 
        time: '3h ago', 
        type: 'info', 
        read: true, 
        createdAt: Date.now() - 10800000 
    },
];

// ================== Demo Appointments ==================

const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

export const DEMO_APPOINTMENTS: Appointment[] = [
    { id: '1', patient: 'Ahmed Al-Rashid', time: '09:00 AM', type: 'Cardiology Follow-up', status: 'confirmed', date: today },
    { id: '2', patient: 'Sarah Johnson', time: '09:45 AM', type: 'New Patient Intake', status: 'confirmed', date: today },
    { id: '3', patient: 'Mohammed Hassan', time: '10:30 AM', type: 'Lab Review', status: 'pending', date: today },
    { id: '4', patient: 'Fatima Al-Khalil', time: '11:15 AM', type: 'CT Scan Results', status: 'confirmed', date: today },
    { id: '5', patient: 'John Williams', time: '02:00 PM', type: 'Annual Checkup', status: 'confirmed', date: today },
    { id: '6', patient: 'Noor Ahmed', time: '03:30 PM', type: 'Diabetes Management', status: 'pending', date: today },
    { id: '7', patient: 'Lisa Chen', time: '04:15 PM', type: 'Post-Surgery Follow-up', status: 'confirmed', date: today },
    { id: '8', patient: 'Omar Khalid', time: '09:30 AM', type: 'MRI Review', status: 'confirmed', date: tomorrow },
    { id: '9', patient: 'Emma Watson', time: '11:00 AM', type: 'Thyroid Consultation', status: 'pending', date: tomorrow },
];

// ================== Demo Recent Patients ==================

export const DEMO_RECENT_PATIENTS: RecentPatient[] = [
    { 
        id: '1', 
        name: 'Ahmed Al-Rashid', 
        lastVisit: '2 hours ago', 
        condition: 'Monitoring', 
        avatar: 'AA',
        patientId: 'P-2024-0847'
    },
    { 
        id: '2', 
        name: 'Sarah Johnson', 
        lastVisit: 'Today, 9:45 AM', 
        condition: 'Stable', 
        avatar: 'SJ',
        patientId: 'P-2024-0923'
    },
    { 
        id: '3', 
        name: 'Mohammed Hassan', 
        lastVisit: 'Yesterday', 
        condition: 'Improving', 
        avatar: 'MH',
        patientId: 'P-2024-0756'
    },
    { 
        id: '4', 
        name: 'Fatima Al-Khalil', 
        lastVisit: '2 days ago', 
        condition: 'Stable', 
        avatar: 'FA',
        patientId: 'P-2024-0612'
    },
    { 
        id: '5', 
        name: 'John Williams', 
        lastVisit: '3 days ago', 
        condition: 'Critical', 
        avatar: 'JW',
        patientId: 'P-2024-0534'
    },
    { 
        id: '6', 
        name: 'Noor Ahmed', 
        lastVisit: '4 days ago', 
        condition: 'Monitoring', 
        avatar: 'NA',
        patientId: 'P-2024-0489'
    },
];

// ================== Demo Diagnosis Stats ==================

export const DEMO_DIAGNOSIS_STATS: DiagnosisStats[] = [
    { type: 'Cardiology', count: 127, percentage: 32, color: 'bg-rose-500' },
    { type: 'Radiology', count: 98, percentage: 25, color: 'bg-blue-500' },
    { type: 'Pathology', count: 84, percentage: 21, color: 'bg-amber-500' },
    { type: 'Neurology', count: 52, percentage: 13, color: 'bg-purple-500' },
    { type: 'Others', count: 35, percentage: 9, color: 'bg-gray-400' },
];

// ================== Demo Dashboard Stats ==================

export const DEMO_STATS = {
    totalAnalyses: 396,
    pendingReview: 12,
    modelAccuracy: 97.8,
    systemLoad: 34,
    weeklyGrowth: 12.5,
    monthlyPatients: 284,
    avgProcessingTime: '2.3s',
    successRate: 99.2,
};

// ================== Demo History Entries ==================

export const DEMO_HISTORY = [
    {
        id: '1',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        action: 'ECG Analysis',
        user_id: 'dr.smith',
        details: {
            patient_id: 'P-2024-0847',
            filename: 'ecg_scan_001.pdf',
            result: 'Sinus rhythm with premature atrial contractions',
            confidence: 96.4,
        }
    },
    {
        id: '2',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        action: 'Chest X-Ray Analysis',
        user_id: 'dr.smith',
        details: {
            patient_id: 'P-2024-0923',
            filename: 'chest_xray_002.dcm',
            result: 'No acute cardiopulmonary abnormality',
            confidence: 98.1,
        }
    },
    {
        id: '3',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        action: 'Blood Panel Review',
        user_id: 'dr.smith',
        details: {
            patient_id: 'P-2024-0756',
            filename: 'lab_results_003.pdf',
            result: 'Elevated HbA1c - 7.2%',
            confidence: 99.8,
        }
    },
    {
        id: '4',
        timestamp: new Date(Date.now() - 14400000).toISOString(),
        action: 'CT Scan Analysis',
        user_id: 'admin',
        details: {
            patient_id: 'P-2024-0612',
            filename: 'ct_abdomen_004.dcm',
            result: '3mm nodule detected in right lower lobe - recommend follow-up',
            confidence: 94.2,
        }
    },
    {
        id: '5',
        timestamp: new Date(Date.now() - 28800000).toISOString(),
        action: 'MRI Brain Analysis',
        user_id: 'dr.smith',
        details: {
            patient_id: 'P-2024-0534',
            filename: 'mri_brain_005.dcm',
            result: 'No evidence of acute infarction or hemorrhage',
            confidence: 97.6,
        }
    },
    {
        id: '6',
        timestamp: new Date(Date.now() - 43200000).toISOString(),
        action: 'Pathology Report',
        user_id: 'auditor',
        details: {
            patient_id: 'P-2024-0489',
            filename: 'biopsy_report_006.pdf',
            result: 'Benign tissue - no malignancy detected',
            confidence: 99.1,
        }
    },
    {
        id: '7',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        action: 'Ultrasound Analysis',
        user_id: 'dr.smith',
        details: {
            patient_id: 'P-2024-0423',
            filename: 'ultrasound_007.dcm',
            result: 'Normal hepatobiliary appearance',
            confidence: 95.8,
        }
    },
    {
        id: '8',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        action: 'Mammography Screening',
        user_id: 'dr.smith',
        details: {
            patient_id: 'P-2024-0398',
            filename: 'mammo_008.dcm',
            result: 'BI-RADS Category 1 - Negative',
            confidence: 98.7,
        }
    },
];

// ================== Demo Trends Data ==================

export const DEMO_WEEKLY_TRENDS = [
    { day: 'Mon', analyses: 52, accuracy: 97.2 },
    { day: 'Tue', analyses: 61, accuracy: 98.1 },
    { day: 'Wed', analyses: 48, accuracy: 97.8 },
    { day: 'Thu', analyses: 73, accuracy: 98.4 },
    { day: 'Fri', analyses: 67, accuracy: 97.5 },
    { day: 'Sat', analyses: 45, accuracy: 98.0 },
    { day: 'Sun', analyses: 50, accuracy: 97.9 },
];

// ================== Demo AI Insights ==================

export const DEMO_AI_INSIGHTS = [
    {
        id: '1',
        title: 'Cardiac Pattern Detected',
        description: 'Higher than usual atrial fibrillation indicators in morning ECG scans this week',
        severity: 'warning',
        recommendation: 'Consider scheduling cardiology consultations for flagged patients',
    },
    {
        id: '2',
        title: 'Processing Efficiency',
        description: 'Average analysis time improved by 15% compared to last month',
        severity: 'success',
        recommendation: 'Continue current workflow optimization',
    },
    {
        id: '3',
        title: 'Seasonal Pattern',
        description: 'Increase in respiratory-related imaging requests consistent with seasonal trends',
        severity: 'info',
        recommendation: 'Prepare for potential 20% increase in chest imaging',
    },
];

// ================== Check if Demo Mode ==================

export const isDemoMode = (): boolean => {
    return import.meta.env.VITE_DEMO_MODE === 'true' || !import.meta.env.VITE_API_URL;
};

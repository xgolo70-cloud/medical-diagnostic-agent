import axios, { AxiosError } from 'axios';
import type { PatientData, DiagnosisResult, IngestResponse, ApiError } from '../types';

// API base URL - in production, this would come from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance with defaults
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds for AI processing
});

// Error handler
const handleApiError = (error: unknown): never => {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiError>;
        const message = axiosError.response?.data?.detail || axiosError.message || 'An error occurred';
        throw new Error(message);
    }
    throw error;
};

/**
 * API Service for Clinical Dashboard
 */
export const api = {
    /**
     * Submit patient data for manual diagnosis
     * POST /diagnose
     */
    async diagnose(patientData: PatientData): Promise<DiagnosisResult> {
        try {
            const response = await apiClient.post<DiagnosisResult>('/diagnose', patientData);
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    /**
     * Submit patient data with PDF file for unified diagnosis
     * POST /diagnose/unified
     */
    async diagnoseUnified(patientData: PatientData, file: File): Promise<DiagnosisResult> {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('patient_data', JSON.stringify(patientData));

            const response = await apiClient.post<DiagnosisResult>('/diagnose/unified', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    /**
     * Ingest patient data manually
     * POST /ingest/manual
     */
    async ingestManual(patientData: PatientData): Promise<IngestResponse> {
        try {
            const response = await apiClient.post<IngestResponse>('/ingest/manual', patientData);
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    /**
     * Get diagnosis history (for Phase 4)
     * GET /history
     */
    async getHistory(): Promise<unknown[]> {
        try {
            const response = await apiClient.get('/history');
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },
};

export default api;

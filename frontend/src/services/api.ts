/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { PatientData, DiagnosisResult, IngestResponse } from '../types';

// ================== Configuration ==================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Token storage keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// ================== Token Management ==================

export const tokenManager = {
    getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
    getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
    
    setTokens: (accessToken: string, refreshToken: string) => {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    },
    
    clearTokens: () => {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    },
    
    hasTokens: () => !!localStorage.getItem(ACCESS_TOKEN_KEY),
};

// ================== Types ==================

interface TokenPair {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
}

interface LoginRequest {
    username: string;
    password: string;
}

interface RefreshRequest {
    refresh_token: string;
}

// ================== Axios Instance ==================

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 60000, // 60 seconds for AI processing
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value: string) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else if (token) {
            resolve(token);
        }
    });
    failedQueue = [];
};

// ================== Request Interceptor ==================

apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = tokenManager.getAccessToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ================== Response Interceptor (Token Refresh) ==================

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        
        // Only handle 401 errors and not on auth endpoints
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes('/auth/')
        ) {
            if (isRefreshing) {
                // Wait for the refresh to complete
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                    }
                    return apiClient(originalRequest);
                });
            }
            
            originalRequest._retry = true;
            isRefreshing = true;
            
            const refreshToken = tokenManager.getRefreshToken();
            
            if (!refreshToken) {
                tokenManager.clearTokens();
                window.location.href = '/login';
                return Promise.reject(error);
            }
            
            try {
                const response = await axios.post<TokenPair>(
                    `${API_BASE_URL}/auth/refresh`,
                    { refresh_token: refreshToken }
                );
                
                const { access_token, refresh_token } = response.data;
                tokenManager.setTokens(access_token, refresh_token);
                
                processQueue(null, access_token);
                
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${access_token}`;
                }
                
                return apiClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                tokenManager.clearTokens();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        
        return Promise.reject(error);
    }
);

// ================== Error Handler ==================

export class ValidationError extends Error {
    public errors: Array<{ field: string; message: string }>;

    constructor(errors: Array<{ field: string; message: string }>) {
        super('Validation Failed');
        this.name = 'ValidationError';
        this.errors = errors;
    }
}

const handleApiError = (error: unknown): never => {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        const data = axiosError.response?.data;
        
        // Handle Pydantic Validation Errors (Array of {loc, msg, type})
        if (data?.detail && Array.isArray(data.detail)) {
             const formattedErrors = data.detail.map((err: any) => ({
                 // Filter out 'body' to match form field names (e.g. 'age', 'vitals.heart_rate')
                 field: err.loc ? err.loc.filter((l: string) => l !== 'body').join('.') : 'unknown',
                 message: err.msg
             }));
             throw new ValidationError(formattedErrors);
        }
        
        const message = data?.detail || axiosError.message || 'An error occurred';
        throw new Error(message);
    }
    throw error;
};

// ================== Auth API ==================

export const authApi = {
    async login(username: string, password: string): Promise<TokenPair> {
        try {
            const response = await apiClient.post<TokenPair>('/auth/login', {
                username,
                password,
            } as LoginRequest);
            
            const { access_token, refresh_token } = response.data;
            tokenManager.setTokens(access_token, refresh_token);
            
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },
    
    async refresh(): Promise<TokenPair> {
        const refreshToken = tokenManager.getRefreshToken();
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }
        
        try {
            const response = await apiClient.post<TokenPair>('/auth/refresh', {
                refresh_token: refreshToken,
            } as RefreshRequest);
            
            const { access_token, refresh_token } = response.data;
            tokenManager.setTokens(access_token, refresh_token);
            
            return response.data;
        } catch (error) {
            tokenManager.clearTokens();
            return handleApiError(error);
        }
    },
    
    async logout(): Promise<void> {
        const refreshToken = tokenManager.getRefreshToken();
        try {
            await apiClient.post('/auth/logout', {
                refresh_token: refreshToken,
            });
        } finally {
            tokenManager.clearTokens();
        }
    },
    
    async getCurrentUser(): Promise<{ username: string; role: string; full_name?: string; avatar_url?: string; email?: string }> {
        try {
            const response = await apiClient.get('/auth/me');
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    async updateUserProfile(data: { full_name?: string; phone?: string; avatar_url?: string }): Promise<any> {
        try {
            const response = await apiClient.put('/auth/me', data);
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    async changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Promise<{ message: string }> {
        try {
            const response = await apiClient.post('/auth/me/password', {
                current_password: currentPassword,
                new_password: newPassword,
                confirm_password: confirmPassword,
            });
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    async logoutAll(): Promise<{ message: string }> {
        try {
            const response = await apiClient.post('/auth/logout-all');
            return response.data;
        } catch (error) {
            return handleApiError(error);
        } finally {
            tokenManager.clearTokens();
        }
    },
};

// ================== Admin API ==================

export const adminApi = {
    async getUsers(params: {
        page?: number;
        page_size?: number;
        role?: string;
        is_active?: boolean;
        search?: string;
    } = {}): Promise<{ users: any[]; total: number; page: number; page_size: number }> {
        try {
            const response = await apiClient.get('/admin/users', { params });
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    async getUserStats(): Promise<{ total_users: number; active_users: number; verified_users: number; by_role: Record<string, number> }> {
        try {
            const response = await apiClient.get('/admin/users/stats');
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    async getUser(userId: string): Promise<any> {
        try {
            const response = await apiClient.get(`/admin/users/${userId}`);
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    async updateUser(userId: string, data: { role?: string; is_active?: boolean; is_verified?: boolean; full_name?: string }): Promise<any> {
        try {
            const response = await apiClient.put(`/admin/users/${userId}`, data);
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    async activateUser(userId: string): Promise<{ message: string }> {
        try {
            const response = await apiClient.post(`/admin/users/${userId}/activate`);
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    async deactivateUser(userId: string): Promise<{ message: string }> {
        try {
            const response = await apiClient.post(`/admin/users/${userId}/deactivate`);
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    async deleteUser(userId: string): Promise<{ message: string }> {
        try {
            const response = await apiClient.delete(`/admin/users/${userId}`);
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },
};

// ================== Data API ==================

export const api = {
    /**
     * Check system health
     */
    async checkHealth(): Promise<{ status: string; components: Record<string, string> }> {
        try {
            const response = await apiClient.get('/health');
            return response.data;
        } catch {
            // If network fails, return offline status rather than throwing
            return { status: 'offline', components: {} };
        }
    },

    /**
     * Submit patient data for manual diagnosis
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
     * Stream diagnosis response using SSE
     */
    async streamDiagnosis(patientData: PatientData, onChunk: (text: string) => void, onComplete: () => void, onError: (err: any) => void) {
        try {
            const token = tokenManager.getAccessToken();
            const response = await fetch(`${API_BASE_URL}/diagnose/stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(patientData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            if (!response.body) {
                throw new Error("ReadableStream not yet supported in this browser.");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.substring(6);
                        if (data === '[DONE]') {
                            onComplete();
                            return;
                        }
                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.error) {
                                onError(new Error(parsed.error));
                                return;
                            }
                            if (parsed.chunk) {
                                onChunk(parsed.chunk);
                            }
                        } catch (e) {
                            // ignore partial JSON
                        }
                    }
                }
            }
            onComplete();
        } catch (error) {
            onError(error);
        }
    },

    /**
     * Ingest patient data manually
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
     * Get diagnosis history
     */
    async getHistory(): Promise<unknown[]> {
        try {
            const response = await apiClient.get('/history');
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    /**
     * Get dashboard statistics
     */
    async getDashboardStats(): Promise<any> {
        try {
            const response = await apiClient.get('/dashboard/stats');
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    /**
     * Get recent patients
     */
    async getRecentPatients(): Promise<any[]> {
        try {
            const response = await apiClient.get('/dashboard/recent-patients');
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    /**
     * Get today's appointments
     */
    async getAppointments(): Promise<any[]> {
        try {
            const response = await apiClient.get('/dashboard/appointments');
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    /**
     * Update appointment status
     */
    async updateAppointmentStatus(id: string, status: string): Promise<any> {
        try {
            const response = await apiClient.patch(`/dashboard/appointments/${id}/status`, { status });
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    /**
     * Get system health metrics (latency, memory, uptime)
     */
    async getSystemHealth(): Promise<{
        apiLatency: number;
        memoryUsage: number;
        memoryMb: number;
        uptime: string;
        uptimeSeconds: number;
        status: string;
    }> {
        try {
            const response = await apiClient.get('/dashboard/system-health');
            return response.data;
        } catch {
            return { apiLatency: 0, memoryUsage: 0, memoryMb: 0, uptime: '—', uptimeSeconds: 0, status: 'offline' };
        }
    },

    /**
     * Get weekly analysis stats for chart
     */
    async getWeeklyStats(): Promise<{
        days: Array<{ label: string; value: number; date: string }>;
        total: number;
        changePct: number;
    }> {
        try {
            const response = await apiClient.get('/dashboard/stats/weekly');
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    /**
     * Get diagnoses with optional filtering
     */
    async getDiagnoses(params?: { severity?: string; condition_category?: string; limit?: number }) {
        try {
            const query = new URLSearchParams();
            if (params?.severity) query.append('severity', params.severity);
            if (params?.condition_category) query.append('condition_category', params.condition_category);
            if (params?.limit) query.append('limit', params.limit.toString());

            const queryString = query.toString() ? `?${query.toString()}` : '';
            const response = await apiClient.get<any[]>(`/diagnose${queryString}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // ================== Patients API ==================

    /**
     * Get all registered patients
     */
    async getPatients(): Promise<any[]> {
        try {
            const response = await apiClient.get('/patients');
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    /**
     * Get a specific patient's full profile (medications + diagnoses)
     */
    async getPatientProfile(patientId: string): Promise<any> {
        try {
            const response = await apiClient.get(`/patients/${patientId}`);
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    /**
     * Prescribe a new medication for a patient
     */
    async addMedication(patientId: string, data: { name: string; dosage: string; frequency: string; instructions?: string }): Promise<any> {
        try {
            const response = await apiClient.post(`/patients/${patientId}/medications`, data);
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    /**
     * Create a new patient account (doctor/admin only)
     */
    async createPatient(data: { full_name: string; email: string; phone?: string }): Promise<any> {
        try {
            const response = await apiClient.post('/patients', data);
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    }
};

export default api;


import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { PatientData, DiagnosisResult, IngestResponse, ApiError } from '../types';

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

const handleApiError = (error: unknown): never => {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiError>;
        const message = axiosError.response?.data?.detail || axiosError.message || 'An error occurred';
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
    
    async getCurrentUser(): Promise<{ username: string; role: string }> {
        try {
            const response = await apiClient.get('/auth/me');
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },
};

// ================== Data API ==================

export const api = {
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
};

export default api;


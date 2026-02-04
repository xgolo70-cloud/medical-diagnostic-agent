/**
 * API Client for Backend Integration
 * 
 * Handles authenticated requests to the FastAPI backend using Supabase tokens.
 */
import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface UpdateProfileParams {
    full_name?: string;
    phone?: string;
    avatar_url?: string;
}

export const api = {
    /**
     * Get current authentication headers with Supabase JWT
     */
    getHeaders: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        
        return {
            'Content-Type': 'application/json',
            'Authorization': session?.access_token ? `Bearer ${session.access_token}` : '',
        };
    },

    /**
     * Update user profile via backend
     */
    updateUserProfile: async (data: UpdateProfileParams) => {
        const headers = await api.getHeaders();
        
        const response = await fetch(`${API_URL}/api/auth/me`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || 'Failed to update profile');
        }

        return response.json();
    }
};

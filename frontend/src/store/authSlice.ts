import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { tokenManager } from '../services/api';

interface User {
    username: string;
    role: 'gp' | 'specialist' | 'auditor' | 'admin';
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

// Session Persistence Constants & Helpers
const AUTH_STORAGE_KEY = 'auth_session';

const loadAuthFromStorage = (): { user: User | null; isAuthenticated: boolean } => {
    try {
        // Check if we have valid tokens
        if (!tokenManager.hasTokens()) {
            localStorage.removeItem(AUTH_STORAGE_KEY);
            return { user: null, isAuthenticated: false };
        }
        
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
            const user = JSON.parse(stored) as User;
            // Validate required fields exist
            if (user && user.username && user.role) {
                return { user, isAuthenticated: true };
            }
        }
    } catch {
        // Clear corrupted data
        localStorage.removeItem(AUTH_STORAGE_KEY);
        tokenManager.clearTokens();
    }
    return { user: null, isAuthenticated: false };
};

// Load saved session on initialization
const savedAuth = loadAuthFromStorage();

const initialState: AuthState = {
    user: savedAuth.user,
    isAuthenticated: savedAuth.isAuthenticated,
    isLoading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.isLoading = true;
            state.error = null;
        },
        loginSuccess: (state, action: PayloadAction<User>) => {
            state.isLoading = false;
            state.isAuthenticated = true;
            state.user = action.payload;
            state.error = null;
            // Persist session to localStorage
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(action.payload));
        },
        loginFailure: (state, action: PayloadAction<string>) => {
            state.isLoading = false;
            state.isAuthenticated = false;
            state.user = null;
            state.error = action.payload;
            // Clear any stale session data and tokens
            localStorage.removeItem(AUTH_STORAGE_KEY);
            tokenManager.clearTokens();
        },
        logout: (state) => {
            state.isLoading = false;
            state.isAuthenticated = false;
            state.user = null;
            state.error = null;
            // Clear session from localStorage and all tokens
            localStorage.removeItem(AUTH_STORAGE_KEY);
            tokenManager.clearTokens();
        },
    },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;


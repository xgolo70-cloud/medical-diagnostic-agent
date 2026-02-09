import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { tokenManager, authApi } from '../services/api';

interface User {
    username: string;
    role: 'patient' | 'doctor' | 'gp' | 'specialist' | 'auditor' | 'admin';
    email?: string;
    avatar?: string;
    displayName?: string;
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
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        const hasTokens = tokenManager.hasTokens();
        
        if (!hasTokens) {
            if (stored) localStorage.removeItem(AUTH_STORAGE_KEY);
            return { user: null, isAuthenticated: false };
        }
        
        if (stored) {
            const user = JSON.parse(stored) as User;
            if (user && user.username && user.role) {
                return { user, isAuthenticated: true };
            }
        }
        
        tokenManager.clearTokens();
    } catch (error) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        tokenManager.clearTokens();
    }
    return { user: null, isAuthenticated: false };
};

const savedAuth = loadAuthFromStorage();

const initialState: AuthState = {
    user: savedAuth.user,
    isAuthenticated: savedAuth.isAuthenticated,
    isLoading: false,
    error: null,
};

// Async Thunks
export const loginUser = createAsyncThunk(
    'auth/login',
    async ({ username, password }: { username: string; password: string }, { rejectWithValue }) => {
        try {
            // 1. Get Tokens
            await authApi.login(username, password);
            
            // 2. Get User Profile (to get role/details)
            // The login response provides tokens, but we need the user details (role, etc.)
            // We can decode the token or call /auth/me
            const userProfile = await authApi.getCurrentUser();
            
            return {
                username: userProfile.username,
                role: userProfile.role as User['role'],
                email: username.includes('@') ? username : undefined, // Heuristic
                displayName: userProfile.username
            };
        } catch (error) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue('Login failed');
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await authApi.logout();
        } catch (error) {
            console.error('Logout failed', error);
        }
        // Always clear local state
        return;
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Keep synchronous actions for manual updates if needed (e.g. demo mode)
        loginStart: (state) => {
            state.isLoading = true;
            state.error = null;
        },
        loginSuccess: (state, action: PayloadAction<User>) => {
            state.isLoading = false;
            state.isAuthenticated = true;
            state.user = action.payload;
            state.error = null;
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(action.payload));
        },
        loginFailure: (state, action: PayloadAction<string>) => {
            state.isLoading = false;
            state.isAuthenticated = false;
            state.user = null;
            state.error = action.payload;
            localStorage.removeItem(AUTH_STORAGE_KEY);
            tokenManager.clearTokens();
        },
        logout: (state) => {
            state.isLoading = false;
            state.isAuthenticated = false;
            state.user = null;
            state.error = null;
            localStorage.removeItem(AUTH_STORAGE_KEY);
            tokenManager.clearTokens();
        },
    },
    extraReducers: (builder) => {
        // Login
        builder.addCase(loginUser.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(loginUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isAuthenticated = true;
            state.user = action.payload;
            state.error = null;
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(action.payload));
        });
        builder.addCase(loginUser.rejected, (state, action) => {
            state.isLoading = false;
            state.isAuthenticated = false;
            state.user = null;
            state.error = action.payload as string;
            localStorage.removeItem(AUTH_STORAGE_KEY);
            tokenManager.clearTokens();
        });

        // Logout
        builder.addCase(logoutUser.fulfilled, (state) => {
            state.isLoading = false;
            state.isAuthenticated = false;
            state.user = null;
            state.error = null;
            localStorage.removeItem(AUTH_STORAGE_KEY);
            tokenManager.clearTokens();
        });
    }
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;
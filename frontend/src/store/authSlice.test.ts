import { describe, it, expect, vi, beforeEach } from 'vitest';
import authReducer, {
    loginStart,
    loginSuccess,
    loginFailure,
    logout,
} from './authSlice';

// Mock tokenManager
vi.mock('../services/api', () => ({
    tokenManager: {
        hasTokens: vi.fn(() => false),
        clearTokens: vi.fn(),
        setTokens: vi.fn(),
        getAccessToken: vi.fn(),
        getRefreshToken: vi.fn(),
    },
}));

describe('authSlice', () => {
    const mockUser = {
        username: 'testuser',
        role: 'gp' as const,
    };

    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        vi.clearAllMocks();
    });

    describe('Initial State', () => {
        it('should have correct initial state when no stored session', () => {
            const state = authReducer(undefined, { type: '@@INIT' });
            
            expect(state.user).toBeNull();
            expect(state.isAuthenticated).toBe(false);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBeNull();
        });
    });

    describe('loginStart', () => {
        it('should set isLoading to true and clear error', () => {
            const previousState = {
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: 'Previous error',
            };
            
            const state = authReducer(previousState, loginStart());
            
            expect(state.isLoading).toBe(true);
            expect(state.error).toBeNull();
        });
    });

    describe('loginSuccess', () => {
        it('should set user and isAuthenticated', () => {
            const previousState = {
                user: null,
                isAuthenticated: false,
                isLoading: true,
                error: null,
            };
            
            const state = authReducer(previousState, loginSuccess(mockUser));
            
            expect(state.user).toEqual(mockUser);
            expect(state.isAuthenticated).toBe(true);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBeNull();
        });

        it('should persist user to localStorage', () => {
            const previousState = {
                user: null,
                isAuthenticated: false,
                isLoading: true,
                error: null,
            };
            
            authReducer(previousState, loginSuccess(mockUser));
            
            const stored = localStorage.getItem('auth_session');
            expect(stored).not.toBeNull();
            expect(JSON.parse(stored!)).toEqual(mockUser);
        });
    });

    describe('loginFailure', () => {
        it('should set error and clear user', () => {
            const previousState = {
                user: mockUser,
                isAuthenticated: true,
                isLoading: true,
                error: null,
            };
            
            const errorMessage = 'Invalid credentials';
            const state = authReducer(previousState, loginFailure(errorMessage));
            
            expect(state.user).toBeNull();
            expect(state.isAuthenticated).toBe(false);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBe(errorMessage);
        });

        it('should clear localStorage on failure', () => {
            localStorage.setItem('auth_session', JSON.stringify(mockUser));
            
            const previousState = {
                user: mockUser,
                isAuthenticated: true,
                isLoading: true,
                error: null,
            };
            
            authReducer(previousState, loginFailure('Error'));
            
            expect(localStorage.getItem('auth_session')).toBeNull();
        });
    });

    describe('logout', () => {
        it('should clear user and authentication state', () => {
            const previousState = {
                user: mockUser,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            };
            
            const state = authReducer(previousState, logout());
            
            expect(state.user).toBeNull();
            expect(state.isAuthenticated).toBe(false);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBeNull();
        });

        it('should clear localStorage on logout', () => {
            localStorage.setItem('auth_session', JSON.stringify(mockUser));
            
            const previousState = {
                user: mockUser,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            };
            
            authReducer(previousState, logout());
            
            expect(localStorage.getItem('auth_session')).toBeNull();
        });
    });

    describe('State Transitions', () => {
        it('should handle full login flow', () => {
            let state = authReducer(undefined, { type: '@@INIT' });
            
            // Start login
            state = authReducer(state, loginStart());
            expect(state.isLoading).toBe(true);
            
            // Login success
            state = authReducer(state, loginSuccess(mockUser));
            expect(state.isAuthenticated).toBe(true);
            expect(state.user).toEqual(mockUser);
            
            // Logout
            state = authReducer(state, logout());
            expect(state.isAuthenticated).toBe(false);
            expect(state.user).toBeNull();
        });

        it('should handle failed login flow', () => {
            let state = authReducer(undefined, { type: '@@INIT' });
            
            // Start login
            state = authReducer(state, loginStart());
            expect(state.isLoading).toBe(true);
            
            // Login failure
            state = authReducer(state, loginFailure('Invalid password'));
            expect(state.isAuthenticated).toBe(false);
            expect(state.error).toBe('Invalid password');
        });
    });
});

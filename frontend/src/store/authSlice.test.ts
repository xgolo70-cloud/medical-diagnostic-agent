import { describe, it, expect } from 'vitest';
import authReducer, {
    loginStart,
    loginSuccess,
    loginFailure,
    logout,
} from './authSlice';

describe('authSlice', () => {
    const initialState = {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
    };

    describe('initial state', () => {
        it('should return the initial state when passed undefined', () => {
            const result = authReducer(undefined, { type: 'unknown' });
            expect(result).toEqual(initialState);
        });
    });

    describe('loginStart', () => {
        it('should set isLoading to true and clear error', () => {
            const stateWithError = { ...initialState, error: 'Previous error' };
            const result = authReducer(stateWithError, loginStart());

            expect(result.isLoading).toBe(true);
            expect(result.error).toBeNull();
        });
    });

    describe('loginSuccess', () => {
        it('should set user, authenticate, and clear loading state', () => {
            const loadingState = { ...initialState, isLoading: true };
            const user = { username: 'admin', role: 'gp' as const };

            const result = authReducer(loadingState, loginSuccess(user));

            expect(result.user).toEqual(user);
            expect(result.isAuthenticated).toBe(true);
            expect(result.isLoading).toBe(false);
            expect(result.error).toBeNull();
        });

        it('should accept different user roles', () => {
            const specialistUser = { username: 'dr.smith', role: 'specialist' as const };
            const result = authReducer(initialState, loginSuccess(specialistUser));

            expect(result.user?.role).toBe('specialist');
        });
    });

    describe('loginFailure', () => {
        it('should set error message and clear loading state', () => {
            const loadingState = { ...initialState, isLoading: true };
            const errorMessage = 'Invalid credentials';

            const result = authReducer(loadingState, loginFailure(errorMessage));

            expect(result.error).toBe(errorMessage);
            expect(result.isLoading).toBe(false);
            expect(result.isAuthenticated).toBe(false);
            expect(result.user).toBeNull();
        });
    });

    describe('logout', () => {
        it('should reset to initial state', () => {
            const authenticatedState = {
                user: { username: 'admin', role: 'gp' as const },
                isAuthenticated: true,
                isLoading: false,
                error: null,
            };

            const result = authReducer(authenticatedState, logout());

            expect(result).toEqual(initialState);
        });
    });
});

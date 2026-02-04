/**
 * LoginForm Component Tests
 * 
 * Tests for the login form including validation, submission, and demo login functionality.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../../store/authSlice';

// Mock the modules before importing the component
vi.mock('../../../lib/supabase', () => ({
    supabase: {
        auth: {
            getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
            signInWithPassword: vi.fn(),
            signInWithOAuth: vi.fn(),
            onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
        },
        from: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
    },
    supabaseAuth: {
        signIn: vi.fn(),
        signInWithGoogle: vi.fn(),
    },
    db: {
        getProfile: vi.fn().mockResolvedValue({ profile: null, error: null }),
    },
}));

vi.mock('../../../services/api', () => ({
    tokenManager: {
        setTokens: vi.fn(),
        getAccessToken: vi.fn(),
        clearTokens: vi.fn(),
    },
}));

// Import component after mocks
import { LoginForm } from '../LoginForm';
import { supabaseAuth } from '../../../lib/supabase';

// Helper to create test store
const createTestStore = (preloadedState = {}) => {
    return configureStore({
        reducer: {
            auth: authReducer,
        },
        preloadedState: {
            auth: {
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
                ...preloadedState,
            },
        },
    });
};

// Helper to render with providers
const renderWithProviders = (ui: React.ReactElement, store = createTestStore()) => {
    return render(
        <Provider store={store}>
            <BrowserRouter>
                {ui}
            </BrowserRouter>
        </Provider>
    );
};

describe('LoginForm Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('renders the login form', () => {
            renderWithProviders(<LoginForm />);
            
            expect(screen.getByText('Welcome Back')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
        });

        it('renders email input field', () => {
            renderWithProviders(<LoginForm />);
            
            const emailInput = screen.getByPlaceholderText('you@example.com');
            expect(emailInput).toBeInTheDocument();
            expect(emailInput).toHaveAttribute('type', 'email');
        });

        it('renders password input field', () => {
            renderWithProviders(<LoginForm />);
            
            const passwordInput = screen.getByPlaceholderText('••••••••');
            expect(passwordInput).toBeInTheDocument();
            expect(passwordInput).toHaveAttribute('type', 'password');
        });

        it('renders sign in button', () => {
            renderWithProviders(<LoginForm />);
            
            expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
        });

        it('renders Google sign in button', () => {
            renderWithProviders(<LoginForm />);
            
            expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
        });

        it('renders demo login buttons', () => {
            renderWithProviders(<LoginForm />);
            
            expect(screen.getByText('Quick Select')).toBeInTheDocument();
            expect(screen.getByText('admin')).toBeInTheDocument();
            expect(screen.getByText('specialist')).toBeInTheDocument();
            expect(screen.getByText('auditor')).toBeInTheDocument();
        });

        it('renders forgot password link', () => {
            renderWithProviders(<LoginForm />);
            
            expect(screen.getByText('Forgot?')).toBeInTheDocument();
        });

        it('renders create account link', () => {
            renderWithProviders(<LoginForm />);
            
            expect(screen.getByText('Create one')).toBeInTheDocument();
        });
    });

    describe('Form Validation', () => {
        it('shows error for empty email on blur', async () => {
            const user = userEvent.setup();
            renderWithProviders(<LoginForm />);
            
            const emailInput = screen.getByPlaceholderText('you@example.com');
            await user.click(emailInput);
            await user.tab(); // Blur the input
            
            await waitFor(() => {
                expect(screen.getByText('Email is required')).toBeInTheDocument();
            });
        });

        it('shows error for invalid email format', async () => {
            const user = userEvent.setup();
            renderWithProviders(<LoginForm />);
            
            const emailInput = screen.getByPlaceholderText('you@example.com');
            await user.type(emailInput, 'invalid-email');
            await user.tab();
            
            await waitFor(() => {
                expect(screen.getByText('Invalid email format')).toBeInTheDocument();
            });
        });

        it('shows error for empty password on blur', async () => {
            const user = userEvent.setup();
            renderWithProviders(<LoginForm />);
            
            const passwordInput = screen.getByPlaceholderText('••••••••');
            await user.click(passwordInput);
            await user.tab();
            
            await waitFor(() => {
                expect(screen.getByText('Password is required')).toBeInTheDocument();
            });
        });

        it('clears email error when user types', async () => {
            const user = userEvent.setup();
            renderWithProviders(<LoginForm />);
            
            const emailInput = screen.getByPlaceholderText('you@example.com');
            await user.click(emailInput);
            await user.tab();
            
            await waitFor(() => {
                expect(screen.getByText('Email is required')).toBeInTheDocument();
            });
            
            await user.type(emailInput, 'test@example.com');
            
            await waitFor(() => {
                expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
            });
        });
    });

    describe('Password Visibility Toggle', () => {
        it('toggles password visibility', async () => {
            const user = userEvent.setup();
            renderWithProviders(<LoginForm />);
            
            const passwordInput = screen.getByPlaceholderText('••••••••');
            expect(passwordInput).toHaveAttribute('type', 'password');
            
            // Find and click the toggle button
            const toggleButton = passwordInput.parentElement?.querySelector('button');
            if (toggleButton) {
                await user.click(toggleButton);
                expect(passwordInput).toHaveAttribute('type', 'text');
                
                await user.click(toggleButton);
                expect(passwordInput).toHaveAttribute('type', 'password');
            }
        });
    });

    describe('Form Submission', () => {
        it('prevents submission with empty fields', async () => {
            const user = userEvent.setup();
            renderWithProviders(<LoginForm />);
            
            const submitButton = screen.getByRole('button', { name: /sign in/i });
            await user.click(submitButton);
            
            // Form should show validation errors
            await waitFor(() => {
                expect(screen.getByText('Email is required')).toBeInTheDocument();
            });
        });

        it('calls Supabase signIn on valid form submission', async () => {
            const user = userEvent.setup();
            const mockSignIn = vi.mocked(supabaseAuth.signIn);
            mockSignIn.mockResolvedValueOnce({ 
                data: { user: { id: '123', email: 'test@example.com' }, session: null }, 
                error: null 
            } as unknown as Awaited<ReturnType<typeof supabaseAuth.signIn>>);
            
            renderWithProviders(<LoginForm />);
            
            await user.type(screen.getByPlaceholderText('you@example.com'), 'test@example.com');
            await user.type(screen.getByPlaceholderText('••••••••'), 'Password123!');
            
            const submitButton = screen.getByRole('button', { name: /sign in/i });
            await user.click(submitButton);
            
            await waitFor(() => {
                expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'Password123!');
            });
        });
    });

    describe('Loading State', () => {
        it('disables form inputs during loading', () => {
            const store = createTestStore({ isLoading: true });
            renderWithProviders(<LoginForm />, store);
            
            expect(screen.getByPlaceholderText('you@example.com')).toBeDisabled();
            expect(screen.getByPlaceholderText('••••••••')).toBeDisabled();
        });

        it('shows loading spinner on submit button during loading', () => {
            const store = createTestStore({ isLoading: true });
            renderWithProviders(<LoginForm />, store);
            
            // Find the submit button by type
            const submitButton = document.querySelector('button[type="submit"]');
            expect(submitButton).toBeInTheDocument();
            expect(submitButton).toBeDisabled();
        });
    });

    describe('Error Display', () => {
        it('displays error message from Redux state', () => {
            const store = createTestStore({ error: 'Invalid credentials' });
            renderWithProviders(<LoginForm />, store);
            
            expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
        });
    });

    describe('Google OAuth', () => {
        it('calls Google sign in on button click', async () => {
            const user = userEvent.setup();
            const mockGoogleSignIn = vi.mocked(supabaseAuth.signInWithGoogle);
            mockGoogleSignIn.mockResolvedValueOnce({ data: { provider: 'google' as const, url: null }, error: null });
            
            renderWithProviders(<LoginForm />);
            
            const googleButton = screen.getByRole('button', { name: /sign in with google/i });
            await user.click(googleButton);
            
            await waitFor(() => {
                expect(mockGoogleSignIn).toHaveBeenCalled();
            });
        });
    });

    describe('Accessibility', () => {
        it('has proper form labels', () => {
            renderWithProviders(<LoginForm />);
            
            expect(screen.getByText('Email')).toBeInTheDocument();
            expect(screen.getByText('Password')).toBeInTheDocument();
        });

        it('has back navigation link', () => {
            renderWithProviders(<LoginForm />);
            
            expect(screen.getByText('Back')).toBeInTheDocument();
        });

        it('shows secure indicator', () => {
            renderWithProviders(<LoginForm />);
            
            expect(screen.getByText('Secure')).toBeInTheDocument();
        });
    });
});

/**
 * Enhanced Test Setup
 * 
 * Provides comprehensive mocks for Supabase, API client, and common test utilities.
 */
import '@testing-library/jest-dom/vitest';
import { vi, beforeEach } from 'vitest';

// ================== SUPABASE CLIENT MOCK ==================

const mockSession = {
    access_token: 'mock-access-token-12345',
    refresh_token: 'mock-refresh-token-67890',
    expires_in: 3600,
    user: {
        id: 'mock-user-id',
        email: 'test@example.com',
        user_metadata: {
            full_name: 'Test User',
        },
    },
};

const mockSupabaseAuth = {
    getSession: vi.fn().mockResolvedValue({ data: { session: mockSession }, error: null }),
    getUser: vi.fn().mockResolvedValue({ data: { user: mockSession.user }, error: null }),
    signInWithPassword: vi.fn().mockResolvedValue({ data: { session: mockSession }, error: null }),
    signUp: vi.fn().mockResolvedValue({ data: { session: mockSession }, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
    updateUser: vi.fn().mockResolvedValue({ data: { user: mockSession.user }, error: null }),
};

const mockSupabaseStorage = {
    from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: { path: 'test/file.png' }, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://storage.example.com/file.png' } }),
        download: vi.fn().mockResolvedValue({ data: new Blob(), error: null }),
        remove: vi.fn().mockResolvedValue({ error: null }),
    }),
};

export const mockSupabaseClient = {
    auth: mockSupabaseAuth,
    storage: mockSupabaseStorage,
    from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: {}, error: null }),
    }),
};

// Mock Supabase module
vi.mock('../lib/supabase', () => ({
    supabase: mockSupabaseClient,
}));

// ================== FETCH MOCK ==================

const mockFetch = vi.fn();

global.fetch = mockFetch;

export const resetFetchMock = () => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
        text: async () => '',
        status: 200,
    });
};

export const mockFetchResponse = (data: unknown, status = 200) => {
    mockFetch.mockResolvedValueOnce({
        ok: status >= 200 && status < 300,
        json: async () => data,
        text: async () => JSON.stringify(data),
        status,
    });
};

export const mockFetchError = (message: string, status = 500) => {
    mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: message }),
        text: async () => message,
        status,
    });
};

// Reset mocks before each test
beforeEach(() => {
    resetFetchMock();
    vi.clearAllMocks();
});

// ================== ROUTER MOCK ==================

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => vi.fn(),
        useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
        useParams: () => ({}),
    };
});

// ================== ENVIRONMENT MOCK ==================

vi.stubEnv('VITE_API_URL', 'http://localhost:8000');
vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');

// ================== HELPERS ==================

export const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

export const waitFor = async (callback: () => void, timeout = 1000) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        try {
            callback();
            return;
        } catch {
            await flushPromises();
        }
    }
    callback();
};

// Export mocks for test files
export { mockFetch, mockSession, mockSupabaseAuth };

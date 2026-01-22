/**
 * Authenticated Fetch Utility
 * Wraps fetch with automatic token handling and 401 recovery
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

interface TokenPair {
    access_token: string;
    refresh_token: string;
}

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

/**
 * Attempt to refresh the access token
 */
async function refreshAccessToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
        return null;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (!response.ok) {
            throw new Error('Token refresh failed');
        }

        const data: TokenPair = await response.json();
        localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
        return data.access_token;
    } catch {
        // Clear tokens and redirect to login
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        return null;
    }
}

/**
 * Get or refresh the access token
 */
async function getValidToken(): Promise<string | null> {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
        return token;
    }

    // If already refreshing, wait for that to complete
    if (isRefreshing && refreshPromise) {
        return refreshPromise;
    }

    return null;
}

/**
 * Authenticated fetch with automatic token refresh
 * 
 * @param url - The URL to fetch (can be relative or absolute)
 * @param options - Fetch options
 * @returns Response object
 * 
 * @example
 * const response = await authFetch('/admin/users');
 * const data = await response.json();
 */
export async function authFetch(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    const token = await getValidToken();
    
    // Build headers with auth
    const headers: Record<string, string> = {
        ...options.headers as Record<string, string>,
    };

    // Set Content-Type to application/json by default, unless matches FormData or is explicitly set
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Make the request
    let response = await fetch(url, { ...options, headers });

    // Handle 401 - try to refresh token
    if (response.status === 401 && !isRefreshing) {
        isRefreshing = true;
        refreshPromise = refreshAccessToken();
        const newToken = await refreshPromise;
        isRefreshing = false;
        refreshPromise = null;

        if (newToken) {
            // Retry with new token
            (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
            response = await fetch(url, { ...options, headers });
        } else {
            // Redirect to login
            window.location.href = '/login';
        }
    }

    return response;
}

/**
 * Get auth headers for manual use
 */
export function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
}

export default authFetch;

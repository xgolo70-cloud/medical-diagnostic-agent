/**
 * Google OAuth Configuration
 * 
 * To set up Google OAuth:
 * 1. Go to https://console.cloud.google.com/
 * 2. Create a new project or select existing
 * 3. Enable "Google+ API" or "Google Identity Services"
 * 4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
 * 5. Choose "Web application"
 * 6. Add authorized JavaScript origins:
 *    - http://localhost:5173 (for development)
 *    - Your production domain
 * 7. Add authorized redirect URIs:
 *    - http://localhost:5173 (for development)
 *    - Your production domain
 * 8. Copy the Client ID and paste it below or set as environment variable
 */

// Google OAuth Client ID
// IMPORTANT: Replace with your actual Google OAuth Client ID
// Get yours at: https://console.cloud.google.com/apis/credentials
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE';

// OAuth Configuration
export const OAUTH_CONFIG = {
  // Scopes requested from Google
  scopes: ['email', 'profile', 'openid'],
  
  // Where to redirect after login (optional)
  redirectUri: window.location.origin,
  
  // Auto-login if already authenticated with Google
  auto_select: false,
  
  // Cancel on tap outside the prompt
  cancel_on_tap_outside: true,
};

// Check if Google OAuth is properly configured
export const isGoogleOAuthConfigured = (): boolean => {
  return GOOGLE_CLIENT_ID !== '' && 
         GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID_HERE' &&
         GOOGLE_CLIENT_ID.includes('.apps.googleusercontent.com');
};

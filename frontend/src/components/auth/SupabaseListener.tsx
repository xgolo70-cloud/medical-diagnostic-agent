import { useEffect } from 'react';
import { supabaseAuth } from '../../lib/supabase';
import { useAppDispatch } from '../../store/hooks';
import { loginSuccess, logout } from '../../store/authSlice';
import { tokenManager } from '../../services/api';

export const SupabaseListener = () => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        // Listen for Supabase auth state changes (e.g. after Google redirect)
        const { data: { subscription } } = supabaseAuth.onAuthStateChange(async (event, session) => {
            console.log('Supabase Auth Event:', event);

            if (event === 'SIGNED_IN' && session) {
                const { user, access_token, refresh_token } = session;
                
                // 1. Set tokens in localStorage for API client to use
                // Pass the Supabase access token as our main token
                // NOTE: The backend must be configured to accept this Supabase JWT
                tokenManager.setTokens(access_token, refresh_token);

                // 2. Dispatch success to Redux
                dispatch(loginSuccess({
                    username: user.email?.split('@')[0] || 'user',
                    email: user.email || '',
                    role: user.app_metadata?.role || 'patient',
                    displayName: user.user_metadata?.full_name,
                    avatar: user.user_metadata?.avatar_url,
                }));
            } else if (event === 'SIGNED_OUT') {
                tokenManager.clearTokens();
                dispatch(logout());
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [dispatch]);

    return null; // This component doesn't render anything
};

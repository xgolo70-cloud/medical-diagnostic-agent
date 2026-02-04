/**
 * Custom hook for Supabase authentication
 * Provides auth state management and user session handling
 */

import { useEffect, useCallback } from 'react'
import { supabaseAuth, db } from '../lib/supabase'
import type { User } from '../lib/supabase'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { loginSuccess, logout as logoutAction, loginStart, loginFailure } from '../store/authSlice'

export function useSupabaseAuth() {
  const dispatch = useAppDispatch()
  const { isAuthenticated, user, isLoading } = useAppSelector((state) => state.auth)

  // Handle authenticated user - fetch profile and dispatch to Redux
  const handleAuthUser = useCallback(async (authUser: User) => {
    try {
      const { profile, error } = await db.getProfile(authUser.id)
      
      if (error) {
        console.error('[Supabase] Error fetching profile:', error)
        // Profile might not exist yet (just signed up)
        dispatch(loginSuccess({
          username: authUser.email?.split('@')[0] || 'user',
          role: 'patient',
          email: authUser.email,
          displayName: authUser.user_metadata?.full_name
        }))
        return
      }

      if (profile) {
        dispatch(loginSuccess({
          username: profile.username,
          role: profile.role,
          email: authUser.email,
          avatar: profile.avatar_url || undefined,
          displayName: profile.full_name || undefined
        }))
      }
    } catch (err) {
      console.error('[Supabase] Auth error:', err)
    }
  }, [dispatch])

  // Initialize auth state on mount
  useEffect(() => {
    // Check existing session
    const initAuth = async () => {
      const { session } = await supabaseAuth.getSession()
      if (session?.user) {
        await handleAuthUser(session.user)
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabaseAuth.onAuthStateChange(async (event, session) => {
      console.log('[Supabase Auth] Event:', event)
      
      if (event === 'SIGNED_IN' && session?.user) {
        await handleAuthUser(session.user)
      } else if (event === 'SIGNED_OUT') {
        dispatch(logoutAction())
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [dispatch, handleAuthUser])



  // Sign up with email
  const signUp = useCallback(async (
    email: string,
    password: string,
    metadata?: { username?: string; full_name?: string }
  ) => {
    dispatch(loginStart())
    const { data, error } = await supabaseAuth.signUp(email, password, metadata)
    
    if (error) {
      dispatch(loginFailure(error.message))
      return { success: false, error: error.message }
    }
    
    return { success: true, data }
  }, [dispatch])

  // Sign in with email
  const signIn = useCallback(async (email: string, password: string) => {
    dispatch(loginStart())
    const { data, error } = await supabaseAuth.signIn(email, password)
    
    if (error) {
      dispatch(loginFailure(error.message))
      return { success: false, error: error.message }
    }
    
    return { success: true, data }
  }, [dispatch])

  // Sign in with Google
  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabaseAuth.signInWithGoogle()
    if (error) {
      return { success: false, error: error.message }
    }
    return { success: true }
  }, [])

  // Sign out
  const signOut = useCallback(async () => {
    const { error } = await supabaseAuth.signOut()
    if (error) {
      console.error('[Supabase] Sign out error:', error)
    }
    dispatch(logoutAction())
  }, [dispatch])

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabaseAuth.resetPassword(email)
    if (error) {
      return { success: false, error: error.message }
    }
    return { success: true }
  }, [])

  return {
    isAuthenticated,
    user,
    isLoading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword
  }
}

export default useSupabaseAuth

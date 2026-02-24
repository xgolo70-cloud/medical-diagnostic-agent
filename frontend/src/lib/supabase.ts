/**
 * Supabase Client Configuration
 * 
 * This file initializes and exports the Supabase client for use throughout
 * the Medical Diagnostic Agent application.
 */

import { createClient } from '@supabase/supabase-js'
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase environment variables are not configured. ' +
    'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  )
}

// Database types
export interface Profile {
  id: string
  username: string
  full_name: string | null
  role: 'patient' | 'doctor' | 'specialist' | 'admin' | 'auditor' | 'gp'
  phone: string | null
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Diagnosis {
  id: string
  user_id: string
  image_url: string | null
  diagnosis_text: string
  confidence: number | null
  model_used: string
  image_type: 'xray' | 'ct' | 'mri' | 'ultrasound' | 'other' | null
  created_at: string
}

// Create and export the Supabase client (or null if not configured)
export const supabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

export const supabase = supabaseConfigured
  ? createClient(
      supabaseUrl!,
      supabaseAnonKey!,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        }
      }
    )
  : null
// Helper to create a typed error when Supabase is not configured
const notConfiguredError = { message: 'Supabase is not configured', status: 0 } as const

// Auth helper functions
export const supabaseAuth = {
  /**
   * Sign up with email and password
   */
  signUp: async (email: string, password: string, metadata?: { username?: string; full_name?: string }) => {
    if (!supabase) return { data: null, error: notConfiguredError }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    return { data, error }
  },

  /**
   * Sign in with email and password
   */
  signIn: async (email: string, password: string) => {
    if (!supabase) return { data: null, error: notConfiguredError }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  /**
   * Sign in with Google OAuth
   */
  signInWithGoogle: async () => {
    if (!supabase) return { data: null, error: notConfiguredError }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })
    return { data, error }
  },

  /**
   * Sign out
   */
  signOut: async () => {
    if (!supabase) return { error: null }
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  /**
   * Get current session
   */
  getSession: async () => {
    if (!supabase) return { session: null, error: null }
    const { data, error } = await supabase.auth.getSession()
    return { session: data.session, error }
  },

  /**
   * Get current user
   */
  getUser: async () => {
    if (!supabase) return { user: null, error: null }
    const { data, error } = await supabase.auth.getUser()
    return { user: data.user, error }
  },

  /**
   * Request password reset
   */
  resetPassword: async (email: string) => {
    if (!supabase) return { data: null, error: notConfiguredError }
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    return { data, error }
  },

  /**
   * Update password
   */
  updatePassword: async (newPassword: string) => {
    if (!supabase) return { data: null, error: notConfiguredError }
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    })
    return { data, error }
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange: (callback: (event: AuthChangeEvent, session: Session | null) => void) => {
    if (!supabase) {
      // Return a no-op subscription when Supabase is not configured
      return { data: { subscription: { unsubscribe: () => {} } } }
    }
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database helper functions
export const db = {
  /**
   * Get user profile
   */
  getProfile: async (userId: string) => {
    if (!supabase) return { profile: null, error: notConfiguredError }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { profile: data as Profile | null, error }
  },

  /**
   * Update user profile
   */
  updateProfile: async (userId: string, updates: Partial<Profile>) => {
    if (!supabase) return { profile: null, error: notConfiguredError }
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()
    return { profile: data as Profile | null, error }
  },

  /**
   * Get user diagnoses
   */
  getDiagnoses: async (userId: string, limit = 50) => {
    if (!supabase) return { diagnoses: null, error: notConfiguredError }
    const { data, error } = await supabase
      .from('diagnoses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    return { diagnoses: data as Diagnosis[] | null, error }
  },

  /**
   * Create new diagnosis
   */
  createDiagnosis: async (diagnosis: Omit<Diagnosis, 'id' | 'created_at'>) => {
    if (!supabase) return { diagnosis: null, error: notConfiguredError }
    const { data, error } = await supabase
      .from('diagnoses')
      .insert(diagnosis)
      .select()
      .single()
    return { diagnosis: data as Diagnosis | null, error }
  },

  /**
   * Log audit event
   */
  logAudit: async (userId: string, action: string, details?: Record<string, unknown>) => {
    if (!supabase) return { error: notConfiguredError }
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        action,
        details
      })
    return { error }
  }
}

// Storage helper functions
export const storage = {
  /**
   * Upload medical image
   */
  uploadImage: async (file: File, userId: string) => {
    if (!supabase) return { path: null, error: notConfiguredError }
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    const { data, error } = await supabase.storage
      .from('medical-images')
      .upload(filePath, file)

    return { path: data?.path, error }
  },

  /**
   * Get public URL for image
   */
  getPublicUrl: (path: string) => {
    if (!supabase) return ''
    const { data } = supabase.storage
      .from('medical-images')
      .getPublicUrl(path)
    return data.publicUrl
  },
  
  /**
   * Get signed URL for private image
   */
  getSignedUrl: async (path: string, expiresIn = 3600) => {
    if (!supabase) return { signedUrl: null, error: notConfiguredError }
    const { data, error } = await supabase.storage
      .from('medical-images')
      .createSignedUrl(path, expiresIn)
    return { signedUrl: data?.signedUrl, error }
  }
}


// Export types
export type { User, Session, AuthChangeEvent }


/**
 * Authentication Service - Supabase Implementation
 * 
 * Handles all authentication-related operations.
 * Uses Supabase Auth with cookie-based sessions.
 */

import { supabase } from '@/lib/supabase/client'
import type { IAuthService, ServiceResult } from './types'

/**
 * Create an authentication service error
 */
function createError(code: string, message: string, details?: unknown) {
  return { code, message, details }
}

/**
 * Authentication service implementation using Supabase
 */
export const authService: IAuthService = {
  /**
   * Sign up a new user
   */
  async signUp(email: string, password: string, profileData?: { firm_name?: string }): Promise<ServiceResult<{ userId: string }>> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
          data: {
            firm_name: profileData?.firm_name || '',
          },
        },
      })

      if (error) {
        return {
          data: null,
          error: createError('AUTH_ERROR', error.message, error),
        }
      }

      if (!data.user) {
        return {
          data: null,
          error: createError('AUTH_ERROR', 'No user returned from signup'),
        }
      }

      // Create profile for the new user
      if (profileData?.firm_name) {
        await supabase.from('profiles').insert({
          user_id: data.user.id,
          firm_name: profileData.firm_name,
        })
      }

      return {
        data: { userId: data.user.id },
        error: null,
      }
    } catch (err) {
      return {
        data: null,
        error: createError('UNEXPECTED_ERROR', 'An unexpected error occurred', err),
      }
    }
  },

  /**
   * Sign in an existing user
   */
  async signIn(email: string, password: string): Promise<ServiceResult<{ userId: string }>> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return {
          data: null,
          error: createError('AUTH_ERROR', error.message, error),
        }
      }

      if (!data.user) {
        return {
          data: null,
          error: createError('AUTH_ERROR', 'No user returned from signin'),
        }
      }

      return {
        data: { userId: data.user.id },
        error: null,
      }
    } catch (err) {
      return {
        data: null,
        error: createError('UNEXPECTED_ERROR', 'An unexpected error occurred', err),
      }
    }
  },

  /**
   * Sign out the current user
   */
  async signOut(): Promise<ServiceResult<void>> {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        return {
          data: null,
          error: createError('AUTH_ERROR', error.message, error),
        }
      }

      return { data: undefined, error: null }
    } catch (err) {
      return {
        data: null,
        error: createError('UNEXPECTED_ERROR', 'An unexpected error occurred', err),
      }
    }
  },

  /**
   * Get the currently authenticated user
   */
  async getCurrentUser(): Promise<ServiceResult<{ id: string; email: string } | null>> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error) {
        // Not authenticated is not an error
        if (error.message.includes('not authenticated')) {
          return { data: null, error: null }
        }
        return {
          data: null,
          error: createError('AUTH_ERROR', error.message, error),
        }
      }

      if (!user) {
        return { data: null, error: null }
      }

      return {
        data: { id: user.id, email: user.email ?? '' },
        error: null,
      }
    } catch (err) {
      return {
        data: null,
        error: createError('UNEXPECTED_ERROR', 'An unexpected error occurred', err),
      }
    }
  },

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
      })

      if (error) {
        return {
          data: null,
          error: createError('AUTH_ERROR', error.message, error),
        }
      }

      return { data: undefined, error: null }
    } catch (err) {
      return {
        data: null,
        error: createError('UNEXPECTED_ERROR', 'An unexpected error occurred', err),
      }
    }
  },

  /**
   * Update user password
   */
  async updatePassword(newPassword: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        return {
          data: null,
          error: createError('AUTH_ERROR', error.message, error),
        }
      }

      return { data: undefined, error: null }
    } catch (err) {
      return {
        data: null,
        error: createError('UNEXPECTED_ERROR', 'An unexpected error occurred', err),
      }
    }
  },
}

export default authService

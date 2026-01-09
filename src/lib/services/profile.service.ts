/**
 * Profile Service - Supabase Implementation
 * 
 * Handles user profile operations.
 */

import { supabase } from '@/lib/supabase/client'
import type { Profile, ProfileUpdate } from '@/lib/supabase/database.types'
import type { IProfileService, ServiceResult } from './types'

/**
 * Create an error object
 */
function createError(code: string, message: string, details?: unknown) {
  return { code, message, details }
}

/**
 * Profile service implementation using Supabase
 */
export const profileService: IProfileService = {
  /**
   * Get the current user's profile
   */
  async getProfile(): Promise<ServiceResult<Profile>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        return {
          data: null,
          error: createError('NOT_AUTHENTICATED', 'User not authenticated'),
        }
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        return {
          data: null,
          error: createError('DB_ERROR', error.message, error),
        }
      }

      return { data, error: null }
    } catch (err) {
      return {
        data: null,
        error: createError('UNEXPECTED_ERROR', 'An unexpected error occurred', err),
      }
    }
  },

  /**
   * Update the current user's profile
   */
  async updateProfile(updates: ProfileUpdate): Promise<ServiceResult<Profile>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        return {
          data: null,
          error: createError('NOT_AUTHENTICATED', 'User not authenticated'),
        }
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        return {
          data: null,
          error: createError('DB_ERROR', error.message, error),
        }
      }

      return { data, error: null }
    } catch (err) {
      return {
        data: null,
        error: createError('UNEXPECTED_ERROR', 'An unexpected error occurred', err),
      }
    }
  },

  /**
   * Upload a firm logo
   */
  async uploadLogo(file: File): Promise<ServiceResult<{ url: string }>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        return {
          data: null,
          error: createError('NOT_AUTHENTICATED', 'User not authenticated'),
        }
      }

      // Generate unique filename
      const ext = file.name.split('.').pop()
      const fileName = `logos/${user.id}/${Date.now()}.${ext}`

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from('firm-assets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) {
        return {
          data: null,
          error: createError('STORAGE_ERROR', uploadError.message, uploadError),
        }
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('firm-assets')
        .getPublicUrl(fileName)

      // Update profile with new logo URL
      await supabase
        .from('profiles')
        .update({ firm_logo_url: publicUrl })
        .eq('user_id', user.id)

      return { data: { url: publicUrl }, error: null }
    } catch (err) {
      return {
        data: null,
        error: createError('UNEXPECTED_ERROR', 'An unexpected error occurred', err),
      }
    }
  },
}

export default profileService

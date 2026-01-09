/**
 * Portal Service - Supabase Implementation
 * 
 * Handles magic link generation, validation, and portal operations.
 * This service is used for the client-facing portal where clients
 * sign contracts, answer questionnaires, and upload documents.
 */

import { supabase } from '@/lib/supabase/client'
import type { ClientWithDetails, SignatureData } from '@/lib/supabase/database.types'
import type { IPortalService, ServiceResult } from './types'

/**
 * Create an error object
 */
function createError(code: string, message: string, details?: unknown) {
  return { code, message, details }
}

/**
 * Generate a secure random token for magic links
 */
function generateToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Portal service implementation using Supabase
 */
export const portalService: IPortalService = {
  /**
   * Generate a new magic link for a client
   */
  async generateLink(
    clientId: string,
    expiresInHours: number = 72
  ): Promise<ServiceResult<{ token: string; url: string }>> {
    try {
      const token = generateToken()
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + expiresInHours)

      // Revoke any existing active links
      await supabase
        .from('client_links')
        .update({ revoked_at: new Date().toISOString() })
        .eq('client_id', clientId)
        .is('revoked_at', null)

      // Create new link
      const { error } = await supabase.from('client_links').insert({
        client_id: clientId,
        magic_link_token: token,
        expires_at: expiresAt.toISOString(),
      })

      if (error) {
        return {
          data: null,
          error: createError('DB_ERROR', error.message, error),
        }
      }

      const url = `${process.env.NEXT_PUBLIC_APP_URL}/portal/${token}`

      return { data: { token, url }, error: null }
    } catch (err) {
      return {
        data: null,
        error: createError('UNEXPECTED_ERROR', 'An unexpected error occurred', err),
      }
    }
  },

  /**
   * Validate a magic link token
   */
  async validateLink(token: string): Promise<ServiceResult<{
    valid: boolean
    clientId?: string
    expired?: boolean
    revoked?: boolean
  }>> {
    try {
      const { data, error } = await supabase
        .from('client_links')
        .select('client_id, expires_at, revoked_at')
        .eq('magic_link_token', token)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            data: { valid: false },
            error: null,
          }
        }
        return {
          data: null,
          error: createError('DB_ERROR', error.message, error),
        }
      }

      const now = new Date()
      const expiresAt = new Date(data.expires_at)

      if (data.revoked_at) {
        return {
          data: { valid: false, revoked: true },
          error: null,
        }
      }

      if (expiresAt < now) {
        return {
          data: { valid: false, expired: true },
          error: null,
        }
      }

      // Update access tracking
      await supabase
        .from('client_links')
        .update({
          last_accessed_at: now.toISOString(),
          access_count: (await supabase
            .from('client_links')
            .select('access_count')
            .eq('magic_link_token', token)
            .single()
          ).data?.access_count ?? 0 + 1,
        })
        .eq('magic_link_token', token)

      return {
        data: { valid: true, clientId: data.client_id },
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
   * Revoke a magic link
   */
  async revokeLink(linkId: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await supabase
        .from('client_links')
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', linkId)

      if (error) {
        return {
          data: null,
          error: createError('DB_ERROR', error.message, error),
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
   * Get client data using a valid token
   */
  async getClientByToken(token: string): Promise<ServiceResult<ClientWithDetails>> {
    try {
      // First validate the token
      const validation = await this.validateLink(token)

      if (validation.error) {
        return { data: null, error: validation.error }
      }

      if (!validation.data?.valid || !validation.data.clientId) {
        return {
          data: null,
          error: createError(
            'INVALID_LINK',
            validation.data?.expired
              ? 'This link has expired'
              : validation.data?.revoked
              ? 'This link has been revoked'
              : 'Invalid link'
          ),
        }
      }

      // Get client with all related data
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          contract_template:contract_templates(*),
          questionnaire_template:questionnaire_templates(
            *,
            questions(*)
          ),
          client_documents(*),
          client_answers(*)
        `)
        .eq('id', validation.data.clientId)
        .single()

      if (error) {
        return {
          data: null,
          error: createError('DB_ERROR', error.message, error),
        }
      }

      return { data: data as ClientWithDetails, error: null }
    } catch (err) {
      return {
        data: null,
        error: createError('UNEXPECTED_ERROR', 'An unexpected error occurred', err),
      }
    }
  },

  /**
   * Sign the contract for a client
   */
  async signContract(
    clientId: string,
    signatureData: { typed_name: string }
  ): Promise<ServiceResult<void>> {
    try {
      const now = new Date()

      const fullSignatureData: SignatureData = {
        typed_name: signatureData.typed_name,
        timestamp: now.toISOString(),
      }

      const { error } = await supabase
        .from('clients')
        .update({
          signature_data: fullSignatureData as any,
          signature_timestamp: now.toISOString(),
        })
        .eq('id', clientId)
        .eq('status', 'pending')

      if (error) {
        return {
          data: null,
          error: createError('DB_ERROR', error.message, error),
        }
      }

      // Log audit event
      await supabase.from('audit_logs').insert({
        client_id: clientId,
        action: 'contract_signed',
        resource_type: 'contract',
        resource_id: clientId,
        details: { signed_name: signatureData.typed_name },
      })

      return { data: undefined, error: null }
    } catch (err) {
      return {
        data: null,
        error: createError('UNEXPECTED_ERROR', 'An unexpected error occurred', err),
      }
    }
  },

  /**
   * Mark the portal as completed
   */
  async completePortal(clientId: string): Promise<ServiceResult<void>> {
    try {
      const now = new Date()

      const { error } = await supabase
        .from('clients')
        .update({
          status: 'completed',
          completed_at: now.toISOString(),
          link_used: true,
        })
        .eq('id', clientId)

      if (error) {
        return {
          data: null,
          error: createError('DB_ERROR', error.message, error),
        }
      }

      // Log audit event
      await supabase.from('audit_logs').insert({
        client_id: clientId,
        action: 'portal_completed',
        resource_type: 'client',
        resource_id: clientId,
      })

      return { data: undefined, error: null }
    } catch (err) {
      return {
        data: null,
        error: createError('UNEXPECTED_ERROR', 'An unexpected error occurred', err),
      }
    }
  },
}

export default portalService

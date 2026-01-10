/**
 * Clients Service - Supabase Implementation
 * 
 * Handles all client-related operations.
 */

import { supabase } from '@/lib/supabase/client'
import type { 
  Client, 
  ClientCreateInput, 
  ClientUpdate, 
  ClientWithDetails 
} from '@/lib/supabase/database.types'
import type { 
  IClientsService, 
  ServiceResult, 
  PaginatedResult, 
  PaginationOptions 
} from './types'

/**
 * Create an error object
 */
function createError(code: string, message: string, details?: unknown) {
  return { code, message, details }
}

/**
 * Default pagination options
 */
const DEFAULT_PAGE_SIZE = 10

/**
 * Clients service implementation using Supabase
 */
export const clientsService: IClientsService = {
  /**
   * List clients with pagination
   */
  async list(options: PaginationOptions = {}): Promise<PaginatedResult<Client>> {
    try {
      const {
        page = 1,
        pageSize = DEFAULT_PAGE_SIZE,
        orderBy = 'created_at',
        orderDirection = 'desc',
      } = options

      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      // Get total count
      const { count } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)

      // Get paginated data
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          client_links(*)
        `)
        .is('deleted_at', null)
        .order(orderBy, { ascending: orderDirection === 'asc' })
        .range(from, to)

      if (error) {
        return {
          data: null,
          error: createError('DB_ERROR', error.message, error),
          count: null,
          page,
          pageSize,
          totalPages: 0,
        }
      }

      return {
        data,
        error: null,
        count,
        page,
        pageSize,
        totalPages: count ? Math.ceil(count / pageSize) : 0,
      }
    } catch (err) {
      return {
        data: null,
        error: createError('UNEXPECTED_ERROR', 'An unexpected error occurred', err),
        count: null,
        page: options.page ?? 1,
        pageSize: options.pageSize ?? DEFAULT_PAGE_SIZE,
        totalPages: 0,
      }
    }
  },

  /**
   * Get a client by ID with all related data
   */
  async getById(id: string): Promise<ServiceResult<ClientWithDetails>> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          contract_template:contract_templates(*),
          questionnaire_template:questionnaire_templates(
            *,
            questions(*)
          ),
          client_links(*),
          client_documents(*),
          client_answers(
            *,
            question:questions(*)
          )
        `)
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            data: null,
            error: createError('NOT_FOUND', 'Client not found'),
          }
        }
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
   * Create a new client
   */
  async create(clientData: ClientCreateInput): Promise<ServiceResult<Client>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        return {
          data: null,
          error: createError('NOT_AUTHENTICATED', 'User not authenticated'),
        }
      }

      const { data, error } = await supabase
        .from('clients')
        .insert({
          ...clientData,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) {
        return {
          data: null,
          error: createError('DB_ERROR', error.message, error),
        }
      }

      // Generate magic link token automatically
      if (data) {
        const expirationDays = clientData.expiration_days || 7
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + expirationDays)

        // Generate secure token
        const array = new Uint8Array(32)
        crypto.getRandomValues(array)
        const token = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')

        // Create the client link
        await supabase.from('client_links').insert({
          client_id: data.id,
          user_id: user.id,
          magic_link_token: token,
          expires_at: expiresAt.toISOString(),
          access_count: 0,
        })
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
   * Update a client
   */
  async update(id: string, updates: ClientUpdate): Promise<ServiceResult<Client>> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
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
   * Hard delete a client (use softDelete for GDPR compliance)
   */
  async delete(id: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)

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
   * Soft delete a client (sets deleted_at, GDPR compliant)
   */
  async softDelete(id: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

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
   * Get clients by status
   */
  async getByStatus(status: 'pending' | 'completed'): Promise<ServiceResult<Client[]>> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false })

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
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<ServiceResult<{
    total: number
    pending: number
    completed: number
    recentActivity: Client[]
  }>> {
    try {
      // Get counts
      const [totalResult, pendingResult, completedResult, recentResult] = await Promise.all([
        supabase.from('clients').select('*', { count: 'exact', head: true }),
        supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('clients').select('*').order('created_at', { ascending: false }).limit(5),
      ])

      if (recentResult.error) {
        return {
          data: null,
          error: createError('DB_ERROR', recentResult.error.message, recentResult.error),
        }
      }

      return {
        data: {
          total: totalResult.count ?? 0,
          pending: pendingResult.count ?? 0,
          completed: completedResult.count ?? 0,
          recentActivity: recentResult.data ?? [],
        },
        error: null,
      }
    } catch (err) {
      return {
        data: null,
        error: createError('UNEXPECTED_ERROR', 'An unexpected error occurred', err),
      }
    }
  },
}

export default clientsService

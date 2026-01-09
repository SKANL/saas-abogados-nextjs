/**
 * Answers Service - Supabase Implementation
 * 
 * Handles client questionnaire answers.
 */

import { supabase } from '@/lib/supabase/client'
import type { ClientAnswer, ClientAnswerInsert } from '@/lib/supabase/database.types'
import type { IAnswersService, ServiceResult } from './types'

/**
 * Create an error object
 */
function createError(code: string, message: string, details?: unknown) {
  return { code, message, details }
}

/**
 * Answers service implementation using Supabase
 */
export const answersService: IAnswersService = {
  /**
   * List all answers for a client
   */
  async list(clientId: string): Promise<ServiceResult<ClientAnswer[]>> {
    try {
      const { data, error } = await supabase
        .from('client_answers')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: true })

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
   * Submit answers for a questionnaire
   */
  async submit(answers: ClientAnswerInsert[]): Promise<ServiceResult<ClientAnswer[]>> {
    try {
      if (answers.length === 0) {
        return { data: [], error: null }
      }

      const clientId = answers[0].client_id

      // Delete existing answers for this client (allows re-submission)
      await supabase.from('client_answers').delete().eq('client_id', clientId)

      // Insert new answers
      const { data, error } = await supabase
        .from('client_answers')
        .insert(answers)
        .select()

      if (error) {
        return {
          data: null,
          error: createError('DB_ERROR', error.message, error),
        }
      }

      // Log audit event
      await supabase.from('audit_logs').insert({
        client_id: clientId,
        action: 'questionnaire_submitted',
        resource_type: 'questionnaire',
        resource_id: clientId,
        details: { answer_count: answers.length },
      })

      return { data, error: null }
    } catch (err) {
      return {
        data: null,
        error: createError('UNEXPECTED_ERROR', 'An unexpected error occurred', err),
      }
    }
  },
}

export default answersService

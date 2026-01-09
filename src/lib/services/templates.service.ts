/**
 * Templates Service - Supabase Implementation
 * 
 * Handles contract and questionnaire template operations.
 */

import { supabase } from '@/lib/supabase/client'
import type {
  ContractTemplate,
  ContractTemplateInsert,
  QuestionnaireTemplate,
  Question,
  QuestionInsert,
} from '@/lib/supabase/database.types'
import type {
  IContractTemplatesService,
  IQuestionnaireTemplatesService,
  ServiceResult,
} from './types'

/**
 * Create an error object
 */
function createError(code: string, message: string, details?: unknown) {
  return { code, message, details }
}

// ============================================
// Contract Templates Service
// ============================================

export const contractTemplatesService: IContractTemplatesService = {
  /**
   * List all contract templates for the current user
   */
  async list(): Promise<ServiceResult<ContractTemplate[]>> {
    try {
      const { data, error } = await supabase
        .from('contract_templates')
        .select('*')
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
   * Get a contract template by ID
   */
  async getById(id: string): Promise<ServiceResult<ContractTemplate>> {
    try {
      const { data, error } = await supabase
        .from('contract_templates')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            data: null,
            error: createError('NOT_FOUND', 'Contract template not found'),
          }
        }
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
   * Create a new contract template with file upload
   */
  async create(
    name: string,
    file: File
  ): Promise<ServiceResult<ContractTemplate>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        return {
          data: null,
          error: createError('NOT_AUTHENTICATED', 'User not authenticated'),
        }
      }

      // Upload file
      const ext = file.name.split('.').pop()
      const fileName = `contracts/${user.id}/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('firm-assets')
        .upload(fileName, file, {
          cacheControl: '3600',
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

      // Create template record
      const { data: template, error } = await supabase
        .from('contract_templates')
        .insert({
          name,
          user_id: user.id,
          file_url: publicUrl,
        })
        .select()
        .single()

      if (error) {
        // Clean up uploaded file on error
        await supabase.storage.from('firm-assets').remove([fileName])
        return {
          data: null,
          error: createError('DB_ERROR', error.message, error),
        }
      }

      return { data: template, error: null }
    } catch (err) {
      return {
        data: null,
        error: createError('UNEXPECTED_ERROR', 'An unexpected error occurred', err),
      }
    }
  },

  /**
   * Delete a contract template
   */
  async delete(id: string): Promise<ServiceResult<void>> {
    try {
      // Get template to find file URL
      const { data: template } = await supabase
        .from('contract_templates')
        .select('file_url')
        .eq('id', id)
        .single()

      // Delete record
      const { error } = await supabase
        .from('contract_templates')
        .delete()
        .eq('id', id)

      if (error) {
        return {
          data: null,
          error: createError('DB_ERROR', error.message, error),
        }
      }

      // Try to delete file (non-blocking)
      if (template?.file_url) {
        const path = template.file_url.split('/firm-assets/')[1]
        if (path) {
          supabase.storage.from('firm-assets').remove([path]).catch(() => {})
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

// ============================================
// Questionnaire Templates Service
// ============================================

export const questionnaireTemplatesService: IQuestionnaireTemplatesService = {
  /**
   * List all questionnaire templates with their questions
   */
  async list(): Promise<ServiceResult<(QuestionnaireTemplate & { questions: Question[] })[]>> {
    try {
      const { data, error } = await supabase
        .from('questionnaire_templates')
        .select(`
          *,
          questions(*)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        return {
          data: null,
          error: createError('DB_ERROR', error.message, error),
        }
      }

      // Sort questions by order_index
      const sorted = data?.map((template: QuestionnaireTemplate & { questions: Question[] }) => ({
        ...template,
        questions: (template.questions as Question[]).sort(
          (a, b) => a.order_index - b.order_index
        ),
      }))

      return { data: sorted, error: null }
    } catch (err) {
      return {
        data: null,
        error: createError('UNEXPECTED_ERROR', 'An unexpected error occurred', err),
      }
    }
  },

  /**
   * Get a questionnaire template by ID with questions
   */
  async getById(
    id: string
  ): Promise<ServiceResult<QuestionnaireTemplate & { questions: Question[] }>> {
    try {
      const { data, error } = await supabase
        .from('questionnaire_templates')
        .select(`
          *,
          questions(*)
        `)
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            data: null,
            error: createError('NOT_FOUND', 'Questionnaire template not found'),
          }
        }
        return {
          data: null,
          error: createError('DB_ERROR', error.message, error),
        }
      }

      // Sort questions
      const sorted = {
        ...data,
        questions: (data.questions as Question[]).sort(
          (a, b) => a.order_index - b.order_index
        ),
      }

      return { data: sorted, error: null }
    } catch (err) {
      return {
        data: null,
        error: createError('UNEXPECTED_ERROR', 'An unexpected error occurred', err),
      }
    }
  },

  /**
   * Create a new questionnaire template with questions
   */
  async create(
    name: string,
    questionTexts: string[]
  ): Promise<ServiceResult<QuestionnaireTemplate>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        return {
          data: null,
          error: createError('NOT_AUTHENTICATED', 'User not authenticated'),
        }
      }

      // Create template
      const { data: template, error: templateError } = await supabase
        .from('questionnaire_templates')
        .insert({
          user_id: user.id,
          name,
        })
        .select()
        .single()

      if (templateError) {
        return {
          data: null,
          error: createError('DB_ERROR', templateError.message, templateError),
        }
      }

      // Create questions
      if (questionTexts.length > 0) {
        const questions: QuestionInsert[] = questionTexts.map((text, index) => ({
          questionnaire_id: template.id,
          question_text: text,
          order_index: index,
        }))

        const { error: questionsError } = await supabase
          .from('questions')
          .insert(questions)

        if (questionsError) {
          // Rollback template on error
          await supabase.from('questionnaire_templates').delete().eq('id', template.id)
          return {
            data: null,
            error: createError('DB_ERROR', questionsError.message, questionsError),
          }
        }
      }

      return { data: template, error: null }
    } catch (err) {
      return {
        data: null,
        error: createError('UNEXPECTED_ERROR', 'An unexpected error occurred', err),
      }
    }
  },

  /**
   * Update a questionnaire template and its questions
   */
  async update(
    id: string,
    name: string,
    questionTexts: string[]
  ): Promise<ServiceResult<QuestionnaireTemplate>> {
    try {
      // Update template name
      const { data: template, error: templateError } = await supabase
        .from('questionnaire_templates')
        .update({ name })
        .eq('id', id)
        .select()
        .single()

      if (templateError) {
        return {
          data: null,
          error: createError('DB_ERROR', templateError.message, templateError),
        }
      }

      // Delete existing questions
      await supabase.from('questions').delete().eq('questionnaire_id', id)

      // Insert new questions
      if (questionTexts.length > 0) {
        const questions: QuestionInsert[] = questionTexts.map((text, index) => ({
          questionnaire_id: id,
          question_text: text,
          order_index: index,
        }))

        const { error: questionsError } = await supabase
          .from('questions')
          .insert(questions)

        if (questionsError) {
          return {
            data: null,
            error: createError('DB_ERROR', questionsError.message, questionsError),
          }
        }
      }

      return { data: template, error: null }
    } catch (err) {
      return {
        data: null,
        error: createError('UNEXPECTED_ERROR', 'An unexpected error occurred', err),
      }
    }
  },

  /**
   * Delete a questionnaire template (cascades to questions)
   */
  async delete(id: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await supabase
        .from('questionnaire_templates')
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
}

export default {
  contracts: contractTemplatesService,
  questionnaires: questionnaireTemplatesService,
}

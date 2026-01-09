/**
 * useTemplates Hook
 * 
 * Provides template data and operations for React components.
 * 
 * @example
 * ```tsx
 * 'use client'
 * import { useContractTemplates, useQuestionnaireTemplates } from '@/hooks/use-templates'
 * 
 * export function TemplatesList() {
 *   const { templates: contracts } = useContractTemplates()
 *   const { templates: questionnaires } = useQuestionnaireTemplates()
 * 
 *   return (
 *     <>
 *       <h2>Contracts</h2>
 *       <ul>
 *         {contracts.map(t => <li key={t.id}>{t.name}</li>)}
 *       </ul>
 *       <h2>Questionnaires</h2>
 *       <ul>
 *         {questionnaires.map(t => <li key={t.id}>{t.name}</li>)}
 *       </ul>
 *     </>
 *   )
 * }
 * ```
 */

'use client'

import { useState, useCallback, useEffect } from 'react'
import { contractTemplatesService, questionnaireTemplatesService } from '@/lib/services'
import type {
  ContractTemplate,
  ContractTemplateInsert,
  QuestionnaireTemplate,
  Question,
  QuestionInsert,
} from '@/lib/supabase/database.types'
import type { ServiceError } from '@/lib/services/types'

// ============================================
// Contract Templates Hook
// ============================================

interface UseContractTemplatesReturn {
  templates: ContractTemplate[]
  loading: boolean
  error: ServiceError | null
  refresh: () => Promise<void>
  create: (name: string, file: File) => Promise<ContractTemplate | null>
  remove: (id: string) => Promise<boolean>
}

export function useContractTemplates(): UseContractTemplatesReturn {
  const [templates, setTemplates] = useState<ContractTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ServiceError | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    const result = await contractTemplatesService.list()

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setTemplates(result.data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const create = useCallback(
    async (name: string, file: File) => {
      setLoading(true)
      setError(null)

      const result = await contractTemplatesService.create(name, file)

      if (result.error) {
        setError(result.error)
        setLoading(false)
        return null
      }

      await refresh()
      return result.data
    },
    [refresh]
  )

  const remove = useCallback(
    async (id: string) => {
      setLoading(true)
      setError(null)

      const result = await contractTemplatesService.delete(id)

      if (result.error) {
        setError(result.error)
        setLoading(false)
        return false
      }

      await refresh()
      return true
    },
    [refresh]
  )

  return { templates, loading, error, refresh, create, remove }
}

// ============================================
// Questionnaire Templates Hook
// ============================================

type QuestionnaireWithQuestions = QuestionnaireTemplate & { questions: Question[] }

interface UseQuestionnaireTemplatesReturn {
  templates: QuestionnaireWithQuestions[]
  loading: boolean
  error: ServiceError | null
  refresh: () => Promise<void>
  create: (name: string, questions: string[]) => Promise<QuestionnaireTemplate | null>
  update: (
    id: string,
    name: string,
    questionTexts: string[]
  ) => Promise<QuestionnaireTemplate | null>
  remove: (id: string) => Promise<boolean>
}

export function useQuestionnaireTemplates(): UseQuestionnaireTemplatesReturn {
  const [templates, setTemplates] = useState<QuestionnaireWithQuestions[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ServiceError | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    const result = await questionnaireTemplatesService.list()

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setTemplates(result.data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const create = useCallback(
    async (name: string, questions: string[]) => {
      setLoading(true)
      setError(null)

      const result = await questionnaireTemplatesService.create(name, questions)

      if (result.error) {
        setError(result.error)
        setLoading(false)
        return null
      }

      await refresh()
      return result.data
    },
    [refresh]
  )

  const update = useCallback(
    async (id: string, name: string, questionTexts: string[]) => {
      setLoading(true)
      setError(null)

      const result = await questionnaireTemplatesService.update(id, name, questionTexts)

      if (result.error) {
        setError(result.error)
        setLoading(false)
        return null
      }

      await refresh()
      return result.data
    },
    [refresh]
  )

  const remove = useCallback(
    async (id: string) => {
      setLoading(true)
      setError(null)

      const result = await questionnaireTemplatesService.delete(id)

      if (result.error) {
        setError(result.error)
        setLoading(false)
        return false
      }

      await refresh()
      return true
    },
    [refresh]
  )

  return { templates, loading, error, refresh, create, update, remove }
}

// ============================================
// Single Template Hook
// ============================================

interface UseQuestionnaireReturn {
  questionnaire: QuestionnaireWithQuestions | null
  loading: boolean
  error: ServiceError | null
  refresh: () => Promise<void>
}

export function useQuestionnaire(id: string): UseQuestionnaireReturn {
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireWithQuestions | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ServiceError | null>(null)

  const refresh = useCallback(async () => {
    if (!id) {
      setQuestionnaire(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const result = await questionnaireTemplatesService.getById(id)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setQuestionnaire(result.data)
    setLoading(false)
  }, [id])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { questionnaire, loading, error, refresh }
}

export default { useContractTemplates, useQuestionnaireTemplates, useQuestionnaire }

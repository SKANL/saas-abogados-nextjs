/**
 * usePortal Hook
 * 
 * Provides portal functionality for the client-facing interface.
 * 
 * @example
 * ```tsx
 * 'use client'
 * import { usePortal } from '@/hooks/use-portal'
 * 
 * export function PortalPage({ token }: { token: string }) {
 *   const { client, loading, signContract, submitAnswers, uploadDocument, complete } = usePortal(token)
 * 
 *   if (loading) return <div>Loading...</div>
 *   if (!client) return <div>Invalid link</div>
 * 
 *   return <div>Welcome, {client.client_name}</div>
 * }
 * ```
 */

'use client'

import { useState, useCallback, useEffect } from 'react'
import { portalService, documentsService, answersService } from '@/lib/services'
import type { ClientWithDetails, ClientAnswerInsert } from '@/lib/supabase/database.types'
import type { ServiceError } from '@/lib/services/types'

interface UsePortalReturn {
  client: ClientWithDetails | null
  loading: boolean
  error: ServiceError | null
  isExpired: boolean
  isRevoked: boolean
  refresh: () => Promise<void>
  signContract: (typedName: string) => Promise<boolean>
  submitAnswers: (answers: { questionId: string; answerText: string }[]) => Promise<boolean>
  uploadDocument: (file: File, documentType: string) => Promise<boolean>
  complete: () => Promise<boolean>
}

export function usePortal(token: string): UsePortalReturn {
  const [client, setClient] = useState<ClientWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ServiceError | null>(null)
  const [isExpired, setIsExpired] = useState(false)
  const [isRevoked, setIsRevoked] = useState(false)

  const refresh = useCallback(async () => {
    if (!token) {
      setClient(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    setIsExpired(false)
    setIsRevoked(false)

    const result = await portalService.getClientByToken(token)

    if (result.error) {
      if (result.error.code === 'INVALID_LINK') {
        if (result.error.message.includes('expired')) {
          setIsExpired(true)
        } else if (result.error.message.includes('revoked')) {
          setIsRevoked(true)
        }
      }
      setError(result.error)
      setLoading(false)
      return
    }

    setClient(result.data)
    setLoading(false)
  }, [token])

  useEffect(() => {
    refresh()
  }, [refresh])

  const signContract = useCallback(
    async (typedName: string) => {
      if (!client) return false

      setLoading(true)
      setError(null)

      const result = await portalService.signContract(client.id, { typed_name: typedName })

      if (result.error) {
        setError(result.error)
        setLoading(false)
        return false
      }

      await refresh()
      return true
    },
    [client, refresh]
  )

  const submitAnswers = useCallback(
    async (answers: { questionId: string; answerText: string }[]) => {
      if (!client) return false

      setLoading(true)
      setError(null)

      const formattedAnswers: ClientAnswerInsert[] = answers.map((a) => ({
        client_id: client.id,
        question_id: a.questionId,
        answer_text: a.answerText,
      }))

      const result = await answersService.submit(formattedAnswers)

      if (result.error) {
        setError(result.error)
        setLoading(false)
        return false
      }

      await refresh()
      return true
    },
    [client, refresh]
  )

  const uploadDocument = useCallback(
    async (file: File, documentType: string) => {
      if (!client) return false

      setLoading(true)
      setError(null)

      const result = await documentsService.upload(client.id, file, documentType)

      if (result.error) {
        setError(result.error)
        setLoading(false)
        return false
      }

      await refresh()
      return true
    },
    [client, refresh]
  )

  const complete = useCallback(async () => {
    if (!client) return false

    setLoading(true)
    setError(null)

    const result = await portalService.completePortal(client.id)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return false
    }

    await refresh()
    return true
  }, [client, refresh])

  return {
    client,
    loading,
    error,
    isExpired,
    isRevoked,
    refresh,
    signContract,
    submitAnswers,
    uploadDocument,
    complete,
  }
}

export default usePortal

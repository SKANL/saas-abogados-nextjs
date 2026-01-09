/**
 * useClients Hook
 * 
 * Provides client data and operations for React components.
 * 
 * @example
 * ```tsx
 * 'use client'
 * import { useClients } from '@/hooks/use-clients'
 * 
 * export function ClientsList() {
 *   const { clients, loading, refresh } = useClients()
 * 
 *   if (loading) return <div>Loading...</div>
 * 
 *   return (
 *     <ul>
 *       {clients.map(client => (
 *         <li key={client.id}>{client.client_name}</li>
 *       ))}
 *     </ul>
 *   )
 * }
 * ```
 */

'use client'

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { clientsService } from '@/lib/services'
import type { Client, ClientCreateInput, ClientUpdate, ClientWithDetails } from '@/lib/supabase/database.types'
import type { ServiceError, PaginationOptions } from '@/lib/services/types'

interface UseClientsReturn {
  clients: Client[]
  loading: boolean
  error: ServiceError | null
  page: number
  totalPages: number
  total: number
  refresh: () => Promise<void>
  nextPage: () => void
  prevPage: () => void
  setPage: (page: number) => void
  create: (data: ClientCreateInput) => Promise<Client | null>
  update: (id: string, data: ClientUpdate) => Promise<Client | null>
  remove: (id: string) => Promise<boolean>
}

interface UseClientReturn {
  client: ClientWithDetails | null
  loading: boolean
  error: ServiceError | null
  refresh: () => Promise<void>
}

interface UseDashboardStatsReturn {
  stats: {
    total: number
    pending: number
    completed: number
    recentActivity: Client[]
  } | null
  loading: boolean
  error: ServiceError | null
  refresh: () => Promise<void>
}

/**
 * Hook for managing a list of clients with pagination
 */
export function useClients(options: PaginationOptions = {}): UseClientsReturn {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ServiceError | null>(null)
  const [page, setPage] = useState(options.page ?? 1)
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)

  // Stabilize options to prevent infinite re-renders
  const pageSize = options.pageSize
  const orderBy = options.orderBy
  const orderDirection = options.orderDirection
  
  // Track if initial load has completed
  const hasLoaded = useRef(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    const result = await clientsService.list({ 
      page, 
      pageSize, 
      orderBy, 
      orderDirection 
    })

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setClients(result.data ?? [])
    setTotalPages(result.totalPages)
    setTotal(result.count ?? 0)
    setLoading(false)
    hasLoaded.current = true
  }, [page, pageSize, orderBy, orderDirection])

  useEffect(() => {
    refresh()
  }, [refresh])

  const nextPage = useCallback(() => {
    if (page < totalPages) {
      setPage(p => p + 1)
    }
  }, [page, totalPages])

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(p => p - 1)
    }
  }, [page])

  const create = useCallback(async (data: ClientCreateInput) => {
    setLoading(true)
    setError(null)

    const result = await clientsService.create(data)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return null
    }

    await refresh()
    return result.data
  }, [refresh])

  const update = useCallback(async (id: string, data: ClientUpdate) => {
    setLoading(true)
    setError(null)

    const result = await clientsService.update(id, data)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return null
    }

    await refresh()
    return result.data
  }, [refresh])

  const remove = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    const result = await clientsService.softDelete(id)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return false
    }

    await refresh()
    return true
  }, [refresh])

  return {
    clients,
    loading,
    error,
    page,
    totalPages,
    total,
    refresh,
    nextPage,
    prevPage,
    setPage,
    create,
    update,
    remove,
  }
}

/**
 * Hook for fetching a single client with details
 */
export function useClient(clientId: string): UseClientReturn {
  const [client, setClient] = useState<ClientWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ServiceError | null>(null)

  const refresh = useCallback(async () => {
    if (!clientId) {
      setClient(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const result = await clientsService.getById(clientId)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setClient(result.data)
    setLoading(false)
  }, [clientId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { client, loading, error, refresh }
}

/**
 * Hook for dashboard statistics
 */
export function useDashboardStats(): UseDashboardStatsReturn {
  const [stats, setStats] = useState<{
    total: number
    pending: number
    completed: number
    recentActivity: Client[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ServiceError | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    const result = await clientsService.getDashboardStats()

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setStats(result.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { stats, loading, error, refresh }
}

export default useClients

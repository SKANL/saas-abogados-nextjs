/**
 * useRealtime Hook
 * 
 * Provides real-time subscriptions for data updates.
 * 
 * @example
 * ```tsx
 * 'use client'
 * import { useRealtimeClients } from '@/hooks/use-realtime'
 * 
 * export function LiveClientsList() {
 *   const { clients, loading } = useRealtimeClients()
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

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Client } from '@/lib/supabase/database.types'

type RealtimeChannel = ReturnType<typeof supabase.channel>

interface RealtimePayload<T> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: T
  old: T
}

interface UseRealtimeClientsReturn {
  clients: Client[]
  loading: boolean
  error: Error | null
}

/**
 * Hook for real-time client updates
 */
export function useRealtimeClients(): UseRealtimeClientsReturn {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let channel: RealtimeChannel

    async function setupRealtime() {
      try {
        // Initial fetch
        const { data, error: fetchError } = await supabase
          .from('clients')
          .select('*')
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError
        setClients(data ?? [])
        setLoading(false)

        // Subscribe to changes
        channel = supabase
          .channel('clients-changes')
          .on(
            'postgres_changes' as any,
            {
              event: '*',
              schema: 'public',
              table: 'clients',
            } as any,
            (payload: RealtimePayload<Client>) => {
              if (payload.eventType === 'INSERT') {
                setClients((prev) => [payload.new as Client, ...prev])
              } else if (payload.eventType === 'UPDATE') {
                setClients((prev) =>
                  prev.map((c) =>
                    c.id === (payload.new as Client).id ? (payload.new as Client) : c
                  )
                )
              } else if (payload.eventType === 'DELETE') {
                setClients((prev) =>
                  prev.filter((c) => c.id !== (payload.old as Client).id)
                )
              }
            }
          )
          .subscribe()
      } catch (err) {
        setError(err as Error)
        setLoading(false)
      }
    }

    setupRealtime()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  return { clients, loading, error }
}

/**
 * Generic realtime hook for any table
 * 
 * Note: For production use, prefer creating specific typed hooks
 * like useRealtimeClients to avoid type issues
 */
export function useRealtimeTable<T extends { id: string }>(
  tableName: string,
  options: {
    orderBy?: string
    orderDirection?: 'asc' | 'desc'
    filter?: { column: string; value: unknown }
  } = {}
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const { orderBy = 'created_at', orderDirection = 'desc', filter } = options

  useEffect(() => {
    let channel: RealtimeChannel

    async function setupRealtime() {
      try {
        // Build query with any to bypass type checking for generic table names
        let query = (supabase as any).from(tableName).select('*')

        if (filter) {
          query = query.eq(filter.column, filter.value as any)
        }

        query = query.order(orderBy, { ascending: orderDirection === 'asc' })

        const { data: fetchedData, error: fetchError } = await query

        if (fetchError) throw fetchError
        setData(fetchedData ?? [])
        setLoading(false)

        // Subscribe to changes
        channel = supabase
          .channel(`${tableName}-changes`)
          .on(
            'postgres_changes' as any,
            {
              event: '*',
              schema: 'public',
              table: tableName,
            },
            (payload: RealtimePayload<T>) => {
              // Apply filter if set
              if (filter && payload.new) {
                const newRecord = payload.new as Record<string, unknown>
                if (newRecord[filter.column] !== filter.value) {
                  return
                }
              }

              if (payload.eventType === 'INSERT') {
                setData((prev) => [payload.new as T, ...prev])
              } else if (payload.eventType === 'UPDATE') {
                setData((prev) =>
                  prev.map((item) =>
                    item.id === (payload.new as T).id ? (payload.new as T) : item
                  )
                )
              } else if (payload.eventType === 'DELETE') {
                setData((prev) =>
                  prev.filter((item) => item.id !== (payload.old as T).id)
                )
              }
            }
          )
          .subscribe()
      } catch (err) {
        setError(err as Error)
        setLoading(false)
      }
    }

    setupRealtime()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [tableName, orderBy, orderDirection, filter])

  const refresh = useCallback(async () => {
    setLoading(true)
    let query = (supabase as any).from(tableName).select('*')

    if (filter) {
      query = query.eq(filter.column, filter.value as any)
    }

    query = query.order(orderBy, { ascending: orderDirection === 'asc' })

    const { data: fetchedData, error: fetchError } = await query

    if (fetchError) {
      setError(fetchError)
    } else {
      setData(fetchedData ?? [])
    }
    setLoading(false)
  }, [tableName, orderBy, orderDirection, filter])

  return { data, loading, error, refresh }
}

export default { useRealtimeClients, useRealtimeTable }

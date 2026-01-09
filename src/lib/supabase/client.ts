/**
 * Supabase Client - Browser Side
 * 
 * This client is safe to use in client components.
 * It uses the anon key which respects RLS policies.
 * 
 * @example
 * ```tsx
 * 'use client'
 * import { supabase } from '@/lib/supabase/client'
 * 
 * const { data } = await supabase.from('clients').select('*')
 * ```
 */

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

let client: ReturnType<typeof createBrowserClient<Database>> | null = null

/**
 * Creates a singleton Supabase client for browser use.
 * Uses environment variables for configuration.
 */
export function createClient() {
  if (client) return client

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
      'Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
    )
  }

  client = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
  
  return client
}

/**
 * Direct access to the Supabase client for simple use cases.
 * Prefer using createClient() for more control.
 */
export const supabase = createClient()

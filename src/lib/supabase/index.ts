/**
 * Supabase Module Exports
 * 
 * Re-exports all Supabase utilities for convenient imports.
 * 
 * @example
 * ```tsx
 * // Client-side
 * import { supabase } from '@/lib/supabase'
 * 
 * // Server-side
 * import { createClient, createAdminClient } from '@/lib/supabase/server'
 * ```
 */

// Client-side exports
export { createClient as createBrowserClient, supabase } from './client'

// Types
export type { Database } from './database.types'
export type * from './database.types'

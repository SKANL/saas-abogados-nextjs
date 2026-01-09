/**
 * Next.js Middleware
 * 
 * Handles session refresh and protected routes.
 * 
 * This middleware runs before every request and:
 * 1. Refreshes the Supabase session if it's expired
 * 2. Redirects unauthenticated users from protected routes
 * 3. Redirects authenticated users from auth pages
 */

import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - portal/* (public client portal)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

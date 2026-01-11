/**
 * Next.js Middleware
 * 
 * Handles session refresh, authentication, and role-based routing.
 * 
 * This middleware runs before every request and:
 * 1. Refreshes the Supabase session if it's expired
 * 2. Redirects unauthenticated users from protected routes
 * 3. Redirects authenticated users from auth pages
 * 4. Enforces role-based access control
 * 5. Checks onboarding completion status
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/register-invite',
  '/forgot-password',
  '/reset-password',
  '/terms',
  '/privacy',
]

// Routes that require admin role
const ADMIN_ROUTES = [
  '/admin',
]

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/clients',
  '/templates',
  '/settings',
  '/profile',
]

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const pathname = url.pathname

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/)
  ) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create Supabase client with cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  // Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith('/portal/'))
  
  // If no session and trying to access protected route, redirect to login
  if (!session && !isPublicRoute) {
    const redirectUrl = url.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If session exists, check user profile and role
  if (session) {
    // Get user profile with role and organization
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, status, organization_id, onboarding_completed')
      .eq('user_id', session.user.id)
      .single()

    if (profileError || !profile) {
      // Profile not found, sign out and redirect to login
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/login?error=profile-not-found', request.url))
    }

    // Check if user is suspended
    if (profile.status === 'suspended') {
      if (pathname !== '/account-suspended') {
        return NextResponse.redirect(new URL('/account-suspended', request.url))
      }
    }

    // Check onboarding completion
    if (!profile.onboarding_completed && pathname !== '/onboarding' && !isPublicRoute) {
      // Redirect to onboarding if not completed
      if (!pathname.startsWith('/onboarding')) {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
    }

    // Redirect from onboarding if already completed
    if (profile.onboarding_completed && pathname === '/onboarding') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Role-based routing
    const userRole = profile.role || 'lawyer'

    // Check admin routes
    const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route))
    if (isAdminRoute && userRole !== 'admin' && userRole !== 'super_admin') {
      // Non-admin trying to access admin route
      return NextResponse.redirect(new URL('/dashboard?error=unauthorized', request.url))
    }

    // Redirect authenticated users from auth pages
    if (PUBLIC_ROUTES.includes(pathname) && pathname !== '/' && profile.onboarding_completed) {
      // Determine redirect based on role
      if (userRole === 'admin' || userRole === 'super_admin') {
        return NextResponse.redirect(new URL('/admin', request.url))
      } else {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

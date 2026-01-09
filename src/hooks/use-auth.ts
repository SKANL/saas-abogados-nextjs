/**
 * useAuth Hook
 * 
 * Provides authentication state and methods for React components.
 * 
 * @example
 * ```tsx
 * 'use client'
 * import { useAuth } from '@/hooks/use-auth'
 * 
 * export function LoginForm() {
 *   const { signIn, loading, error } = useAuth()
 * 
 *   const handleSubmit = async (e) => {
 *     e.preventDefault()
 *     await signIn(email, password)
 *   }
 * 
 *   return <form onSubmit={handleSubmit}>...</form>
 * }
 * ```
 */

'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService, profileService } from '@/lib/services'
import type { Profile } from '@/lib/supabase/database.types'
import type { ServiceError } from '@/lib/services/types'

interface User {
  id: string
  email: string
}

interface UseAuthReturn {
  user: User | null
  profile: Profile | null
  loading: boolean
  error: ServiceError | null
  signIn: (email: string, password: string) => Promise<boolean>
  signUp: (email: string, password: string, profileData?: { firm_name?: string }) => Promise<boolean>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<boolean>
  updatePassword: (newPassword: string) => Promise<boolean>
  clearError: () => void
}

export function useAuth(): UseAuthReturn {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ServiceError | null>(null)

  // Load user and profile on mount
  useEffect(() => {
    async function loadUser() {
      setLoading(true)
      const result = await authService.getCurrentUser()
      if (result.data) {
        setUser(result.data)
        // Also load profile
        const profileResult = await profileService.getProfile()
        if (profileResult.data) {
          setProfile(profileResult.data)
        }
      }
      setLoading(false)
    }
    loadUser()
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    const result = await authService.signIn(email, password)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return false
    }

    // Refresh user data
    const userResult = await authService.getCurrentUser()
    if (userResult.data) {
      setUser(userResult.data)
      // Also load profile
      const profileResult = await profileService.getProfile()
      if (profileResult.data) {
        setProfile(profileResult.data)
      }
    }

    setLoading(false)
    router.push('/dashboard')
    router.refresh()
    return true
  }, [router])

  const signUp = useCallback(async (email: string, password: string, profileData?: { firm_name?: string }) => {
    setLoading(true)
    setError(null)

    const result = await authService.signUp(email, password, profileData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return false
    }

    setLoading(false)
    // User needs to verify email
    return true
  }, [])

  const signOut = useCallback(async () => {
    setLoading(true)
    await authService.signOut()
    setUser(null)
    setProfile(null)
    setLoading(false)
    router.push('/login')
    router.refresh()
  }, [router])

  const resetPassword = useCallback(async (email: string) => {
    setLoading(true)
    setError(null)

    const result = await authService.resetPassword(email)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return false
    }

    setLoading(false)
    return true
  }, [])

  const updatePassword = useCallback(async (newPassword: string) => {
    setLoading(true)
    setError(null)

    const result = await authService.updatePassword(newPassword)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return false
    }

    setLoading(false)
    return true
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    user,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    clearError,
  }
}

export default useAuth

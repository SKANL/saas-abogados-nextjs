/**
 * useProfile Hook
 * 
 * Provides user profile data and update methods.
 * 
 * @example
 * ```tsx
 * 'use client'
 * import { useProfile } from '@/hooks/use-profile'
 * 
 * export function ProfileSettings() {
 *   const { profile, loading, updateProfile, uploadLogo } = useProfile()
 * 
 *   return (
 *     <div>
 *       <img src={profile?.firm_logo_url} alt="Logo" />
 *       <h2>{profile?.firm_name}</h2>
 *     </div>
 *   )
 * }
 * ```
 */

'use client'

import { useState, useCallback, useEffect } from 'react'
import { profileService } from '@/lib/services'
import type { Profile, ProfileUpdate } from '@/lib/supabase/database.types'
import type { ServiceError } from '@/lib/services/types'

interface UseProfileReturn {
  profile: Profile | null
  loading: boolean
  error: ServiceError | null
  refresh: () => Promise<void>
  updateProfile: (data: ProfileUpdate) => Promise<Profile | null>
  uploadLogo: (file: File) => Promise<string | null>
}

export function useProfile(): UseProfileReturn {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ServiceError | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    const result = await profileService.getProfile()

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setProfile(result.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const updateProfile = useCallback(
    async (data: ProfileUpdate) => {
      setLoading(true)
      setError(null)

      const result = await profileService.updateProfile(data)

      if (result.error) {
        setError(result.error)
        setLoading(false)
        return null
      }

      setProfile(result.data)
      setLoading(false)
      return result.data
    },
    []
  )

  const uploadLogo = useCallback(
    async (file: File) => {
      setLoading(true)
      setError(null)

      const result = await profileService.uploadLogo(file)

      if (result.error) {
        setError(result.error)
        setLoading(false)
        return null
      }

      // Refresh profile to get updated logo URL
      await refresh()
      return result.data?.url ?? null
    },
    [refresh]
  )

  return { profile, loading, error, refresh, updateProfile, uploadLogo }
}

export default useProfile

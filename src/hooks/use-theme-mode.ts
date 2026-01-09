'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { profileService } from '@/lib/services'

type ThemeMode = 'light' | 'dark'

interface UseThemeModeReturn {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => Promise<void>
  loading: boolean
}

/**
 * Hook para manejar el tema del usuario
 * Lee de la base de datos y permite cambiar la preferencia
 */
export function useThemeMode(): UseThemeModeReturn {
  const { profile } = useAuth()
  const [theme, setThemeState] = useState<ThemeMode>('light')
  const [loading, setLoading] = useState(true)

  // Cargar tema inicial
  useEffect(() => {
    if (profile?.theme_mode) {
      setThemeState(profile.theme_mode as ThemeMode)
      applyTheme(profile.theme_mode as ThemeMode)
    }
    setLoading(false)
  }, [profile?.theme_mode])

  // Aplicar tema al documento
  const applyTheme = useCallback((newTheme: ThemeMode) => {
    const root = document.documentElement
    
    if (newTheme === 'dark') {
      root.classList.add('dark')
      root.style.colorScheme = 'dark'
    } else {
      root.classList.remove('dark')
      root.style.colorScheme = 'light'
    }
    
    setThemeState(newTheme)
  }, [])

  // Cambiar tema
  const setTheme = useCallback(async (newTheme: ThemeMode) => {
    try {
      setLoading(true)
      
      // Aplicar tema localmente primero (UX rápido)
      applyTheme(newTheme)
      
      // Guardar en base de datos
      const result = await profileService.updateProfile({
        theme_mode: newTheme,
      })
      
      if (result.error) {
        console.error('Error updating theme:', result.error)
        // Revertir al tema anterior en caso de error
        applyTheme(theme)
      }
    } catch (err) {
      console.error('Error setting theme:', err)
      // Revertir al tema anterior
      applyTheme(theme)
    } finally {
      setLoading(false)
    }
  }, [theme, applyTheme])

  return { theme, setTheme, loading }
}

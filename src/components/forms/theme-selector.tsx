'use client'

import React, { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
} from '@/components/ui/form'

interface ThemeSelectorProps {
  value: string
  onValueChange: (value: string) => void
}

export function ThemeSelector({ value, onValueChange }: ThemeSelectorProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleChange = async (newTheme: string) => {
    onValueChange(newTheme)
    
    // Apply theme change immediately
    if (mounted && typeof window !== 'undefined') {
      try {
        // Dynamically import and call the theme setter
        const response = await fetch('/api/preferences/theme', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ theme: newTheme }),
        })
        
        if (response.ok) {
          // Apply theme locally
          const root = document.documentElement
          if (newTheme === 'dark') {
            root.classList.add('dark')
            root.style.colorScheme = 'dark'
          } else {
            root.classList.remove('dark')
            root.style.colorScheme = 'light'
          }
        }
      } catch (error) {
        console.error('Error updating theme:', error)
      }
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <FormItem>
      <FormLabel>Tema</FormLabel>
      <Select onValueChange={handleChange} defaultValue={value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="light">Claro</SelectItem>
          <SelectItem value="dark">Oscuro</SelectItem>
        </SelectContent>
      </Select>
      <FormDescription>
        Selecciona el tema de color de la aplicación
      </FormDescription>
    </FormItem>
  )
}

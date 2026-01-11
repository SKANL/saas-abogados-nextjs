'use client'

import { useEffect, useState, Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import type { RegisterWithInvitationData } from '@/lib/types/auth'

const registerWithInvitationSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  fullName: z.string().min(2, 'El nombre completo es requerido'),
  licenseNumber: z.string().optional(),
  phone: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos'),
  invitationToken: z.string().min(1, 'Token inválido'),
})

type RegisterWithInvitationFormData = z.infer<typeof registerWithInvitationSchema>

function RegisterInviteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [invitationData, setInvitationData] = useState<{
    email: string
    organizationName: string
    role: string
  } | null>(null)

  const form = useForm<RegisterWithInvitationFormData>({
    resolver: zodResolver(registerWithInvitationSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
      licenseNumber: '',
      phone: '',
      invitationToken: token || '',
    },
  })

  // Validate invitation token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Token de invitación no proporcionado')
        setIsValidating(false)
        return
      }

      try {
        const response = await fetch(`/api/auth/validate-invitation?token=${token}`)
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Token inválido')
        }

        setInvitationData({
          email: result.email,
          organizationName: result.organizationName,
          role: result.role,
        })

        // Pre-fill email
        form.setValue('email', result.email)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al validar invitación')
      } finally {
        setIsValidating(false)
      }
    }

    validateToken()
  }, [token, form])

  const onSubmit = async (data: RegisterWithInvitationFormData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const registerData: RegisterWithInvitationData = {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        licenseNumber: data.licenseNumber || undefined,
        phone: data.phone,
        invitationToken: data.invitationToken,
      }

      const response = await fetch('/api/auth/register-with-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error en el registro')
      }

      setSuccess(result.message)
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/auth/signin?message=registered-invite')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar usuario')
    } finally {
      setIsLoading(false)
    }
  }

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Spinner className="h-8 w-8" />
              <p className="text-sm text-gray-600">Validando invitación...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !invitationData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Invitación inválida</CardTitle>
              <CardDescription>
                No se pudo validar tu invitación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => router.push('/auth/register')}
                className="w-full"
              >
                Crear cuenta sin invitación
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Sala Cliente
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Has sido invitado a unirte a{' '}
            <span className="font-semibold">{invitationData?.organizationName}</span>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Completa tu registro</CardTitle>
            <CardDescription>
              Crea tu contraseña y completa tu perfil
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6">
                <AlertTitle>¡Éxito!</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Email:</span> {invitationData?.email}
              </p>
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Rol:</span>{' '}
                {invitationData?.role === 'lawyer' ? 'Abogado' : 'Colaborador'}
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Completo</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Juan Pérez García" 
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input 
                          type="tel" 
                          placeholder="+52 55 1234 5678" 
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="licenseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cédula Profesional (opcional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="12345678" 
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Registrando...' : 'Completar registro'}
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link href="/auth/signin" className="text-blue-600 hover:underline font-medium">
                Inicia sesión
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default function RegisterInvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner className="h-8 w-8" />
      </div>
    }>
      <RegisterInviteContent />
    </Suspense>
  )
}

/**
 * Public Registration API Route
 * POST /api/auth/register
 * 
 * Creates a new user with their own organization
 */

import { NextResponse } from 'next/server'
import { registerPublic } from '@/lib/services/registration.service'
import type { RegisterData } from '@/lib/types/auth'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  firmName: z.string().min(2, 'El nombre del despacho es requerido'),
  fullName: z.string().min(2, 'El nombre completo es requerido'),
  licenseNumber: z.string().optional(),
  phone: z.string().min(10, 'El teléfono es requerido'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate input
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      )
    }

    const data: RegisterData = validationResult.data

    // Register user
    const result = await registerPublic(data)

    return NextResponse.json({
      success: true,
      userId: result.user.id,
      organizationId: result.organizationId,
      message: '¡Registro exitoso! Revisa tu email para verificar tu cuenta.',
    })
  } catch (error) {
    console.error('Registration error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Registration failed'
    
    return NextResponse.json(
      { 
        error: errorMessage,
        success: false,
      },
      { status: 500 }
    )
  }
}

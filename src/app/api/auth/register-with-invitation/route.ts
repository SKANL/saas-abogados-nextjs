/**
 * Invitation-based Registration API Route
 * POST /api/auth/register-with-invitation
 * 
 * Creates a new user and joins them to an existing organization
 */

import { NextResponse } from 'next/server'
import { registerWithInvitation } from '@/lib/services/registration.service'
import type { RegisterWithInvitationData } from '@/lib/types/auth'
import { z } from 'zod'

const registerWithInvitationSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  fullName: z.string().min(2, 'El nombre completo es requerido'),
  licenseNumber: z.string().optional(),
  phone: z.string().min(10, 'El teléfono es requerido'),
  invitationToken: z.string().min(1, 'El token de invitación es requerido'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate input
    const validationResult = registerWithInvitationSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      )
    }

    const data: RegisterWithInvitationData = validationResult.data

    // Register user with invitation
    const result = await registerWithInvitation(data)

    return NextResponse.json({
      success: true,
      userId: result.user.id,
      organizationId: result.organizationId,
      message: '¡Registro exitoso! Ya puedes acceder a la plataforma.',
    })
  } catch (error) {
    console.error('Registration with invitation error:', error)
    
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

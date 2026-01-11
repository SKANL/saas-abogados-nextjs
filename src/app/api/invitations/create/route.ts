/**
 * Create Invitation API Route
 * POST /api/invitations/create
 * 
 * Creates a new invitation for a user to join an organization
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createInvitation } from '@/lib/services/invitations.service'
import { z } from 'zod'

const createInvitationSchema = z.object({
  email: z.string().email('Email inválido'),
  role: z.enum(['lawyer', 'collaborator']).describe('El rol debe ser "lawyer" o "collaborator"'),
  emailMatchRequired: z.boolean().optional(),
  expiresInDays: z.number().min(1).max(30).optional(),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Verify authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Get user profile with role and organization
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, organization_id')
      .eq('user_id', session.user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Perfil no encontrado' },
        { status: 404 }
      )
    }

    // Check if user is admin
    if (profile.role !== 'admin' && profile.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'No tienes permisos para crear invitaciones' },
        { status: 403 }
      )
    }

    // Validate request body
    const body = await request.json()
    const validationResult = createInvitationSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Create invitation
    const invitation = await createInvitation({
      email: data.email,
      role: data.role,
      organizationId: profile.organization_id!,
      invitedBy: profile.id,
      emailMatchRequired: data.emailMatchRequired ?? true,
      expiresInDays: data.expiresInDays ?? 7,
    })

    // TODO: Send invitation email
    // await sendInvitationEmail(invitation)

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        invitationToken: invitation.invitation_token,
        expiresAt: invitation.expires_at,
      },
      message: 'Invitación creada exitosamente',
    })
  } catch (error) {
    console.error('Create invitation error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Error al crear invitación'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

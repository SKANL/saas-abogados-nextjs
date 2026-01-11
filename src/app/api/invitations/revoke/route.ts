/**
 * Revoke Invitation API Route
 * POST /api/invitations/revoke
 * 
 * Revokes an invitation
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { revokeInvitation } from '@/lib/services/invitations.service'
import { z } from 'zod'

const revokeInvitationSchema = z.object({
  invitationId: z.string().uuid('ID de invitación inválido'),
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
        { error: 'No tienes permisos para revocar invitaciones' },
        { status: 403 }
      )
    }

    // Validate request body
    const body = await request.json()
    const validationResult = revokeInvitationSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      )
    }

    const { invitationId } = validationResult.data

    // Verify invitation belongs to user's organization
    const { data: invitation, error: invitationError } = await supabase
      .from('invitations')
      .select('id, organization_id')
      .eq('id', invitationId)
      .single()

    if (invitationError || !invitation) {
      return NextResponse.json(
        { error: 'Invitación no encontrada' },
        { status: 404 }
      )
    }

    if (invitation.organization_id !== profile.organization_id) {
      return NextResponse.json(
        { error: 'No tienes permisos para revocar esta invitación' },
        { status: 403 }
      )
    }

    // Revoke invitation
    await revokeInvitation(invitationId)

    return NextResponse.json({
      success: true,
      message: 'Invitación revocada exitosamente',
    })
  } catch (error) {
    console.error('Revoke invitation error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Error al revocar invitación'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

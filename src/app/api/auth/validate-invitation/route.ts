/**
 * Validate Invitation Token API Route
 * GET /api/auth/validate-invitation?token={token}
 * 
 * Validates an invitation token and returns invitation details
 */

import { NextResponse } from 'next/server'
import { getInvitationByToken } from '@/lib/services/invitations.service'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token de invitación no proporcionado' },
        { status: 400 }
      )
    }

    const invitation = await getInvitationByToken(token)

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitación no encontrada' },
        { status: 404 }
      )
    }

    // Check if invitation has expired
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'La invitación ha expirado' },
        { status: 410 }
      )
    }

    // Check if invitation was already accepted
    if (invitation.accepted_at) {
      return NextResponse.json(
        { error: 'Esta invitación ya fue utilizada' },
        { status: 410 }
      )
    }

    // Check if invitation was revoked
    if (invitation.revoked_at) {
      return NextResponse.json(
        { error: 'Esta invitación fue revocada' },
        { status: 410 }
      )
    }

    return NextResponse.json({
      email: invitation.email,
      role: invitation.role,
      organizationName: invitation.organization?.name || 'la organización',
      organizationLogo: invitation.organization?.logo_url,
    })
  } catch (error) {
    console.error('Validation error:', error)
    
    return NextResponse.json(
      { error: 'Error al validar la invitación' },
      { status: 500 }
    )
  }
}

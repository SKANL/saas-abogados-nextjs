/**
 * List Invitations API Route
 * GET /api/invitations/list
 * 
 * Lists all invitations for the user's organization
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { listInvitations } from '@/lib/services/invitations.service'

export async function GET(request: Request) {
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
        { error: 'No tienes permisos para ver invitaciones' },
        { status: 403 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const includeAccepted = searchParams.get('includeAccepted') === 'true'
    const includeRevoked = searchParams.get('includeRevoked') === 'true'
    const includeExpired = searchParams.get('includeExpired') === 'true'

    // List invitations
    const invitations = await listInvitations(profile.organization_id!, {
      includeAccepted,
      includeRevoked,
      includeExpired,
    })

    return NextResponse.json({
      success: true,
      invitations,
    })
  } catch (error) {
    console.error('List invitations error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Error al listar invitaciones'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

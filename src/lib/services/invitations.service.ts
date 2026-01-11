/**
 * Invitations Service
 * Handles user invitations to organizations
 */

import { createClient } from '@/lib/supabase/server'
import type { Invitation } from '@/lib/types/auth'

/**
 * Generate a secure random token for invitations
 */
function generateInvitationToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Create a new invitation for a user to join an organization
 */
export async function createInvitation(params: {
  email: string
  role: 'lawyer' | 'collaborator'
  organizationId: string
  invitedBy: string
  emailMatchRequired?: boolean
  expiresInDays?: number
}): Promise<Invitation> {
  const supabase = await createClient()
  
  const {
    email,
    role,
    organizationId,
    invitedBy,
    emailMatchRequired = true,
    expiresInDays = 7,
  } = params

  // Check if user already exists in the organization
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id, email, organization_id')
    .eq('email', email.toLowerCase())
    .eq('organization_id', organizationId)
    .single()

  if (existingProfile) {
    throw new Error('Este usuario ya pertenece a la organización')
  }

  // Check if there's an active invitation
  const { data: existingInvitation } = await supabase
    .from('invitations')
    .select('*')
    .eq('email', email.toLowerCase())
    .eq('organization_id', organizationId)
    .is('accepted_at', null)
    .is('revoked_at', null)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (existingInvitation) {
    throw new Error('Ya existe una invitación activa para este email')
  }

  // Create invitation
  const token = generateInvitationToken()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + expiresInDays)

  const { data: invitation, error } = await supabase
    .from('invitations')
    .insert({
      email: email.toLowerCase(),
      role,
      organization_id: organizationId,
      invited_by: invitedBy,
      invitation_token: token,
      invited_email_match_required: emailMatchRequired,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating invitation:', error)
    throw new Error('Error al crear la invitación')
  }

  return invitation as Invitation
}

/**
 * List all invitations for an organization
 */
export async function listInvitations(
  organizationId: string,
  options: {
    includeAccepted?: boolean
    includeRevoked?: boolean
    includeExpired?: boolean
  } = {}
): Promise<Invitation[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('invitations')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  // Filter by status
  if (!options.includeAccepted) {
    query = query.is('accepted_at', null)
  }
  
  if (!options.includeRevoked) {
    query = query.is('revoked_at', null)
  }

  if (!options.includeExpired) {
    query = query.gt('expires_at', new Date().toISOString())
  }

  const { data: invitations, error } = await query

  if (error) {
    console.error('Error listing invitations:', error)
    throw new Error('Error al listar invitaciones')
  }

  return (invitations || []) as Invitation[]
}

/**
 * Get invitation details by token
 */
export async function getInvitationByToken(token: string): Promise<Invitation | null> {
  const supabase = await createClient()
  
  const { data: invitation, error } = await supabase
    .from('invitations')
    .select(`
      *,
      organization:organizations(
        id,
        name,
        logo_url
      )
    `)
    .eq('invitation_token', token)
    .single()

  if (error) {
    console.error('Error fetching invitation:', error)
    return null
  }

  return invitation as Invitation | null
}

/**
 * Revoke an invitation
 */
export async function revokeInvitation(invitationId: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('invitations')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', invitationId)

  if (error) {
    console.error('Error revoking invitation:', error)
    throw new Error('Error al revocar la invitación')
  }
}

/**
 * Resend an invitation (generates new token and extends expiry)
 */
export async function resendInvitation(invitationId: string): Promise<Invitation> {
  const supabase = await createClient()
  
  // Get current invitation
  const { data: currentInvitation, error: fetchError } = await supabase
    .from('invitations')
    .select('*')
    .eq('id', invitationId)
    .single()

  if (fetchError || !currentInvitation) {
    throw new Error('Invitación no encontrada')
  }

  if (currentInvitation.accepted_at) {
    throw new Error('Esta invitación ya fue aceptada')
  }

  // Generate new token and extend expiry
  const newToken = generateInvitationToken()
  const newExpiresAt = new Date()
  newExpiresAt.setDate(newExpiresAt.getDate() + 7)

  const { data: updatedInvitation, error: updateError } = await supabase
    .from('invitations')
    .update({
      invitation_token: newToken,
      expires_at: newExpiresAt.toISOString(),
      revoked_at: null, // Clear revoked status if any
    })
    .eq('id', invitationId)
    .select()
    .single()

  if (updateError) {
    console.error('Error resending invitation:', updateError)
    throw new Error('Error al reenviar la invitación')
  }

  return updatedInvitation
}

/**
 * Mark invitation as accepted
 */
export async function markInvitationAccepted(invitationId: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('invitations')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invitationId)

  if (error) {
    console.error('Error marking invitation as accepted:', error)
    throw new Error('Error al marcar invitación como aceptada')
  }
}

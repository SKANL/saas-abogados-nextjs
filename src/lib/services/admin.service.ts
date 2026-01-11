/**
 * Admin Service
 * 
 * Handles admin-only operations like:
 * - User management (list, update status, update role)
 * - Organization management
 * - Invitation management
 * - Audit logs
 */

import { createClient } from '@/lib/supabase/client'
import type { 
  Profile, 
  Organization, 
  Invitation, 
  InvitationInsert,
  ProfileUpdate 
} from '@/lib/supabase/database.types'

export type UserWithOrganization = Profile & {
  organization: Organization | null
  clients_count?: number
}

export type InvitationWithOrganization = Invitation & {
  organization: Organization | null
  invited_by_profile: Profile | null
}

/**
 * List all users in the admin's organization
 */
export async function listOrganizationUsers(): Promise<UserWithOrganization[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      organization:organizations(*)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch users: ${error.message}`)
  }

  // Get clients count for each user
  const usersWithCounts = await Promise.all(
    (data || []).map(async (user) => {
      const { count } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.user_id)

      return {
        ...user,
        clients_count: count || 0
      }
    })
  )

  return usersWithCounts as UserWithOrganization[]
}

/**
 * Get a single user by ID with organization details
 */
export async function getUserById(userId: string): Promise<UserWithOrganization | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      organization:organizations(*)
    `)
    .eq('user_id', userId)
    .single()

  if (error) {
    throw new Error(`Failed to fetch user: ${error.message}`)
  }

  // Get clients count
  const { count } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  return {
    ...data,
    clients_count: count || 0
  } as UserWithOrganization
}

/**
 * Update user status (active, suspended, pending)
 */
export async function updateUserStatus(
  userId: string, 
  status: 'active' | 'suspended' | 'pending'
): Promise<Profile> {
  const supabase = createClient()

  const updateData: ProfileUpdate = {
    status,
    updated_at: new Date().toISOString()
  }

  // If approving, set approved_at and approved_by
  if (status === 'active') {
    const { data: { user } } = await supabase.auth.getUser()
    updateData.approved_at = new Date().toISOString()
    updateData.approved_by = user?.id || null
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update user status: ${error.message}`)
  }

  return data as Profile
}

/**
 * Update user role (lawyer, admin, super_admin)
 */
export async function updateUserRole(
  userId: string, 
  role: 'lawyer' | 'admin' | 'super_admin'
): Promise<Profile> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('profiles')
    .update({ 
      role,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update user role: ${error.message}`)
  }

  // Force session refresh to update JWT claims
  await supabase.auth.refreshSession()

  return data as Profile
}

/**
 * List all invitations for the admin's organization
 */
export async function listInvitations(): Promise<InvitationWithOrganization[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('invitations')
    .select(`
      *,
      organization:organizations(*)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch invitations: ${error.message}`)
  }

  return data as any as InvitationWithOrganization[]
}

/**
 * Create a new invitation
 */
export async function createInvitation(
  email: string,
  role: 'lawyer' | 'admin',
  organizationId: string
): Promise<Invitation> {
  const supabase = createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('User not authenticated')
  }

  // Generate invitation token
  const token = crypto.randomUUID()

  // Set expiration (7 days from now)
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  const invitationData: InvitationInsert = {
    email,
    role,
    organization_id: organizationId,
    invited_by: user.id,
    invitation_token: token,
    invited_email_match_required: true,
    expires_at: expiresAt.toISOString()
  }

  const { data, error } = await supabase
    .from('invitations')
    .insert(invitationData)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create invitation: ${error.message}`)
  }

  return data as Invitation
}

/**
 * Revoke an invitation
 */
export async function revokeInvitation(invitationId: string): Promise<Invitation> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('invitations')
    .update({ 
      revoked_at: new Date().toISOString() 
    })
    .eq('id', invitationId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to revoke invitation: ${error.message}`)
  }

  return data as Invitation
}

/**
 * Resend an invitation (create a new token for the same email)
 */
export async function resendInvitation(invitationId: string): Promise<Invitation> {
  const supabase = createClient()

  // Get the old invitation
  const { data: oldInvitation, error: fetchError } = await supabase
    .from('invitations')
    .select('*')
    .eq('id', invitationId)
    .single()

  if (fetchError || !oldInvitation) {
    throw new Error('Invitation not found')
  }

  // Revoke the old one
  await revokeInvitation(invitationId)

  // Create a new one
  return createInvitation(
    oldInvitation.email,
    oldInvitation.role as 'lawyer' | 'admin',
    oldInvitation.organization_id!
  )
}

/**
 * Get current user's organization
 */
export async function getMyOrganization(): Promise<Organization | null> {
  const supabase = createClient()

  // Get current user profile
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return null
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  if (profileError || !profile?.organization_id) {
    return null
  }

  const { data: organization, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', profile.organization_id)
    .single()

  if (orgError) {
    throw new Error(`Failed to fetch organization: ${orgError.message}`)
  }

  return organization as Organization
}

/**
 * Update organization details
 */
export async function updateOrganization(
  organizationId: string,
  updates: Partial<Organization>
): Promise<Organization> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('organizations')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', organizationId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update organization: ${error.message}`)
  }

  return data as Organization
}

/**
 * Get organization usage statistics
 */
export async function getOrganizationStats(organizationId: string) {
  const supabase = createClient()

  // Count lawyers
  const { count: lawyersCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)

  // Count clients (all clients from all lawyers in the org)
  const { count: clientsCount } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)

  // Calculate storage used (simplified - just count documents)
  const { count: documentsCount } = await supabase
    .from('client_documents')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', supabase
      .from('clients')
      .select('id')
      .eq('organization_id', organizationId) as any
    )

  // Estimate storage (100KB per document average)
  const storageUsedMB = Math.round((documentsCount || 0) * 0.1)

  return {
    lawyers_count: lawyersCount || 0,
    clients_count: clientsCount || 0,
    storage_used_mb: storageUsedMB,
  }
}

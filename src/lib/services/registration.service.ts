/**
 * Registration Service
 * Handles public registration and invitation-based registration
 * Based on ADMIN_LAWYER_FLOW_PROPOSAL.md v4.0
 */

import { createClient } from '@/lib/supabase/server'
import type { RegisterData, RegisterWithInvitationData, UserProfile, Organization } from '@/lib/types/auth'

/**
 * Helper function to generate unique slugs for organizations
 * Adds numeric suffix if slug already exists
 */
async function generateUniqueSlug(firmName: string): Promise<string> {
  const supabase = await createClient()
  
  // Simple slugify function
  const slugify = (text: string): string => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-')         // Replace multiple - with single -
      .replace(/^-+/, '')             // Trim - from start of text
      .replace(/-+$/, '')             // Trim - from end of text
  }
  
  let baseSlug = slugify(firmName)
  let slug = baseSlug
  let counter = 1
  
  while (true) {
    const { count } = await supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true })
      .eq('slug', slug)
    
    if (count === 0) break // Slug disponible
    
    slug = `${baseSlug}-${counter}` // perez-abogados-2
    counter++
  }
  
  return slug
}

/**
 * Register a new user with public registration
 * ALWAYS creates a new organization (security: prevents slug collision attacks)
 */
export async function registerPublic(data: RegisterData) {
  const supabase = await createClient()
  
  // 1. Create user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.fullName,
        firm_name: data.firmName,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    }
  })

  if (authError) {
    throw new Error(`Registration failed: ${authError.message}`)
  }

  if (!authData.user) {
    throw new Error('User creation failed')
  }

  // 2. The trigger handle_new_user() automatically creates the profile
  // Wait a moment for the trigger to complete
  await new Promise(resolve => setTimeout(resolve, 500))

  // 3. ✅ SECURITY: Always create NEW organization (never search by slug)
  const slug = await generateUniqueSlug(data.firmName)

  const { data: newOrg, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name: data.firmName,
      slug: slug,
      owner_id: authData.user.id,
    })
    .select('id')
    .single()

  if (orgError) {
    throw new Error(`Organization creation failed: ${orgError.message}`)
  }

  // 4. Update profile with additional data and assign admin role
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      full_name: data.fullName,
      license_number: data.licenseNumber || null,
      phone: data.phone,
      organization_id: newOrg.id,
      role: 'admin', // ✅ First user of public registration = Admin of their own org
      status: 'active', // ✅ Always active (no approval needed)
      subscription_plan: 'free',
      onboarding_completed: false,
      last_login_at: new Date().toISOString(),
    })
    .eq('user_id', authData.user.id)

  if (profileError) {
    throw new Error(`Profile update failed: ${profileError.message}`)
  }

  return {
    user: authData.user,
    organizationId: newOrg.id,
  }
}

/**
 * Register a new user via invitation token
 * Joins existing organization
 */
export async function registerWithInvitation(data: RegisterWithInvitationData) {
  const supabase = await createClient()
  
  // 1. Validate invitation token first
  const { data: invitation, error: inviteError } = await supabase
    .from('invitations')
    .select('*')
    .eq('invitation_token', data.invitationToken)
    .is('accepted_at', null)
    .is('revoked_at', null)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (inviteError || !invitation) {
    throw new Error('Invalid or expired invitation token')
  }

  // 2. Validate email match if required
  if (invitation.invited_email_match_required && 
      invitation.email.toLowerCase() !== data.email.toLowerCase()) {
    throw new Error(`This invitation was sent to ${invitation.email}. Please use the correct email address.`)
  }

  // 3. Create user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.fullName,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    }
  })

  if (authError) {
    throw new Error(`Registration failed: ${authError.message}`)
  }

  if (!authData.user) {
    throw new Error('User creation failed')
  }

  // 4. Wait for profile creation
  await new Promise(resolve => setTimeout(resolve, 500))

  // 5. Update profile with invitation data
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      full_name: data.fullName,
      license_number: data.licenseNumber || null,
      phone: data.phone,
      organization_id: invitation.organization_id,
      role: invitation.role, // Role assigned by admin
      status: 'active', // Auto-active for invited users
      subscription_plan: 'free',
      onboarding_completed: false,
      last_login_at: new Date().toISOString(),
      approved_by: invitation.invited_by,
      approved_at: new Date().toISOString(),
    })
    .eq('user_id', authData.user.id)

  if (profileError) {
    throw new Error(`Profile update failed: ${profileError.message}`)
  }

  // 6. Mark invitation as accepted
  await supabase
    .from('invitations')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invitation.id)

  return {
    user: authData.user,
    organizationId: invitation.organization_id,
  }
}

/**
 * Get current user profile with organization data
 */
export async function getCurrentUserProfile(): Promise<{
  profile: UserProfile | null
  organization: Organization | null
}> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { profile: null, organization: null }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  let organization = null
  if (profile?.organization_id) {
    const { data: org } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', profile.organization_id)
      .single()
    
    organization = org
  }

  return { 
    profile: profile as UserProfile | null, 
    organization: organization as Organization | null 
  }
}

/**
 * Update last login timestamp
 */
export async function updateLastLogin(userId: string) {
  const supabase = await createClient()
  
  await supabase
    .from('profiles')
    .update({ last_login_at: new Date().toISOString() })
    .eq('user_id', userId)
}

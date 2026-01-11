/**
 * Authentication and Authorization Types
 * Based on ADMIN_LAWYER_FLOW_PROPOSAL.md v4.0
 */

import type { Database } from '@/lib/supabase/database.types'

// Extract table types from Database
type OrganizationRow = Database['public']['Tables']['organizations']['Row']
type ProfileRow = Database['public']['Tables']['profiles']['Row']
type InvitationRow = Database['public']['Tables']['invitations']['Row']

export type UserRole = 'super_admin' | 'admin' | 'lawyer' | 'collaborator'
export type UserStatus = 'active' | 'suspended' | 'deleted'
export type SubscriptionPlan = 'free' | 'professional' | 'enterprise'

// Use Supabase types directly with some extensions
export type Organization = OrganizationRow

export type UserProfile = ProfileRow

export type Invitation = InvitationRow & {
  organization?: {
    id: string
    name: string
    logo_url: string | null
  } | null
}

export interface RegisterData {
  email: string
  password: string
  firmName: string
  fullName: string
  licenseNumber?: string
  phone: string
}

export interface RegisterWithInvitationData {
  email: string
  password: string
  fullName: string
  licenseNumber?: string
  phone: string
  invitationToken: string
}

export interface CustomJWTClaims {
  user_role?: UserRole
  org_id?: string
}

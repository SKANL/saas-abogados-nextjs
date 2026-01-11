/**
 * GET /api/admin/organization
 * PATCH /api/admin/organization
 * 
 * Get or update the current user's organization
 * Requires admin or super_admin role
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getMyOrganization, updateOrganization, getOrganizationStats } from '@/lib/services/admin.service'
import { z } from 'zod'

const updateOrganizationSchema = z.object({
  name: z.string().min(1).optional(),
  tax_id: z.string().optional(),
  billing_address: z.string().optional(),
  logo_url: z.string().url().optional(),
  primary_color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  secondary_color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
})

export async function GET() {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    if (profile.role !== 'admin' && profile.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Get organization
    const organization = await getMyOrganization()

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Get usage stats
    const stats = await getOrganizationStats(organization.id)

    return NextResponse.json({ 
      organization,
      stats
    })
  } catch (error) {
    console.error('Error fetching organization:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    if (profile.role !== 'admin' && profile.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Get current organization
    const organization = await getMyOrganization()

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Validate request body
    const body = await request.json()
    const validationResult = updateOrganizationSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request body', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      )
    }

    // Update organization
    const updatedOrganization = await updateOrganization(
      organization.id,
      validationResult.data
    )

    return NextResponse.json({ 
      organization: updatedOrganization,
      message: 'Organization updated successfully'
    })
  } catch (error) {
    console.error('Error updating organization:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

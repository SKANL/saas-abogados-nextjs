import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { clientId, linkId } = await request.json()

    if (!clientId || !linkId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Update the client status to completed
    const { error: clientError } = await supabase
      .from('clients')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', clientId)

    if (clientError) {
      console.error('Error updating client status:', clientError)
      return NextResponse.json(
        { error: 'Failed to update client status' },
        { status: 500 }
      )
    }

    // Mark the link as revoked (don't allow re-access after completion)
    const { error: linkError } = await supabase
      .from('client_links')
      .update({
        revoked_at: new Date().toISOString(),
      })
      .eq('id', linkId)

    if (linkError) {
      console.error('Error updating link status:', linkError)
      // Continue anyway - client is marked as completed
    }

    // Log the completion
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'

    await supabase
      .from('audit_logs')
      .insert({
        client_id: clientId,
        action: 'portal_completed',
        details: {
          completed_at: new Date().toISOString(),
          ip_address: clientIp,
        },
      })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in complete endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

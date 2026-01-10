import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { clientId, linkId, signatureData, signedName } = await request.json()

    if (!clientId || !linkId || !signatureData || !signedName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get client IP for audit purposes
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'

    // Generate a simple hash of the signature for verification
    const signatureHash = Buffer.from(signatureData).toString('base64').substring(0, 64)

    // Update the client with signature data
    const { error: updateError } = await supabase
      .from('clients')
      .update({
        signature_data: signatureData,
        signature_timestamp: new Date().toISOString(),
        signature_ip: clientIp,
        signature_hash: signatureHash,
        signed_name: signedName,
      })
      .eq('id', clientId)

    if (updateError) {
      console.error('Error updating client signature:', updateError)
      return NextResponse.json(
        { error: 'Failed to save signature' },
        { status: 500 }
      )
    }

    // Log the signature action
    await supabase
      .from('audit_logs')
      .insert({
        client_id: clientId,
        action: 'signature_completed',
        details: {
          signed_name: signedName,
          signature_hash: signatureHash,
          ip_address: clientIp,
        },
      })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in sign endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

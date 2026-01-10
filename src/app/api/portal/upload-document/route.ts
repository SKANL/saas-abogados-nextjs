import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const clientId = formData.get('clientId') as string
    const linkId = formData.get('linkId') as string
    const documentType = formData.get('documentType') as string
    const file = formData.get('file') as File

    if (!clientId || !linkId || !documentType || !file) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get the user (lawyer) who owns this client
    const { data: client } = await supabase
      .from('clients')
      .select('user_id')
      .eq('id', clientId)
      .single()

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    // Generate a unique file name
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop()
    const fileName = `${client.user_id}/${clientId}/${documentType.replace(/\s+/g, '_')}_${timestamp}.${fileExt}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('firm-assets')
      .upload(`client-documents/${fileName}`, file, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Error uploading file:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      )
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('firm-assets')
      .getPublicUrl(`client-documents/${fileName}`)

    // Create a record in client_documents table
    const { error: dbError } = await supabase
      .from('client_documents')
      .insert({
        client_id: clientId,
        document_type: documentType,
        file_url: urlData.publicUrl,
        file_size_bytes: file.size,
        uploaded_at: new Date().toISOString(),
      })

    if (dbError) {
      console.error('Error saving document record:', dbError)
      // Try to delete the uploaded file since DB insert failed
      await supabase.storage
        .from('firm-assets')
        .remove([`client-documents/${fileName}`])
      
      return NextResponse.json(
        { error: 'Failed to save document record' },
        { status: 500 }
      )
    }

    // Log the upload action
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'

    await supabase
      .from('audit_logs')
      .insert({
        client_id: clientId,
        action: 'document_uploaded',
        details: {
          document_type: documentType,
          file_name: file.name,
          file_size: file.size,
          ip_address: clientIp,
        },
      })

    return NextResponse.json({ 
      success: true,
      fileUrl: urlData.publicUrl,
    })
  } catch (error) {
    console.error('Error in upload-document endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

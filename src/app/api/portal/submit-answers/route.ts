import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { clientId, linkId, answers } = await request.json()

    if (!clientId || !linkId || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Prepare the answers for insertion
    const answersToInsert = answers.map((answer) => ({
      client_id: clientId,
      question_id: answer.questionId,
      answer_text: answer.answer,
    }))

    // Delete any existing answers for this client (in case they're updating)
    const { error: deleteError } = await supabase
      .from('client_answers')
      .delete()
      .eq('client_id', clientId)

    if (deleteError) {
      console.error('Error deleting old answers:', deleteError)
      // Continue anyway - they might not have previous answers
    }

    // Insert the new answers
    const { error: insertError } = await supabase
      .from('client_answers')
      .insert(answersToInsert)

    if (insertError) {
      console.error('Error inserting answers:', insertError)
      return NextResponse.json(
        { error: 'Failed to save answers' },
        { status: 500 }
      )
    }

    // Log the action
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'

    await supabase
      .from('audit_logs')
      .insert({
        client_id: clientId,
        action: 'questionnaire_completed',
        details: {
          answers_count: answers.length,
          ip_address: clientIp,
        },
      })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in submit-answers endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { PortalFlow } from "@/components/portal/portal-flow"
import { PortalHeader } from "@/components/portal/portal-header"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

interface Props {
  params: Promise<{ token: string }>
}

export default async function SalaPage({ params }: Props) {
  const { token } = await params
  const supabase = await createClient()
  
  // Validate token and fetch client data
  const { data: link, error: linkError } = await supabase
    .from('client_links')
    .select(`
      *,
      client:clients(
        *,
        contract_template:contract_templates(*),
        questionnaire_template:questionnaire_templates(
          *,
          questions(*)
        )
      )
    `)
    .eq('magic_link_token', token)
    .single()

  if (linkError || !link || !link.client) {
    redirect('/sala/expirada')
  }

  // Check if link expired
  const expiresAt = new Date(link.expires_at)
  if (expiresAt < new Date()) {
    redirect('/sala/expirada')
  }

  // Check if link was revoked
  if (link.revoked_at) {
    redirect('/sala/expirada')
  }

  const client = link.client

  // Update access count
  await supabase
    .from('client_links')
    .update({
      access_count: (link.access_count || 0) + 1,
      last_accessed_at: new Date().toISOString(),
    })
    .eq('id', link.id)

  // Get user's profile for firm info
  const { data: profile } = await supabase
    .from('profiles')
    .select('firm_name, firm_logo_url')
    .eq('user_id', client.user_id)
    .single()

  // Sort questions by order_index
  const sortedQuestions = (client.questionnaire_template?.questions || []).sort(
    (a: any, b: any) => a.order_index - b.order_index
  )

  // Transform questions to match component interface
  const questions = sortedQuestions.map((q: any) => ({
    id: q.id,
    text: q.question_text,
    type: "textarea" as const,
    required: true,
  }))

  const salaData = {
    clientId: client.id,
    linkId: link.id,
    firmName: profile?.firm_name || "Despacho Jurídico",
    firmLogo: profile?.firm_logo_url || "",
    clientName: client.client_name,
    caseName: client.case_name,
    contractUrl: client.contract_template?.file_url || "",
    contractName: client.contract_template?.name || "",
    documentsRequired: client.required_documents || [],
    questions,
    customMessage: client.custom_message || "",
  }
  
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <PortalHeader 
        firmName={salaData.firmName} 
        firmLogo={salaData.firmLogo} 
      />
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <PortalFlow
            clientId={salaData.clientId}
            linkId={salaData.linkId}
            clientName={salaData.clientName}
            caseName={salaData.caseName}
            contractUrl={salaData.contractUrl}
            contractName={salaData.contractName}
            documentsRequired={salaData.documentsRequired}
            questions={salaData.questions}
            customMessage={salaData.customMessage}
          />
        </div>
      </main>
    </div>
  )
}

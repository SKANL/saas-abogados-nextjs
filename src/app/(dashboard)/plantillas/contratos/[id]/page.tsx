import { ContractViewer } from "@/components/dashboard/contract-viewer"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

interface Props {
  params: Promise<{ id: string }>
}

export default async function VerContratoPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: contract, error } = await supabase
    .from('contract_templates')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !contract) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <ContractViewer
        id={contract.id}
        name={contract.name}
        createdAt={contract.created_at || ""}
        fileUrl={contract.file_url}
      />
    </div>
  )
}

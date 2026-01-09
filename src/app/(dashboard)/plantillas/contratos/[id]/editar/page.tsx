import { ContractEditForm } from "@/components/forms/contract-edit-form"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarContratoPage({ params }: Props) {
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Editar Plantilla</h1>
        <p className="text-muted-foreground">
          Actualiza la plantilla de contrato
        </p>
      </div>
      <ContractEditForm 
        id={contract.id}
        initialName={contract.name}
        currentFileUrl={contract.file_url}
      />
    </div>
  )
}

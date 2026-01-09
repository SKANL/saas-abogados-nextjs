import { ContractTemplatesTable } from "@/components/dashboard/contract-templates-table"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"

export default function ContratosPage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-2xl font-semibold">Plantillas de Contratos</h1>
          <p className="text-muted-foreground text-sm">
            Gestiona tus plantillas de contratos reutilizables
          </p>
        </div>
      </div>
      <div className="px-4 lg:px-6">
        <ContractTemplatesTable />
      </div>
    </div>
  )
}

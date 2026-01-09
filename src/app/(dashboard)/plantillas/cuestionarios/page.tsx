import { QuestionnaireTemplatesTable } from "@/components/dashboard/questionnaire-templates-table"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"

export default function CuestionariosPage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-2xl font-semibold">Plantillas de Cuestionarios</h1>
          <p className="text-muted-foreground text-sm">
            Gestiona tus plantillas de cuestionarios reutilizables
          </p>
        </div>
      </div>
      <div className="px-4 lg:px-6">
        <QuestionnaireTemplatesTable />
      </div>
    </div>
  )
}

import { QuestionnaireBuilderForm } from "@/components/forms/questionnaire-builder-form"

export default function NuevoCuestionarioPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nuevo Cuestionario</h1>
        <p className="text-muted-foreground">
          Crea un cuestionario personalizado para recopilar información
        </p>
      </div>
      <QuestionnaireBuilderForm />
    </div>
  )
}

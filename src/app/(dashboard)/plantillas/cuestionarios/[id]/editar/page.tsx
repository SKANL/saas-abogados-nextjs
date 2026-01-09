import { QuestionnaireEditForm } from "@/components/forms/questionnaire-edit-form"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarCuestionarioPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: questionnaire, error } = await supabase
    .from('questionnaire_templates')
    .select(`
      *,
      questions(*)
    `)
    .eq('id', id)
    .single()

  if (error || !questionnaire) {
    notFound()
  }

  // Sort questions by order_index
  const sortedQuestions = (questionnaire.questions || []).sort(
    (a: any, b: any) => a.order_index - b.order_index
  )

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Editar Cuestionario</h1>
        <p className="text-muted-foreground">
          Actualiza las preguntas del cuestionario
        </p>
      </div>
      <QuestionnaireEditForm 
        id={questionnaire.id}
        initialName={questionnaire.name}
        initialQuestions={sortedQuestions}
      />
    </div>
  )
}

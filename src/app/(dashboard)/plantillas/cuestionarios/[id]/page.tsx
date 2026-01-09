import { QuestionnaireViewer } from "@/components/dashboard/questionnaire-viewer"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

interface Props {
  params: Promise<{ id: string }>
}

export default async function VerCuestionarioPage({ params }: Props) {
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

  // Transform questions to match component interface
  const questions = sortedQuestions.map((q: any) => ({
    id: q.id,
    text: q.question_text,
    type: "text" as const,
    required: true,
  }))

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <QuestionnaireViewer
        id={questionnaire.id}
        name={questionnaire.name}
        description=""
        createdAt={questionnaire.created_at || ""}
        questions={questions}
      />
    </div>
  )
}

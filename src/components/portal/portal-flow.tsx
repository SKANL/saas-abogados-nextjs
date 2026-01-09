"use client"

import * as React from "react"
import { StepProgress } from "@/components/portal/step-progress"
import { ConsentStep } from "@/components/portal/consent-step"
import { DocumentUploadStep } from "@/components/portal/document-upload-step"
import { QuestionnaireStep } from "@/components/portal/questionnaire-step"
import { CompletionStep } from "@/components/portal/completion-step"
import { Card, CardContent } from "@/components/ui/card"

interface PortalFlowProps {
  clientName: string
  contractContent?: string
  documentsRequired: string[]
  questions?: Array<{
    id: string
    text: string
    type: "text" | "textarea" | "select"
    options?: string[]
    required: boolean
  }>
}

const baseSteps = [
  { id: "consent", title: "Consentimiento" },
  { id: "documents", title: "Documentos" },
  { id: "questionnaire", title: "Cuestionario" },
  { id: "complete", title: "Completado" },
]

export function PortalFlow({
  clientName,
  contractContent,
  documentsRequired,
  questions,
}: PortalFlowProps) {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [uploadedDocs, setUploadedDocs] = React.useState<Record<string, File>>({})
  const [answers, setAnswers] = React.useState<Record<string, string>>({})

  // Build steps based on what's required
  const steps = React.useMemo(() => {
    const activeSteps = [{ id: "consent", title: "Consentimiento" }]
    if (documentsRequired.length > 0) {
      activeSteps.push({ id: "documents", title: "Documentos" })
    }
    if (questions && questions.length > 0) {
      activeSteps.push({ id: "questionnaire", title: "Cuestionario" })
    }
    activeSteps.push({ id: "complete", title: "Completado" })
    return activeSteps
  }, [documentsRequired, questions])

  const currentStepId = steps[currentStep]?.id

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleDocumentUpload = (docName: string, file: File) => {
    setUploadedDocs((prev) => ({ ...prev, [docName]: file }))
  }

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  return (
    <div className="mx-auto max-w-2xl">
      <StepProgress steps={steps} currentStep={currentStep} />
      
      <Card>
        <CardContent className="p-6">
          {currentStepId === "consent" && (
            <ConsentStep
              clientName={clientName}
              contractContent={contractContent}
              onNext={handleNext}
            />
          )}
          
          {currentStepId === "documents" && (
            <DocumentUploadStep
              documentsRequired={documentsRequired}
              uploadedDocs={uploadedDocs}
              onUpload={handleDocumentUpload}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          
          {currentStepId === "questionnaire" && questions && (
            <QuestionnaireStep
              questions={questions}
              answers={answers}
              onAnswerChange={handleAnswerChange}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          
          {currentStepId === "complete" && (
            <CompletionStep clientName={clientName} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

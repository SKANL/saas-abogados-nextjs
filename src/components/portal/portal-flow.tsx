"use client"

import * as React from "react"
import { StepProgress } from "@/components/portal/step-progress"
import { ConsentStep } from "@/components/portal/consent-step"
import { DocumentUploadStep } from "@/components/portal/document-upload-step"
import { QuestionnaireStep } from "@/components/portal/questionnaire-step"
import { CompletionStep } from "@/components/portal/completion-step"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

interface PortalFlowProps {
  clientId: string
  linkId: string
  clientName: string
  caseName: string
  contractUrl?: string
  contractName?: string
  documentsRequired: string[]
  questions?: Array<{
    id: string
    text: string
    type: "text" | "textarea" | "select"
    options?: string[]
    required: boolean
  }>
  customMessage?: string
}

export function PortalFlow({
  clientId,
  linkId,
  clientName,
  caseName,
  contractUrl,
  contractName,
  documentsRequired,
  questions,
  customMessage,
}: PortalFlowProps) {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [uploadedDocs, setUploadedDocs] = React.useState<Record<string, File>>({})
  const [answers, setAnswers] = React.useState<Record<string, string>>({})
  const [signatureData, setSignatureData] = React.useState<string>("")

  // Build steps based on what's required
  const steps = React.useMemo(() => {
    const activeSteps = []
    
    if (contractUrl) {
      activeSteps.push({ id: "consent", title: "Firma de Contrato" })
    }
    
    if (documentsRequired.length > 0) {
      activeSteps.push({ id: "documents", title: "Documentos" })
    }
    
    if (questions && questions.length > 0) {
      activeSteps.push({ id: "questionnaire", title: "Cuestionario" })
    }
    
    activeSteps.push({ id: "complete", title: "Completado" })
    
    return activeSteps
  }, [contractUrl, documentsRequired, questions])

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
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Welcome Message */}
      {customMessage && currentStep === 0 && (
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>{customMessage}</AlertDescription>
        </Alert>
      )}

      {/* Case Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Caso</p>
            <p className="text-lg font-semibold">{caseName}</p>
          </div>
        </CardContent>
      </Card>

      {/* Progress Indicator */}
      <StepProgress steps={steps} currentStep={currentStep} />
      
      {/* Main Content Card */}
      <Card>
        <CardContent className="p-6">
          {currentStepId === "consent" && contractUrl && (
            <ConsentStep
              clientId={clientId}
              linkId={linkId}
              clientName={clientName}
              contractUrl={contractUrl}
              contractName={contractName || "Contrato"}
              onSignature={setSignatureData}
              onNext={handleNext}
            />
          )}
          
          {currentStepId === "documents" && (
            <DocumentUploadStep
              clientId={clientId}
              linkId={linkId}
              documentsRequired={documentsRequired}
              uploadedDocs={uploadedDocs}
              onUpload={handleDocumentUpload}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          
          {currentStepId === "questionnaire" && questions && (
            <QuestionnaireStep
              clientId={clientId}
              linkId={linkId}
              questions={questions}
              answers={answers}
              onAnswerChange={handleAnswerChange}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          
          {currentStepId === "complete" && (
            <CompletionStep 
              clientId={clientId}
              linkId={linkId}
              clientName={clientName} 
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

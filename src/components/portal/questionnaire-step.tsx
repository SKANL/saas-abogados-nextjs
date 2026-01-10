"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface Question {
  id: string
  text: string
  type: "text" | "textarea" | "select"
  options?: string[]
  required: boolean
}

interface QuestionnaireStepProps {
  clientId: string
  linkId: string
  questions: Question[]
  answers: Record<string, string>
  onAnswerChange: (questionId: string, value: string) => void
  onNext: () => void
  onBack: () => void
}

export function QuestionnaireStep({
  clientId,
  linkId,
  questions,
  answers,
  onAnswerChange,
  onNext,
  onBack,
}: QuestionnaireStepProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  
  const requiredQuestions = questions.filter((q) => q.required)
  const allRequiredAnswered = requiredQuestions.every(
    (q) => answers[q.id]?.trim()
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!allRequiredAnswered) {
      toast.error("Por favor responde todas las preguntas requeridas")
      return
    }

    setIsSubmitting(true)

    try {
      // Convert answers object to array format for API
      const answersArray = questions.map((q) => ({
        questionId: q.id,
        answer: answers[q.id] || "",
      }))

      const response = await fetch('/api/portal/submit-answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId,
          linkId,
          answers: answersArray,
        }),
      })

      if (!response.ok) {
        throw new Error('Error al guardar las respuestas')
      }

      toast.success("Respuestas guardadas correctamente")
      onNext()
    } catch (error) {
      console.error("Error submitting answers:", error)
      toast.error("Error al guardar respuestas. Intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Cuestionario</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Por favor completa las siguientes preguntas.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {questions.map((question, index) => (
          <div key={question.id} className="space-y-2">
            <Label htmlFor={question.id}>
              {index + 1}. {question.text}
              {question.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>

            {question.type === "text" && (
              <Input
                id={question.id}
                value={answers[question.id] || ""}
                onChange={(e) => onAnswerChange(question.id, e.target.value)}
                placeholder="Tu respuesta..."
                disabled={isSubmitting}
              />
            )}

            {question.type === "textarea" && (
              <Textarea
                id={question.id}
                value={answers[question.id] || ""}
                onChange={(e) => onAnswerChange(question.id, e.target.value)}
                placeholder="Tu respuesta..."
                className="min-h-[100px]"
                disabled={isSubmitting}
              />
            )}

            {question.type === "select" && question.options && (
              <Select
                value={answers[question.id] || ""}
                onValueChange={(value) => onAnswerChange(question.id, value)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una opción" />
                </SelectTrigger>
                <SelectContent>
                  {question.options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        ))}

        <div className="flex justify-between pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onBack}
            disabled={isSubmitting}
          >
            Atrás
          </Button>
          <Button 
            type="submit" 
            disabled={!allRequiredAnswered || isSubmitting}
            className="min-w-32"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continuar
          </Button>
        </div>
      </form>
    </div>
  )
}

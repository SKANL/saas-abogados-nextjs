"use client"

import * as React from "react"

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

interface Question {
  id: string
  text: string
  type: "text" | "textarea" | "select"
  options?: string[]
  required: boolean
}

interface QuestionnaireStepProps {
  questions: Question[]
  answers: Record<string, string>
  onAnswerChange: (questionId: string, value: string) => void
  onNext: () => void
  onBack: () => void
}

export function QuestionnaireStep({
  questions,
  answers,
  onAnswerChange,
  onNext,
  onBack,
}: QuestionnaireStepProps) {
  const requiredQuestions = questions.filter((q) => q.required)
  const allRequiredAnswered = requiredQuestions.every(
    (q) => answers[q.id]?.trim()
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Save questionnaire data
    console.log("Questionnaire answers:", answers)
    onNext()
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
              />
            )}

            {question.type === "textarea" && (
              <Textarea
                id={question.id}
                value={answers[question.id] || ""}
                onChange={(e) => onAnswerChange(question.id, e.target.value)}
                placeholder="Tu respuesta..."
                className="min-h-[100px]"
              />
            )}

            {question.type === "select" && question.options && (
              <Select
                value={answers[question.id] || ""}
                onValueChange={(value) => onAnswerChange(question.id, value)}
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
          <Button type="button" variant="outline" onClick={onBack}>
            Atrás
          </Button>
          <Button type="submit" disabled={!allRequiredAnswered}>
            Continuar
          </Button>
        </div>
      </form>
    </div>
  )
}

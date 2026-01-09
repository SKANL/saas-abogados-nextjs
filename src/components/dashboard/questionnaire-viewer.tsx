"use client"

import { Plus, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface Question {
  id: string
  text: string
  type: "text" | "textarea" | "select" | "radio"
  required: boolean
  options?: string[]
}

interface QuestionnaireViewerProps {
  id: string
  name: string
  description?: string
  createdAt: string
  questions: Question[]
}

export function QuestionnaireViewer({
  id,
  name,
  description,
  createdAt,
  questions,
}: QuestionnaireViewerProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/plantillas/cuestionarios">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
          <p className="text-muted-foreground text-sm">
            Creado el {new Date(createdAt).toLocaleDateString("es-MX")}
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nombre</p>
              <p className="text-sm">{name}</p>
            </div>
            {description && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Descripción
                  </p>
                  <p className="text-sm">{description}</p>
                </div>
              </>
            )}
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total de preguntas
              </p>
              <p className="text-sm">{questions.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Preguntas</CardTitle>
                <CardDescription>
                  Vista previa de las preguntas del cuestionario
                </CardDescription>
              </div>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Agregar pregunta
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.length > 0 ? (
              questions.map((question, index) => (
                <div key={question.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {index + 1}. {question.text}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Tipo: <span className="capitalize">{question.type}</span>
                        {question.required && (
                          <span className="ml-2 text-red-500">*Requerida</span>
                        )}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {question.options && question.options.length > 0 && (
                    <div className="mt-2 ml-4 space-y-1">
                      {question.options.map((option, idx) => (
                        <p key={idx} className="text-xs text-muted-foreground">
                          • {option}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No hay preguntas en este cuestionario</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button asChild variant="outline">
            <Link href={`/plantillas/cuestionarios/${id}/editar`}>
              Editar
            </Link>
          </Button>
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  )
}

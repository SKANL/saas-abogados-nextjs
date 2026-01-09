"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { questionnaireTemplatesService } from "@/lib/services/templates.service"
import { toast } from "sonner"
import type { Question } from "@/lib/supabase/database.types"

const questionSchema = z.object({
  text: z.string().min(5, "La pregunta debe tener al menos 5 caracteres"),
})

const formSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  questions: z.array(questionSchema).min(1, "Debe haber al menos una pregunta"),
})

type FormValues = z.infer<typeof formSchema>

interface QuestionnaireEditFormProps {
  id: string
  initialName: string
  initialQuestions: Question[]
}

export function QuestionnaireEditForm({
  id,
  initialName,
  initialQuestions,
}: QuestionnaireEditFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialName,
      questions: initialQuestions.map(q => ({
        text: q.question_text,
      })),
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions",
  })

  async function onSubmit(values: FormValues) {
    setIsLoading(true)
    try {
      // Extract only question texts
      const questionTexts = values.questions.map(q => q.text)

      const { data, error } = await questionnaireTemplatesService.update(
        id,
        values.name,
        questionTexts
      )

      if (error) {
        toast.error("Error al actualizar cuestionario", {
          description: error.message,
        })
        return
      }

      toast.success("Cuestionario actualizado", {
        description: "Los cambios se han guardado exitosamente",
      })
      
      router.push(`/plantillas/cuestionarios/${id}`)
      router.refresh()
    } catch (error) {
      console.error("Error updating questionnaire:", error)
      toast.error("Error inesperado", {
        description: "No se pudo actualizar el cuestionario. Intenta de nuevo.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Información del Cuestionario</CardTitle>
            <CardDescription>
              Actualiza el nombre del cuestionario
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del cuestionario</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Cuestionario de Divorcio"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Aparecerá en el selector al crear nuevas salas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Preguntas</CardTitle>
            <CardDescription>
              Edita, elimina o agrega preguntas al cuestionario
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Pregunta {index + 1}</h4>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name={`questions.${index}.text`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Texto de la pregunta</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ej: ¿Cuál es su ocupación?"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {index < fields.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() => append({ text: "" })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar pregunta
            </Button>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

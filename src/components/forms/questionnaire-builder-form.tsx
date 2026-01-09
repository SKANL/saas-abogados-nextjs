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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

const questionSchema = z.object({
  text: z.string().min(5, "La pregunta debe tener al menos 5 caracteres"),
  type: z.enum(["text", "textarea", "select", "radio"]),
  required: z.boolean(),
  options: z.string().optional(),
})

const formSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  questions: z.array(questionSchema).min(1, "Debe haber al menos una pregunta"),
})

type FormValues = z.infer<typeof formSchema>

export function QuestionnaireBuilderForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      questions: [
        { text: "", type: "text", required: true, options: "" },
      ],
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

      const { data, error } = await questionnaireTemplatesService.create(
        values.name,
        questionTexts
      )

      if (error) {
        toast.error("Error al crear cuestionario", {
          description: error.message,
        })
        return
      }

      toast.success("Cuestionario creado", {
        description: "El cuestionario se ha creado exitosamente",
      })
      
      router.push("/plantillas/cuestionarios")
      router.refresh()
    } catch (error) {
      console.error("Error creating questionnaire:", error)
      toast.error("Error inesperado", {
        description: "No se pudo crear el cuestionario. Intenta de nuevo.",
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
            <CardTitle>Nuevo Cuestionario</CardTitle>
            <CardDescription>
              Crea un cuestionario personalizado para recopilar información de tus clientes
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

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe qué información recopila este cuestionario"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
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
              Agregar las preguntas que deseas hacer a tus clientes
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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`questions.${index}.type`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="text">Texto corto</SelectItem>
                            <SelectItem value="textarea">Texto largo</SelectItem>
                            <SelectItem value="select">Selección</SelectItem>
                            <SelectItem value="radio">Opción única</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`questions.${index}.required`}
                    render={({ field }) => (
                      <FormItem className="flex items-end gap-2">
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4"
                            />
                            <label className="text-sm">Requerida</label>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {["select", "radio"].includes(
                  form.watch(`questions.${index}.type`)
                ) && (
                  <FormField
                    control={form.control}
                    name={`questions.${index}.options`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opciones (separadas por coma)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej: Opción 1, Opción 2, Opción 3"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {index < fields.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                append({ text: "", type: "text", required: true })
              }
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
            {isLoading ? "Creando..." : "Crear Cuestionario"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

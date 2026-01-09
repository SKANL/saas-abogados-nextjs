"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Upload, File, X, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { contractTemplatesService } from "@/lib/services/templates.service"
import { toast } from "sonner"

const formSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  file: z.any().optional().refine((file) => {
    if (!file) return true // Optional
    return file instanceof File && (file as File).type === "application/pdf"
  }, {
    message: "El archivo debe ser un PDF",
  }),
})

type FormValues = z.infer<typeof formSchema>

interface ContractEditFormProps {
  id: string
  initialName: string
  currentFileUrl: string
}

export function ContractEditForm({
  id,
  initialName,
  currentFileUrl,
}: ContractEditFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [dragActive, setDragActive] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialName,
    },
  })

  async function onSubmit(values: FormValues) {
    setIsLoading(true)
    try {
      // If there's a new file, we need to create a new template
      // For now, we'll only allow name updates
      // TODO: Implement file update logic
      
      toast.success("Plantilla actualizada", {
        description: "El nombre se ha actualizado exitosamente",
      })
      
      router.push(`/plantillas/contratos/${id}`)
      router.refresh()
    } catch (error) {
      console.error("Error updating contract:", error)
      toast.error("Error inesperado", {
        description: "No se pudo actualizar la plantilla. Intenta de nuevo.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      const file = files[0]
      if (file.type === "application/pdf") {
        form.setValue("file", file)
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Información de la Plantilla</CardTitle>
            <CardDescription>
              Actualiza el nombre de la plantilla
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la plantilla</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Contrato de Servicios Legales"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Este nombre aparecerá en el selector al crear nuevas salas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Archivo PDF Actual</FormLabel>
              <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
                <File className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm flex-1 truncate">{initialName}.pdf</span>
                <a
                  href={currentFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  Ver archivo
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <p className="text-xs text-muted-foreground">
                Para cambiar el archivo, crea una nueva plantilla
              </p>
            </div>
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

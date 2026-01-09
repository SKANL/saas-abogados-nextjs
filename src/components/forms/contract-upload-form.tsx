"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Upload, File, X } from "lucide-react"

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
  file: z.any().refine((file) => {
    // Check if it's a File-like object and has PDF type
    return file && typeof file === 'object' && file.type === "application/pdf"
  }, {
    message: "El archivo debe ser un PDF",
  }),
})

type FormValues = z.infer<typeof formSchema>

export function ContractUploadForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [dragActive, setDragActive] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  })

  async function onSubmit(values: FormValues) {
    setIsLoading(true)
    try {
      const { data, error } = await contractTemplatesService.create(
        values.name,
        values.file
      )

      if (error) {
        toast.error("Error al crear plantilla", {
          description: error.message,
        })
        return
      }

      toast.success("Plantilla creada", {
        description: "La plantilla de contrato se ha creado exitosamente",
      })
      
      router.push("/plantillas/contratos")
      router.refresh()
    } catch (error) {
      console.error("Error uploading contract:", error)
      toast.error("Error inesperado", {
        description: "No se pudo crear la plantilla. Intenta de nuevo.",
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
            <CardTitle>Nueva Plantilla de Contrato</CardTitle>
            <CardDescription>
              Sube un archivo PDF para usarlo como plantilla en tus salas de bienvenida
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

            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Archivo PDF</FormLabel>
                  <FormControl>
                    <div
                      className={`relative border-2 border-dashed rounded-lg p-8 transition-colors ${
                        dragActive
                          ? "border-primary bg-primary/5"
                          : "border-muted-foreground/25"
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            form.setValue("file", file)
                          }
                        }}
                      />

                      <div className="flex flex-col items-center justify-center gap-2 text-center">
                        {form.watch("file") ? (
                          <>
                            <File className="h-10 w-10 text-primary" />
                            <p className="font-medium">
                              {form.watch("file")?.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {(form.watch("file")?.size || 0) / 1024 / 1024}
                              {" "}
                              MB
                            </p>
                          </>
                        ) : (
                          <>
                            <Upload className="h-10 w-10 text-muted-foreground" />
                            <p className="font-medium">Arrastra tu PDF aquí</p>
                            <p className="text-sm text-muted-foreground">
                              o haz clic para seleccionar
                            </p>
                          </>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 cursor-pointer"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <Alert variant="destructive">
                <AlertDescription>
                  {form.formState.errors.root.message}
                </AlertDescription>
              </Alert>
            )}
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
            {isLoading ? "Subiendo..." : "Subir Plantilla"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

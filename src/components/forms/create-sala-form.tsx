"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Plus, X } from "lucide-react"
import { useClients, useContractTemplates, useQuestionnaireTemplates } from "@/hooks"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
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

const formSchema = z.object({
  clientName: z.string().min(2, "El nombre es requerido"),
  clientEmail: z.string().email("Ingresa un correo válido"),
  caseName: z.string().min(2, "El nombre del caso es requerido"),
  contractTemplate: z.string().optional(),
  questionnaireTemplate: z.string().optional(),
  documentsRequired: z.array(z.string()),
  customMessage: z.string().optional(),
  expirationDays: z.string(),
})

type FormValues = z.infer<typeof formSchema>

const commonDocuments = [
  "INE/IFE",
  "Comprobante de domicilio",
  "CURP",
  "RFC/Constancia de Situación Fiscal",
  "Acta de nacimiento",
  "Estado de cuenta bancario",
]

export function CreateSalaForm() {
  const router = useRouter()
  const [customDoc, setCustomDoc] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  
  const { create, loading: creating } = useClients()
  const { templates: contractTemplates, loading: loadingContracts } = useContractTemplates()
  const { templates: questionnaireTemplates, loading: loadingQuestionnaires } = useQuestionnaireTemplates()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      clientEmail: "",
      caseName: "",
      contractTemplate: "",
      questionnaireTemplate: "",
      documentsRequired: [],
      customMessage: "",
      expirationDays: "7",
    },
  })

  const documentsRequired = form.watch("documentsRequired")

  const handleAddCustomDoc = () => {
    if (customDoc.trim() && !documentsRequired.includes(customDoc.trim())) {
      form.setValue("documentsRequired", [...documentsRequired, customDoc.trim()])
      setCustomDoc("")
    }
  }

  const handleRemoveDoc = (doc: string) => {
    form.setValue(
      "documentsRequired",
      documentsRequired.filter((d) => d !== doc)
    )
  }

  async function onSubmit(data: FormValues) {
    try {
      setError(null)
      await create({
        client_name: data.clientName,
        client_email: data.clientEmail,
        case_name: data.caseName,
        contract_template_id: data.contractTemplate || undefined,
        questionnaire_template_id: data.questionnaireTemplate || undefined,
        required_documents: data.documentsRequired,
        custom_message: data.customMessage || undefined,
        expiration_days: parseInt(data.expirationDays),
      })
      router.push("/clientes")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la sala")
    }
  }

  const isLoading = creating || loadingContracts || loadingQuestionnaires

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        
        {/* Client Info */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Cliente</CardTitle>
            <CardDescription>
              Ingresa los datos del cliente para crear su sala de bienvenida
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Juan García López" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="clientEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="cliente@email.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="caseName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del caso</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Divorcio voluntario" {...field} />
                  </FormControl>
                  <FormDescription>
                    Un nombre descriptivo para identificar este caso
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Templates */}
        <Card>
          <CardHeader>
            <CardTitle>Plantillas</CardTitle>
            <CardDescription>
              Selecciona las plantillas que el cliente deberá completar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="contractTemplate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contrato (opcional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar contrato" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {!contractTemplates || contractTemplates.length === 0 ? (
                          <SelectItem value="none" disabled>
                            No hay plantillas disponibles
                          </SelectItem>
                        ) : (
                          contractTemplates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="questionnaireTemplate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cuestionario (opcional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar cuestionario" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {!questionnaireTemplates || questionnaireTemplates.length === 0 ? (
                          <SelectItem value="none" disabled>
                            No hay cuestionarios disponibles
                          </SelectItem>
                        ) : (
                          questionnaireTemplates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Documentos Requeridos</CardTitle>
            <CardDescription>
              Selecciona los documentos que el cliente deberá subir
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2">
              {commonDocuments.map((doc) => (
                <div key={doc} className="flex items-center space-x-2">
                  <Checkbox
                    id={doc}
                    checked={documentsRequired.includes(doc)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        form.setValue("documentsRequired", [...documentsRequired, doc])
                      } else {
                        handleRemoveDoc(doc)
                      }
                    }}
                  />
                  <label
                    htmlFor={doc}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {doc}
                  </label>
                </div>
              ))}
            </div>
            <Separator />
            <div className="flex gap-2">
              <Input
                placeholder="Otro documento..."
                value={customDoc}
                onChange={(e) => setCustomDoc(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddCustomDoc()
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={handleAddCustomDoc}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {documentsRequired.filter((d) => !commonDocuments.includes(d)).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {documentsRequired
                  .filter((d) => !commonDocuments.includes(d))
                  .map((doc) => (
                    <div
                      key={doc}
                      className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm"
                    >
                      {doc}
                      <button
                        type="button"
                        onClick={() => handleRemoveDoc(doc)}
                        className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="expirationDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiración del enlace</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="3">3 días</SelectItem>
                      <SelectItem value="7">7 días</SelectItem>
                      <SelectItem value="14">14 días</SelectItem>
                      <SelectItem value="30">30 días</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    El enlace dejará de funcionar después de este tiempo
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mensaje personalizado (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Escribe un mensaje de bienvenida para tu cliente..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear Sala
          </Button>
        </div>
      </form>
    </Form>
  )
}

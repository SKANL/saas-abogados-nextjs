"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, FileText, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"

const formSchema = z.object({
  typedName: z.string().min(2, "Por favor escribe tu nombre completo"),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar los términos para continuar",
  }),
})

type FormValues = z.infer<typeof formSchema>

interface ConsentStepProps {
  clientId: string
  linkId: string
  clientName: string
  contractUrl: string
  contractName: string
  onSignature: (signature: string) => void
  onNext: () => void
}

export function ConsentStep({
  clientId,
  linkId,
  clientName,
  contractUrl,
  contractName,
  onSignature,
  onNext,
}: ConsentStepProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = React.useState(false)
  const [hasSignature, setHasSignature] = React.useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      typedName: clientName,
      acceptTerms: false,
    },
  })

  // Initialize canvas
  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.stroke()
    setHasSignature(true)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }

  async function onSubmit(data: FormValues) {
    if (!hasSignature) {
      toast.error("Por favor firma en el recuadro")
      return
    }

    setIsLoading(true)
    try {
      // Get signature data
      const canvas = canvasRef.current
      if (!canvas) return

      const signatureDataUrl = canvas.toDataURL()
      onSignature(signatureDataUrl)

      // Save signature to Supabase
      const response = await fetch('/api/portal/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          linkId,
          signatureData: signatureDataUrl,
          signedName: data.typedName,
        }),
      })

      if (!response.ok) {
        throw new Error('Error al guardar la firma')
      }

      toast.success("Contrato firmado exitosamente")
      onNext()
    } catch (error) {
      console.error("Error saving signature:", error)
      toast.error("Error al guardar la firma. Intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Firma del Contrato</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Hola {clientName}, por favor revisa y firma el siguiente contrato para continuar.
        </p>
      </div>

      {/* Contract PDF */}
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{contractName}</span>
          <a
            href={contractUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            Ver documento
            <ExternalLink className="h-3 w-3" />
          </a>
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="typedName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre Completo</FormLabel>
                <FormControl>
                  <Input placeholder="Escribe tu nombre completo" {...field} />
                </FormControl>
                <FormDescription>
                  Confirma tu nombre como aparecerá en el contrato
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Signature Canvas */}
          <div className="space-y-2">
            <FormLabel>Firma</FormLabel>
            <div className="space-y-2">
              <canvas
                ref={canvasRef}
                width={500}
                height={150}
                className="w-full border-2 border-dashed rounded-lg cursor-crosshair bg-white"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearSignature}
                >
                  Limpiar firma
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Dibuja tu firma con el cursor en el recuadro
            </p>
          </div>

          <FormField
            control={form.control}
            name="acceptTerms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Acepto los términos y condiciones del contrato
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isLoading || !hasSignature}
              className="min-w-32"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Firmar y Continuar
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

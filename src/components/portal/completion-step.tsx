import { CheckCircle2 } from "lucide-react"

interface CompletionStepProps {
  clientName: string
}

export function CompletionStep({ clientName }: CompletionStepProps) {
  return (
    <div className="py-8 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <CheckCircle2 className="h-10 w-10 text-green-600" />
      </div>
      <h2 className="text-2xl font-semibold">¡Proceso Completado!</h2>
      <p className="mt-2 text-muted-foreground">
        Gracias {clientName}, tu información ha sido enviada correctamente.
      </p>
      <p className="mt-4 text-sm text-muted-foreground">
        Recibirás un correo de confirmación con los siguientes pasos.
        <br />
        Ya puedes cerrar esta ventana.
      </p>
    </div>
  )
}

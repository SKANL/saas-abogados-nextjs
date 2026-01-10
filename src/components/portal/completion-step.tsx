"use client"

import * as React from "react"
import { CheckCircle2 } from "lucide-react"

interface CompletionStepProps {
  clientId: string
  linkId: string
  clientName: string
}

export function CompletionStep({ clientId, linkId, clientName }: CompletionStepProps) {
  React.useEffect(() => {
    // Mark the portal as completed in the database
    const completePortal = async () => {
      try {
        const response = await fetch('/api/portal/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clientId,
            linkId,
          }),
        })

        if (!response.ok) {
          console.error('Error marking portal as completed')
        }
      } catch (error) {
        console.error('Error completing portal:', error)
      }
    }

    completePortal()
  }, [clientId, linkId])

  return (
    <div className="py-8 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
        <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
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

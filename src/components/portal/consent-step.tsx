"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const formSchema = z.object({
  typedName: z.string().min(2, "Por favor escribe tu nombre completo"),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar los términos para continuar",
  }),
})

type FormValues = z.infer<typeof formSchema>

interface ConsentStepProps {
  clientName: string
  contractContent?: string
  onNext: () => void
}

const defaultContract = `
CONTRATO DE PRESTACIÓN DE SERVICIOS LEGALES

Por medio del presente documento, el cliente acepta los términos y condiciones 
para la prestación de servicios legales profesionales.

1. OBJETO DEL CONTRATO
El presente contrato tiene por objeto establecer los términos y condiciones 
bajo los cuales se prestarán los servicios legales.

2. OBLIGACIONES DEL PROFESIONAL
- Prestar los servicios con diligencia y profesionalismo
- Mantener la confidencialidad de la información
- Informar al cliente sobre el avance del asunto

3. OBLIGACIONES DEL CLIENTE
- Proporcionar información veraz y completa
- Cubrir los honorarios acordados
- Colaborar con el desarrollo del asunto

4. HONORARIOS
Los honorarios serán acordados entre las partes y deberán cubrirse 
en los términos establecidos.

5. CONFIDENCIALIDAD
Toda la información proporcionada será tratada con estricta confidencialidad.
`

export function ConsentStep({
  clientName,
  contractContent = defaultContract,
  onNext,
}: ConsentStepProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      typedName: "",
      acceptTerms: false,
    },
  })

  function onSubmit(data: FormValues) {
    // TODO: Save consent data
    console.log("Consent:", data)
    onNext()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Consentimiento Informado</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Hola {clientName}, por favor lee el siguiente documento y firma para continuar.
        </p>
      </div>

      <ScrollArea className="h-[300px] rounded-md border p-4">
        <div className="whitespace-pre-wrap text-sm">{contractContent}</div>
      </ScrollArea>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="typedName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Escribe tu nombre completo como firma</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Tu nombre completo"
                    className="font-medium"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                    He leído y acepto los términos del contrato
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
          <div className="flex justify-end pt-4">
            <Button type="submit">Continuar</Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

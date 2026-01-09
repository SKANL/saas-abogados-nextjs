"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"

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
import { Switch } from "@/components/ui/switch"

const formSchema = z.object({
  calendarLink: z.string().url("URL inválida").optional().or(z.literal("")),
  linkExpiration: z.string(),
  autoReminders: z.boolean(),
  smtpServer: z.string().optional(),
  smtpPort: z.string().optional(),
  smtpUsername: z.string().optional(),
  privacyPolicy: z.string().optional(),
  termsOfService: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function GlobalSettingsForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      calendarLink: "",
      linkExpiration: "7",
      autoReminders: true,
      smtpServer: "",
      smtpPort: "587",
      smtpUsername: "",
      privacyPolicy: "",
      termsOfService: "",
    },
  })

  async function onSubmit(values: FormValues) {
    setIsLoading(true)
    try {
      // TODO: Implement global settings update in Supabase
      await new Promise((resolve) => setTimeout(resolve, 1500))
      router.refresh()
    } catch (error) {
      console.error("Error updating settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Configuración de Salas */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Salas</CardTitle>
            <CardDescription>
              Ajustes globales para las salas de bienvenida
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="calendarLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enlace del Calendario (Opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://cal.com/despacho"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enlace de Calendly, Cal.com u otro sistema de agendamiento
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="linkExpiration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiración de Enlaces (días)</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" max="90" {...field} />
                  </FormControl>
                  <FormDescription>
                    Los enlaces de las salas expirarán después de este período
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="autoReminders"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Recordatorios Automáticos
                    </FormLabel>
                    <FormDescription>
                      Enviar recordatorios a clientes con salas pendientes
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Separator />

        {/* Configuración de Email */}
        <Card>
          <CardHeader>
            <CardTitle>Servidor de Email (SMTP)</CardTitle>
            <CardDescription>
              Configuración opcional para envío de emails personalizados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="smtpServer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Servidor SMTP (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="smtp.gmail.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="smtpPort"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Puerto</FormLabel>
                    <FormControl>
                      <Input placeholder="587" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="smtpUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usuario</FormLabel>
                    <FormControl>
                      <Input placeholder="email@ejemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Políticas Legales */}
        <Card>
          <CardHeader>
            <CardTitle>Políticas y Términos</CardTitle>
            <CardDescription>
              URLs de tus políticas de privacidad y términos de servicio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="privacyPolicy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Política de Privacidad (Opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://tudespacho.com/privacidad"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="termsOfService"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Términos de Servicio (Opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://tudespacho.com/terminos"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Guardando..." : "Guardar Configuración"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

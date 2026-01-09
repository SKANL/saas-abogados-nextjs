"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Upload } from "lucide-react"

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

const formSchema = z.object({
  firmName: z.string().min(2, "El nombre es requerido"),
  firmEmail: z.string().email("Correo inválido"),
  firmPhone: z.string().optional(),
  firmAddress: z.string().optional(),
  firmWebsite: z.string().url("URL inválida").optional().or(z.literal("")),
  firmLogo: z.string().optional(),
  firmDescription: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function FirmProfileForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firmName: "Mi Despacho",
      firmEmail: "contacto@midespacho.com",
      firmPhone: "",
      firmAddress: "",
      firmWebsite: "",
      firmLogo: "",
      firmDescription: "",
    },
  })

  async function onSubmit(values: FormValues) {
    setIsLoading(true)
    try {
      // TODO: Implement firm profile update in Supabase
      await new Promise((resolve) => setTimeout(resolve, 1500))
      router.refresh()
    } catch (error) {
      console.error("Error updating firm profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Despacho</CardTitle>
            <CardDescription>
              Configuración básica de tu firma de abogados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="firmName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Despacho</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Despacho García & Asociados" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="firmDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Breve descripción del despacho"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Esta descripción puede mostrarse en la sala del cliente
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="firmLogo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo del Despacho (Opcional)</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      <Button type="button" variant="outline" size="sm">
                        <Upload className="mr-2 h-4 w-4" />
                        Subir Logo
                      </Button>
                      {field.value && (
                        <img
                          src={field.value}
                          alt="Logo"
                          className="h-12 w-12 rounded object-contain"
                        />
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Formato recomendado: PNG o SVG, máximo 2MB
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Contacto */}
        <Card>
          <CardHeader>
            <CardTitle>Información de Contacto</CardTitle>
            <CardDescription>
              Datos de contacto visibles para los clientes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="firmEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo de Contacto</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="contacto@despacho.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    Este será el correo usado para comunicaciones con clientes
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firmPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="+52 55 1234 5678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="firmWebsite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sitio Web (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://tudespacho.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="firmAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Dirección completa del despacho"
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

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

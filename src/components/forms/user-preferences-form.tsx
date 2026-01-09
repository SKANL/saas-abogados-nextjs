"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/hooks"
import { ThemeSelector } from "./theme-selector"

const formSchema = z.object({
  emailNotifications: z.boolean(),
  theme: z.enum(["light", "dark"]),
  language: z.string(),
  timezone: z.string(),
})

type FormValues = z.infer<typeof formSchema>

export function UserPreferencesForm() {
  const router = useRouter()
  const { profile } = useAuth()
  const [isLoading, setIsLoading] = React.useState(false)
  const [successMessage, setSuccessMessage] = React.useState("")
  const [mounted, setMounted] = React.useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailNotifications: true,
      theme: "light",
      language: "es",
      timezone: "America/Mexico_City",
    },
  })

  React.useEffect(() => {
    setMounted(true)
    // Load profile values after mount
    if (profile?.theme_mode) {
      form.setValue("theme", profile.theme_mode as "light" | "dark")
    }
  }, [])

  // Update form when profile changes
  React.useEffect(() => {
    if (profile?.theme_mode && mounted) {
      form.setValue("theme", profile.theme_mode as "light" | "dark")
    }
  }, [profile?.theme_mode, mounted, form])

  async function onSubmit(values: FormValues) {
    setIsLoading(true)
    try {
      setSuccessMessage("Preferencias guardadas correctamente")
      setTimeout(() => setSuccessMessage(""), 3000)
      router.refresh()
    } catch (error) {
      console.error("Error updating preferences:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Notificaciones */}
        <Card>
          <CardHeader>
            <CardTitle>Notificaciones</CardTitle>
            <CardDescription>
              Controla cómo y cuándo recibir notificaciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="emailNotifications"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Notificaciones por Email
                    </FormLabel>
                    <FormDescription>
                      Recibe emails cuando los clientes completen su onboarding
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Separator />

        {/* Apariencia */}
        <Card>
          <CardHeader>
            <CardTitle>Apariencia</CardTitle>
            <CardDescription>
              Personaliza la apariencia de la interfaz
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <ThemeSelector value={field.value} onValueChange={field.onChange} />
              )}
            />
          </CardContent>
        </Card>

        <Separator />

        {/* Región e Idioma */}
        <Card>
          <CardHeader>
            <CardTitle>Región e Idioma</CardTitle>
            <CardDescription>
              Ajusta el idioma y zona horaria
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Idioma</FormLabel>
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
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zona Horaria</FormLabel>
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
                      <SelectItem value="America/Mexico_City">
                        Ciudad de México (GMT-6)
                      </SelectItem>
                      <SelectItem value="America/Monterrey">
                        Monterrey (GMT-6)
                      </SelectItem>
                      <SelectItem value="America/Cancun">
                        Cancún (GMT-5)
                      </SelectItem>
                      <SelectItem value="America/Tijuana">
                        Tijuana (GMT-8)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Guardando..." : "Guardar Preferencias"}
          </Button>
          {successMessage && (
            <div className="flex items-center text-sm font-medium text-green-600">
              ✓ {successMessage}
            </div>
          )}
        </div>
      </form>
    </Form>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CheckCircle2, Loader2, Upload, AlertCircle, FileText, ClipboardList, Sparkles, CheckCheck } from 'lucide-react'

type OnboardingStep = 'welcome' | 'profile' | 'template' | 'tour'

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())

  // Profile form state
  const [firmLogo, setFirmLogo] = useState<File | null>(null)
  const [firmBio, setFirmBio] = useState('')
  const [calendarLink, setCalendarLink] = useState('')

  const steps = [
    { id: 'welcome', label: 'Bienvenida', value: 1 },
    { id: 'profile', label: 'Perfil', value: 2 },
    { id: 'template', label: 'Plantilla', value: 3 },
    { id: 'tour', label: 'Tour', value: 4 },
  ]

  const currentStepIndex = steps.findIndex(s => s.id === currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const markStepComplete = (step: string) => {
    setCompletedSteps(prev => new Set([...prev, step]))
  }

  const handleNextStep = () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < steps.length) {
      markStepComplete(currentStep)
      setCurrentStep(steps[nextIndex].id as OnboardingStep)
    }
  }

  const handlePreviousStep = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id as OnboardingStep)
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('El logo no debe superar 2MB')
        return
      }
      setFirmLogo(file)
      setError(null)
    }
  }

  const handleSaveProfile = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('Usuario no autenticado')

      let logoUrl = null

      // Upload logo if provided
      if (firmLogo) {
        const fileExt = firmLogo.name.split('.').pop()
        const fileName = `${user.id}-logo-${Date.now()}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('firm-assets')
          .upload(`logos/${fileName}`, firmLogo)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('firm-assets')
          .getPublicUrl(`logos/${fileName}`)

        logoUrl = publicUrl
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          firm_logo_url: logoUrl,
          bio: firmBio,
          calendar_link: calendarLink,
        })
        .eq('user_id', user.id)

      if (updateError) throw updateError

      markStepComplete('profile')
      handleNextStep()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar perfil')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteOnboarding = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('Usuario no autenticado')

      // Mark onboarding as completed
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
        })
        .eq('user_id', user.id)

      if (updateError) throw updateError

      // Redirect to dashboard
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al completar onboarding')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container py-8 md:py-12 lg:py-16">
        {/* Header Section */}
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Configuración inicial
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Completa estos pasos para comenzar a usar Sala Cliente
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mx-auto mb-8 max-w-3xl">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  Paso {currentStepIndex + 1} de {steps.length}
                </CardTitle>
                <Badge variant="secondary" className="font-mono">
                  {Math.round(progress)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={progress} className="h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-4xl">
          <Tabs value={currentStep} onValueChange={(v) => setCurrentStep(v as OnboardingStep)}>
            <TabsList className="mb-8 grid w-full grid-cols-4">
              {steps.map((step) => (
                <TabsTrigger
                  key={step.id}
                  value={step.id}
                  disabled={!completedSteps.has(step.id) && step.id !== currentStep}
                  className="relative"
                >
                  {completedSteps.has(step.id) && (
                    <CheckCircle2 className="absolute -right-1 -top-1 h-4 w-4 text-green-600" />
                  )}
                  <span className="hidden sm:inline">{step.label}</span>
                  <span className="sm:hidden">{step.value}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Step 1: Welcome */}
            <TabsContent value="welcome" className="space-y-6">
              <Card>
                <CardHeader className="text-center">
                  <Sparkles className="mx-auto mb-4 h-12 w-12 text-primary" />
                  <CardTitle className="text-2xl sm:text-3xl lg:text-4xl">
                    ¡Bienvenido a Sala Cliente!
                  </CardTitle>
                  <CardDescription className="text-base">
                    Te ayudaremos a configurar tu espacio de trabajo en solo 4 pasos
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">¿Qué lograrás?</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                        <span className="text-sm">Crear salas personalizadas para cada cliente</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                        <span className="text-sm">Recopilar documentos y firmas de forma segura</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                        <span className="text-sm">Automatizar cuestionarios y contratos</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                        <span className="text-sm">Gestionar tu despacho de forma profesional</span>
                      </li>
                    </ul>
                  </div>
                  <div className="flex items-center justify-center rounded-lg bg-muted p-8">
                    <div className="text-center">
                      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-background shadow-lg">
                        <svg className="h-10 w-10 text-primary" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium">Video de introducción</p>
                      <p className="text-xs text-muted-foreground">Próximamente</p>
                    </div>
                  </div>
                </CardContent>
                <Separator />
                <CardFooter className="justify-end pt-6">
                  <Button onClick={handleNextStep} size="lg">
                    Comenzar configuración
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Step 2: Profile */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Completa tu perfil</CardTitle>
                  <CardDescription>
                    Personaliza tu despacho para dar una mejor impresión a tus clientes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid gap-6 sm:grid-cols-3">
                    {/* Logo Upload */}
                    <div className="sm:col-span-1">
                      <Label>Logo del despacho</Label>
                      <p className="mb-3 text-xs text-muted-foreground">Opcional</p>
                      <div>
                        <input
                          id="logo"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        <label
                          htmlFor="logo"
                          className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-primary hover:bg-muted/50"
                        >
                          {firmLogo ? (
                            <div className="text-center p-4">
                              <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-green-600" />
                              <p className="text-xs font-medium break-all px-2">{firmLogo.name}</p>
                              <p className="mt-2 text-xs text-muted-foreground">Clic para cambiar</p>
                            </div>
                          ) : (
                            <div className="text-center p-4">
                              <Upload className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                              <p className="text-xs font-medium">Subir logo</p>
                              <p className="mt-1 text-xs text-muted-foreground">PNG, JPG hasta 2MB</p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    {/* Bio and Calendar */}
                    <div className="space-y-6 sm:col-span-2">
                      <div className="grid gap-3">
                        <Label htmlFor="bio">Descripción del despacho</Label>
                        <Textarea
                          id="bio"
                          placeholder="Ejemplo: Despacho especializado en derecho civil con 10 años de experiencia..."
                          value={firmBio}
                          onChange={(e) => setFirmBio(e.target.value)}
                          rows={6}
                          className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground">
                          Esta descripción aparecerá en las salas de tus clientes
                        </p>
                      </div>

                      <div className="grid gap-3">
                        <Label htmlFor="calendar">Enlace a Calendly</Label>
                        <Input
                          id="calendar"
                          type="url"
                          placeholder="https://calendly.com/tu-usuario"
                          value={calendarLink}
                          onChange={(e) => setCalendarLink(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Tus clientes podrán agendar citas directamente desde su sala
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <Separator />
                <CardFooter className="flex justify-between pt-6">
                  <Button variant="outline" onClick={handlePreviousStep}>
                    Anterior
                  </Button>
                  <Button onClick={handleSaveProfile} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      'Continuar'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Step 3: Template */}
            <TabsContent value="template" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Crea tu primera plantilla</CardTitle>
                  <CardDescription>
                    Las plantillas te permiten reutilizar contratos y cuestionarios
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Alert>
                    <Sparkles className="h-4 w-4" />
                    <AlertTitle>Tip</AlertTitle>
                    <AlertDescription>
                      Puedes crear plantillas más tarde. Accede desde el menú de plantillas cuando lo necesites
                    </AlertDescription>
                  </Alert>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Card className="transition-all hover:border-primary hover:shadow-md">
                      <CardHeader>
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-xl">Contrato de servicios</CardTitle>
                        <CardDescription>
                          Plantilla básica para contratos legales con cláusulas estándar
                        </CardDescription>
                      </CardHeader>
                      <CardFooter>
                        <Button variant="outline" className="w-full">
                          Usar plantilla
                        </Button>
                      </CardFooter>
                    </Card>

                    <Card className="transition-all hover:border-primary hover:shadow-md">
                      <CardHeader>
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                          <ClipboardList className="h-6 w-6 text-green-600" />
                        </div>
                        <CardTitle className="text-xl">Cuestionario inicial</CardTitle>
                        <CardDescription>
                          Recopila información básica de nuevos clientes
                        </CardDescription>
                      </CardHeader>
                      <CardFooter>
                        <Button variant="outline" className="w-full">
                          Usar plantilla
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </CardContent>
                <Separator />
                <CardFooter className="flex justify-between pt-6">
                  <Button variant="outline" onClick={handlePreviousStep}>
                    Anterior
                  </Button>
                  <Button variant="outline" onClick={handleNextStep}>
                    Omitir por ahora
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Step 4: Tour */}
            <TabsContent value="tour" className="space-y-6">
              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
                    <CheckCheck className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl sm:text-3xl">¡Todo listo!</CardTitle>
                  <CardDescription>
                    Conoce las funcionalidades principales de tu dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Card className="border-2">
                      <CardHeader>
                        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 text-white font-bold">
                          1
                        </div>
                        <CardTitle className="text-lg">Crear sala de cliente</CardTitle>
                        <CardDescription>
                          Desde el botón "Crear sala" podrás generar un espacio personalizado para cada caso
                        </CardDescription>
                      </CardHeader>
                    </Card>

                    <Card className="border-2">
                      <CardHeader>
                        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500 text-white font-bold">
                          2
                        </div>
                        <CardTitle className="text-lg">Compartir enlace mágico</CardTitle>
                        <CardDescription>
                          Cada sala genera un enlace único que envías a tu cliente por email o WhatsApp
                        </CardDescription>
                      </CardHeader>
                    </Card>

                    <Card className="border-2">
                      <CardHeader>
                        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-green-500 text-white font-bold">
                          3
                        </div>
                        <CardTitle className="text-lg">Recibir documentos y firmas</CardTitle>
                        <CardDescription>
                          Tu cliente completa el cuestionario, sube documentos y firma digitalmente
                        </CardDescription>
                      </CardHeader>
                    </Card>

                    <Card className="border-2">
                      <CardHeader>
                        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500 text-white font-bold">
                          4
                        </div>
                        <CardTitle className="text-lg">Gestionar casos</CardTitle>
                        <CardDescription>
                          Visualiza el progreso de todos tus casos desde un solo lugar
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </div>

                  <Card className="border-primary bg-primary/5">
                    <CardHeader className="text-center">
                      <CardTitle className="text-xl">¿Listo para comenzar?</CardTitle>
                      <CardDescription>
                        Tu dashboard te está esperando con todas las herramientas que necesitas
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex-col gap-3">
                      <Button
                        onClick={handleCompleteOnboarding}
                        disabled={isLoading}
                        size="lg"
                        className="w-full"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Finalizando...
                          </>
                        ) : (
                          'Ir al Dashboard'
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={handlePreviousStep}
                        size="sm"
                      >
                        Volver al paso anterior
                      </Button>
                    </CardFooter>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

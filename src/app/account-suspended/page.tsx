import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Mail, MessageCircle } from 'lucide-react'
import Link from 'next/link'

export default function AccountSuspendedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-900">Cuenta Suspendida</CardTitle>
          <CardDescription>
            Tu cuenta ha sido suspendida temporalmente
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert variant="destructive">
            <AlertTitle>Acceso restringido</AlertTitle>
            <AlertDescription>
              No puedes acceder al sistema en este momento. Tu cuenta ha sido suspendida por el administrador de tu organización.
            </AlertDescription>
          </Alert>

          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Posibles razones de suspensión:</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Incumplimiento de términos y condiciones</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Actividad inusual o sospechosa detectada</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Problemas de pago o suscripción vencida</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Solicitud del administrador de tu organización</span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-3">¿Cómo recuperar el acceso?</h3>
            <div className="space-y-3 text-sm text-blue-800">
              <div className="flex items-start">
                <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mr-3 mt-0.5">
                  1
                </div>
                <p>Contacta al administrador de tu organización para conocer el motivo de la suspensión</p>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mr-3 mt-0.5">
                  2
                </div>
                <p>Resuelve cualquier problema pendiente (pago, verificación, etc.)</p>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mr-3 mt-0.5">
                  3
                </div>
                <p>Solicita la reactivación de tu cuenta</p>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
            <Button className="w-full" variant="outline" asChild>
              <a href="mailto:soporte@salacliente.com" className="flex items-center justify-center">
                <Mail className="mr-2 h-4 w-4" />
                Contactar Soporte
              </a>
            </Button>
            <Button className="w-full" variant="outline" asChild>
              <a 
                href="https://wa.me/525512345678?text=Hola,%20mi%20cuenta%20fue%20suspendida" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp
              </a>
            </Button>
          </div>

          <Link href="/login" className="text-sm text-gray-600 hover:underline">
            Volver al inicio de sesión
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

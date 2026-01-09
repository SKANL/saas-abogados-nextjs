"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ExternalLink, FileText, Mail, User } from "lucide-react"

export function HelpContent() {
  return (
    <div className="space-y-8">
      {/* Quick Start */}
      <Card>
        <CardHeader>
          <CardTitle>Inicio Rápido</CardTitle>
          <CardDescription>
            Comienza a crear salas de bienvenida en 3 pasos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                1
              </div>
              <div>
                <h4 className="font-medium">Crea plantillas</h4>
                <p className="text-sm text-muted-foreground">
                  Sube un contrato en PDF y crea cuestionarios personalizados en
                  la sección "Plantillas"
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                2
              </div>
              <div>
                <h4 className="font-medium">Configura una sala</h4>
                <p className="text-sm text-muted-foreground">
                  Ve a "Clientes" y crea una nueva sala seleccionando tus
                  plantillas
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                3
              </div>
              <div>
                <h4 className="font-medium">Comparte el enlace</h4>
                <p className="text-sm text-muted-foreground">
                  Envía el enlace único a tu cliente para que complete su
                  onboarding
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Preguntas Frecuentes</CardTitle>
          <CardDescription>
            Encuentra respuestas a las preguntas más comunes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="templates">
              <AccordionTrigger>
                ¿Cómo creo una nueva plantilla de contrato?
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <p>
                    1. Ve a la sección "Plantillas" en el menú lateral
                  </p>
                  <p>
                    2. Haz clic en "Contratos"
                  </p>
                  <p>
                    3. Presiona el botón "Nueva Plantilla"
                  </p>
                  <p>
                    4. Completa el nombre y sube tu archivo PDF
                  </p>
                  <p>
                    5. Haz clic en "Subir Plantilla"
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="questionnaires">
              <AccordionTrigger>
                ¿Cómo creo un cuestionario personalizado?
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <p>
                    1. Ve a "Plantillas" → "Cuestionarios"
                  </p>
                  <p>
                    2. Presiona "Nuevo Cuestionario"
                  </p>
                  <p>
                    3. Asigna un nombre descriptivo
                  </p>
                  <p>
                    4. Agrega preguntas usando diferentes tipos: texto corto,
                    texto largo, selección, etc.
                  </p>
                  <p>
                    5. Marca las preguntas como requeridas si es necesario
                  </p>
                  <p>
                    6. Guarda tu cuestionario
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="expiration">
              <AccordionTrigger>
                ¿Puedo modificar la fecha de expiración de un enlace?
              </AccordionTrigger>
              <AccordionContent>
                <p>
                  Sí. En la sección "Configuración" puedes ajustar el período de
                  expiración para todas las nuevas salas. Los enlaces existentes
                  mantendrán su fecha original de expiración.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="documents">
              <AccordionTrigger>
                ¿Qué tipos de documentos pueden subir los clientes?
              </AccordionTrigger>
              <AccordionContent>
                <p>
                  Los clientes pueden subir: PDF, imágenes (JPG, PNG), y
                  documentos de Office (DOCX, XLSX). El tamaño máximo por
                  archivo es 10MB.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="privacy">
              <AccordionTrigger>
                ¿Dónde se almacenan los datos de mis clientes?
              </AccordionTrigger>
              <AccordionContent>
                <p>
                  Todos los datos se almacenan de forma segura en servidores
                  cifrados de Supabase. Cumplimos con GDPR, CCPA y regulaciones
                  locales de protección de datos.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="export">
              <AccordionTrigger>
                ¿Puedo exportar los datos de los clientes?
              </AccordionTrigger>
              <AccordionContent>
                <p>
                  Sí. Desde la sección "Expediente" de cada cliente, puedes
                  descargar todos sus documentos, respuestas y firma digital en
                  formato PDF.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="support">
              <AccordionTrigger>
                ¿Cómo contacto a soporte si tengo un problema?
              </AccordionTrigger>
              <AccordionContent>
                <p>
                  Puedes escribirnos a support@salacliente.com o usar el chat
                  dentro de la aplicación. Respondemos dentro de 24 horas en
                  días hábiles.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Recursos Útiles</CardTitle>
          <CardDescription>
            Documentación y enlaces útiles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start" asChild>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <FileText className="mr-2 h-4 w-4" />
              Documentación Completa
              <ExternalLink className="ml-auto h-4 w-4" />
            </a>
          </Button>

          <Button variant="outline" className="w-full justify-start" asChild>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <Mail className="mr-2 h-4 w-4" />
              Contactar a Soporte
              <ExternalLink className="ml-auto h-4 w-4" />
            </a>
          </Button>

          <Button variant="outline" className="w-full justify-start" asChild>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <User className="mr-2 h-4 w-4" />
              Mi Cuenta
              <ExternalLink className="ml-auto h-4 w-4" />
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">💡 Consejos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            • Usa nombres descriptivos para tus plantillas para encontrarlas
            fácilmente
          </p>
          <p>
            • Agrega un calendario de disponibilidad para que clientes puedan
            agendar citas
          </p>
          <p>
            • Personaliza tu firma en la configuración para una imagen
            profesional
          </p>
          <p>
            • Revisa regularmente los expedientes para mantener todo organizado
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

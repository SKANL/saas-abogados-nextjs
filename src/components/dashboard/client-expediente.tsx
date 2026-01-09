"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Copy,
  Send,
  Download,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Mail,
  Calendar,
  Loader2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useClient } from "@/hooks/use-clients"
import type { Client as ClientType } from "@/lib/supabase/database.types"

interface ClientExpedienteProps {
  clientId: string
}

type ClientStatus = "completed" | "pending" | "expired"

interface ClientDocument {
  name: string
  uploadedAt: string
  size: string
}

interface QuestionAnswer {
  question: string
  answer: string
}

const statusConfig: Record<ClientStatus, { label: string; variant: "default" | "secondary" | "destructive"; icon: typeof CheckCircle }> = {
  completed: { label: "Completado", variant: "default", icon: CheckCircle },
  pending: { label: "Pendiente", variant: "secondary", icon: Clock },
  expired: { label: "Expirado", variant: "destructive", icon: AlertCircle },
}

export function ClientExpediente({ clientId }: ClientExpedienteProps) {
  const { client, loading, error } = useClient(clientId)
  
  // TODO: Fetch documents and answers from API
  const documents: ClientDocument[] = []
  const questionnaire: QuestionAnswer[] = []
  
  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }
  
  if (error || !client) {
    return (
      <div className="flex min-h-100 items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground">No se pudo cargar el cliente</p>
        <Button asChild variant="outline">
          <Link href="/clientes">Volver a clientes</Link>
        </Button>
      </div>
    )
  }

  return <ClientExpedienteContent client={client} documents={documents} questionnaire={questionnaire} />
}

function ClientExpedienteContent({ 
  client, 
  documents, 
  questionnaire 
}: { 
  client: ClientType
  documents: ClientDocument[]
  questionnaire: QuestionAnswer[]
}) {
  const clientStatus = (client.status as ClientStatus) || 'pending'
  const status = statusConfig[clientStatus] || statusConfig.pending
  const portalLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/sala/${client.id}` 
    : ''

  const handleCopyLink = () => {
    navigator.clipboard.writeText(portalLink)
    // TODO: Show toast notification
  }

  const handleSendReminder = () => {
    // TODO: Implement send reminder
    console.log("Send reminder to:", client.client_email)
  }

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/clientes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{client.client_name}</h1>
            <p className="text-sm text-muted-foreground">{client.client_email || client.case_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={status.variant}>
            <status.icon className="mr-1 h-3 w-3" />
            {status.label}
          </Badge>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={handleCopyLink}>
          <Copy className="mr-2 h-4 w-4" />
          Copiar enlace
        </Button>
        {clientStatus === "pending" && (
          <Button variant="outline" size="sm" onClick={handleSendReminder}>
            <Send className="mr-2 h-4 w-4" />
            Enviar recordatorio
          </Button>
        )}
        {clientStatus === "completed" && (
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Descargar expediente
          </Button>
        )}
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList>
          <TabsTrigger value="info">Información</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="questionnaire">Cuestionario</TabsTrigger>
          <TabsTrigger value="consent">Consentimiento</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Datos del Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Nombre</p>
                    <p className="font-medium">{client.client_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Correo</p>
                    <p className="font-medium">{client.client_email || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de creación</p>
                    <p className="font-medium">
                      {client.created_at 
                        ? new Date(client.created_at).toLocaleDateString("es-MX")
                        : "—"}
                    </p>
                  </div>
                </div>
                {client.completed_at && (
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha de completado</p>
                      <p className="font-medium">
                        {new Date(client.completed_at).toLocaleDateString("es-MX")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Documentos Subidos</CardTitle>
              <CardDescription>
                Documentos proporcionados por el cliente
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay documentos subidos aún
                </p>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.uploadedAt} · {doc.size}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questionnaire" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Respuestas del Cuestionario</CardTitle>
            </CardHeader>
            <CardContent>
              {questionnaire.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay respuestas de cuestionario
                </p>
              ) : (
                <div className="space-y-4">
                  {questionnaire.map((qa, index) => (
                    <div key={index}>
                      <p className="text-sm font-medium text-muted-foreground">
                        {qa.question}
                      </p>
                      <p className="mt-1">{qa.answer}</p>
                      {index < questionnaire.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consent" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Consentimiento Firmado</CardTitle>
            </CardHeader>
            <CardContent>
              {client.signature_timestamp ? (
                <div className="space-y-4">
                  <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Consentimiento aceptado</span>
                    </div>
                    <p className="mt-2 text-sm text-green-600">
                      Firmado el {new Date(client.signature_timestamp).toLocaleDateString("es-MX")}
                    </p>
                  </div>
                  {client.signature_data && typeof client.signature_data === 'object' && 'typed_name' in client.signature_data && (
                    <div>
                      <p className="text-sm text-muted-foreground">Nombre escrito como firma:</p>
                      <p className="mt-1 text-lg font-medium italic">
                        {(client.signature_data as { typed_name?: string }).typed_name}
                      </p>
                    </div>
                  )}
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Descargar PDF de consentimiento
                  </Button>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  El cliente aún no ha firmado el consentimiento
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

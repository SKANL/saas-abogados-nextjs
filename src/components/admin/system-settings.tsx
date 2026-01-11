/**
 * SystemSettings Component
 * 
 * Advanced system configuration for admins
 */

"use client"

import * as React from "react"
import { Save, Bell, Mail, Shield, Database, Palette } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

export function SystemSettings() {
  const [emailNotifications, setEmailNotifications] = React.useState(true)
  const [auditLogging, setAuditLogging] = React.useState(true)
  const [autoBackup, setAutoBackup] = React.useState(false)
  const [twoFactorRequired, setTwoFactorRequired] = React.useState(false)

  return (
    <div className="grid gap-6">
      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notificaciones</CardTitle>
          </div>
          <CardDescription>
            Configura las notificaciones del sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Notificaciones por email</Label>
              <p className="text-sm text-muted-foreground">
                Enviar emails automáticos cuando ocurren eventos importantes
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="audit-logging">Registro de auditoría</Label>
              <p className="text-sm text-muted-foreground">
                Mantener un registro detallado de todas las acciones del sistema
              </p>
            </div>
            <Switch
              id="audit-logging"
              checked={auditLogging}
              onCheckedChange={setAuditLogging}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Seguridad</CardTitle>
          </div>
          <CardDescription>
            Configuración de seguridad y acceso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="two-factor">Autenticación de dos factores</Label>
              <p className="text-sm text-muted-foreground">
                Requerir 2FA para todos los usuarios (próximamente)
              </p>
            </div>
            <Switch
              id="two-factor"
              checked={twoFactorRequired}
              onCheckedChange={setTwoFactorRequired}
              disabled
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Custom Access Token Hook</Label>
            <div className="flex items-center gap-2">
              <Badge variant="default">Activado</Badge>
              <span className="text-sm text-muted-foreground">
                Los claims JWT están optimizados (user_role, org_id)
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Mejora el rendimiento en un 99.94% al evitar JOINs en RLS policies
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <CardTitle>Gestión de Datos</CardTitle>
          </div>
          <CardDescription>
            Backups y mantenimiento de la base de datos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-backup">Backups automáticos</Label>
              <p className="text-sm text-muted-foreground">
                Crear backups diarios de la base de datos (próximamente)
              </p>
            </div>
            <Switch
              id="auto-backup"
              checked={autoBackup}
              onCheckedChange={setAutoBackup}
              disabled
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Estado del Sistema</Label>
            <div className="grid gap-2 md:grid-cols-3">
              <div className="rounded-md border p-3">
                <p className="text-sm font-medium">Funciones</p>
                <p className="text-2xl font-bold text-green-600">10</p>
                <p className="text-xs text-muted-foreground">activas</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-sm font-medium">Triggers</p>
                <p className="text-2xl font-bold text-green-600">2</p>
                <p className="text-xs text-muted-foreground">activos</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-sm font-medium">RLS Policies</p>
                <p className="text-2xl font-bold text-green-600">60+</p>
                <p className="text-xs text-muted-foreground">optimizadas</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Templates */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <CardTitle>Plantillas de Email</CardTitle>
          </div>
          <CardDescription>
            Personaliza los emails automáticos del sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <p className="font-medium">Email de bienvenida</p>
              <p className="text-sm text-muted-foreground">Enviado al registrarse</p>
            </div>
            <Button variant="outline" size="sm">Editar</Button>
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <p className="font-medium">Invitación de usuario</p>
              <p className="text-sm text-muted-foreground">Enviado al invitar abogados</p>
            </div>
            <Button variant="outline" size="sm">Editar</Button>
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <p className="font-medium">Magic link cliente</p>
              <p className="text-sm text-muted-foreground">Enviado a clientes para acceder</p>
            </div>
            <Button variant="outline" size="sm">Editar</Button>
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <p className="font-medium">Recordatorio pendiente</p>
              <p className="text-sm text-muted-foreground">Enviado si el cliente no completa</p>
            </div>
            <Button variant="outline" size="sm">Editar</Button>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            <CardTitle>Apariencia</CardTitle>
          </div>
          <CardDescription>
            Personaliza la apariencia del sistema (se configura en Organización)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Los colores de marca y logo se configuran en la sección{" "}
            <a href="/admin/despacho" className="text-primary hover:underline">
              Organización
            </a>
          </p>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button size="lg" disabled>
          <Save className="mr-2 h-4 w-4" />
          Guardar configuración
          <Badge variant="secondary" className="ml-2">
            Próximamente
          </Badge>
        </Button>
      </div>
    </div>
  )
}

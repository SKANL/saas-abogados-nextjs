"use client"

import Link from "next/link"
import {
  ArrowLeft,
  Building2,
  Mail,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Ban,
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

interface UserDetailProps {
  userId: string
}

export function UserDetail({ userId }: UserDetailProps) {
  // TODO: Fetch user data from API using userId
  const user: any = null
  
  if (!user) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Cargando datos del usuario...</p>
      </div>
    )
  }

  const handleToggleStatus = () => {
    // TODO: Implement status toggle
    console.log("Toggle status for user:", userId)
  }

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/usuarios">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{user.firmName}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={user.status === "active" ? "default" : "secondary"}>
            {user.status === "active" ? (
              <CheckCircle className="mr-1 h-3 w-3" />
            ) : (
              <XCircle className="mr-1 h-3 w-3" />
            )}
            {user.status === "active" ? "Activo" : "Inactivo"}
          </Badge>
          <Badge variant={user.plan === "pro" ? "default" : "outline"}>
            {user.plan === "pro" ? "Pro" : "Free"}
          </Badge>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggleStatus}
        >
          {user.status === "active" ? (
            <>
              <Ban className="mr-2 h-4 w-4" />
              Desactivar cuenta
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Activar cuenta
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Despacho</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Nombre</p>
                <p className="font-medium">{user.firmName}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Correo</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Fecha de registro</p>
                <p className="font-medium">{user.createdAt}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Último acceso</p>
                <p className="font-medium">{user.lastLogin}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas de Uso</CardTitle>
            <CardDescription>
              Métricas de actividad del usuario
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-4 text-center">
                <Users className="mx-auto h-6 w-6 text-muted-foreground" />
                <p className="mt-2 text-2xl font-bold">{user.clientsCount}</p>
                <p className="text-xs text-muted-foreground">Clientes totales</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <CheckCircle className="mx-auto h-6 w-6 text-green-600" />
                <p className="mt-2 text-2xl font-bold">{user.salasCompleted}</p>
                <p className="text-xs text-muted-foreground">Salas completadas</p>
              </div>
            </div>
            <div className="mt-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tasa de completado</span>
                <span className="font-bold">
                  {Math.round((user.salasCompleted / user.salasCreated) * 100)}%
                </span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-green-600"
                  style={{
                    width: `${(user.salasCompleted / user.salasCreated) * 100}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

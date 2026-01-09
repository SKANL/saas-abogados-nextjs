"use client"

import Link from "next/link"
import { CheckCircle, Clock, ArrowRight, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useClients } from "@/hooks"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export function RecentClients() {
  const { clients, loading } = useClients({ pageSize: 5 })

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Actividad Reciente</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/clientes">
            Ver todos
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4">
        {(!clients || clients.length === 0) ? (
          <p className="text-center text-sm text-muted-foreground py-4">
            No hay clientes recientes
          </p>
        ) : (
          clients.slice(0, 5).map((client) => (
            <Link
              key={client.id}
              href={`/clientes/${client.id}`}
              className="flex items-center gap-4 rounded-lg p-2 transition-colors hover:bg-muted"
            >
              <Avatar>
                <AvatarFallback>
                  {client.client_name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2) || "??"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">{client.client_name}</p>
                <p className="text-xs text-muted-foreground">
                  {client.created_at 
                    ? formatDistanceToNow(new Date(client.created_at), {
                        addSuffix: true,
                        locale: es,
                      })
                    : "—"}
                </p>
              </div>
              {client.status === "completed" ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <Clock className="h-4 w-4 text-muted-foreground" />
              )}
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  )
}

"use client"

import * as React from "react"
import {
  LogIn,
  UserPlus,
  FileText,
  Settings,
  Mail,
  Eye,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type ActionType = "login" | "register" | "create_sala" | "update_profile" | "send_email" | "view_client"

interface AuditLog {
  id: string
  userId: string
  userName: string
  action: ActionType
  details: string
  ip: string
  timestamp: string
}

const actionConfig: Record<ActionType, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  login: { label: "Inicio sesión", icon: LogIn, color: "bg-blue-100 text-blue-700" },
  register: { label: "Registro", icon: UserPlus, color: "bg-green-100 text-green-700" },
  create_sala: { label: "Crear sala", icon: FileText, color: "bg-purple-100 text-purple-700" },
  update_profile: { label: "Actualizar perfil", icon: Settings, color: "bg-orange-100 text-orange-700" },
  send_email: { label: "Enviar correo", icon: Mail, color: "bg-pink-100 text-pink-700" },
  view_client: { label: "Ver cliente", icon: Eye, color: "bg-gray-100 text-gray-700" },
}

export function AuditLogsTable() {
  const [search, setSearch] = React.useState("")
  const [actionFilter, setActionFilter] = React.useState<string>("all")
  // TODO: Fetch audit logs from API
  const logs: AuditLog[] = []

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase())
    const matchesAction = actionFilter === "all" || log.action === actionFilter
    return matchesSearch && matchesAction
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Input
          placeholder="Buscar en logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por acción" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las acciones</SelectItem>
            {Object.entries(actionConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Acción</TableHead>
              <TableHead>Detalles</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>Fecha/Hora</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No se encontraron registros
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => {
                const actionInfo = actionConfig[log.action]
                return (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.userName}</TableCell>
                    <TableCell>
                      <Badge className={actionInfo.color} variant="secondary">
                        <actionInfo.icon className="mr-1 h-3 w-3" />
                        {actionInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {log.details}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{log.ip}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.timestamp}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

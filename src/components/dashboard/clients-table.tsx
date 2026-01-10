"use client"

import * as React from "react"
import Link from "next/link"
import {
  MoreHorizontal,
  Eye,
  Copy,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { useClients } from "@/hooks"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

type ClientStatus = 'pending' | 'completed' | 'expired'

const statusConfig: Record<ClientStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ComponentType<{ className?: string }> }> = {
  completed: {
    label: "Completado",
    variant: "default",
    icon: CheckCircle,
  },
  pending: {
    label: "Pendiente",
    variant: "secondary",
    icon: Clock,
  },
  expired: {
    label: "Expirado",
    variant: "destructive",
    icon: AlertCircle,
  },
}

export function ClientsTable() {
  const [search, setSearch] = React.useState("")
  const [deleteDialog, setDeleteDialog] = React.useState<{ open: boolean; clientId: string; clientName: string }>({ 
    open: false, 
    clientId: "", 
    clientName: "" 
  })
  const { clients, loading, remove } = useClients()
  
  const filteredClients = React.useMemo(() => {
    if (!clients) return []
    return clients.filter(
      (client) =>
        client.client_name?.toLowerCase().includes(search.toLowerCase()) ||
        client.client_email?.toLowerCase().includes(search.toLowerCase()) ||
        client.case_name?.toLowerCase().includes(search.toLowerCase())
    )
  }, [clients, search])

  const handleCopyLink = async (client: any) => {
    // Get the magic link token from client_links
    const clientLinks = client.client_links
    if (!clientLinks || clientLinks.length === 0) {
      alert("Este cliente no tiene un enlace generado. Por favor, contacta al soporte.")
      return
    }
    
    // Get the first active (non-revoked) link
    const activeLink = clientLinks.find((link: any) => !link.revoked_at)
    if (!activeLink) {
      alert("No hay enlaces activos para este cliente.")
      return
    }
    
    const url = `${window.location.origin}/sala/${activeLink.magic_link_token}`
    await navigator.clipboard.writeText(url)
    // TODO: Show toast notification
    alert("Enlace copiado al portapapeles")
  }

  const handleDeleteClick = (clientId: string, clientName: string) => {
    setDeleteDialog({ open: true, clientId, clientName })
  }

  const handleDeleteConfirm = async () => {
    const { clientId } = deleteDialog
    setDeleteDialog({ open: false, clientId: "", clientName: "" })
    
    const loadingToast = toast.loading("Eliminando sala...")
    const success = await remove(clientId)
    toast.dismiss(loadingToast)
    
    if (success) {
      toast.success("Sala eliminada correctamente")
    } else {
      toast.error("Error al eliminar la sala")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Buscar clientes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Button asChild>
          <Link href="/clientes/nuevo">Nueva Sala</Link>
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha creación</TableHead>
              <TableHead>Completado</TableHead>
              <TableHead className="w-17.5"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No se encontraron clientes
                </TableCell>
              </TableRow>
            ) : (
              filteredClients.map((client) => {
                const clientStatus = (client.status as ClientStatus) || 'pending'
                const status = statusConfig[clientStatus] || statusConfig.pending
                return (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{client.client_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {client.client_email || client.case_name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>
                        <status.icon className="mr-1 h-3 w-3" />
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {client.created_at 
                        ? new Date(client.created_at).toLocaleDateString("es-MX")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {client.completed_at 
                        ? new Date(client.completed_at).toLocaleDateString("es-MX")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Acciones</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/clientes/${client.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver expediente
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopyLink(client)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copiar enlace
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(client.id, client.client_name)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar sala?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar la sala de <strong>{deleteDialog.clientName}</strong>.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

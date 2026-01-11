"use client"

import * as React from "react"
import Link from "next/link"
import {
  MoreHorizontal,
  Eye,
  UserX,
  UserCheck,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react"

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
import { useToast } from "@/hooks/use-toast"
import type { UserWithOrganization } from "@/lib/services/admin.service"

export function UsersTable() {
  const [search, setSearch] = React.useState("")
  const [users, setUsers] = React.useState<UserWithOrganization[]>([])
  const [loading, setLoading] = React.useState(true)
  const [updating, setUpdating] = React.useState<string | null>(null)
  const { toast } = useToast()

  // Fetch users on mount
  React.useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users')
      
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los usuarios',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.firm_name?.toLowerCase().includes(search.toLowerCase()) ||
      user.user_id?.toLowerCase().includes(search.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  async function handleToggleStatus(userId: string, currentStatus: string) {
    try {
      setUpdating(userId)
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active'
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update user status')
      }

      toast({
        title: 'Éxito',
        description: `Usuario ${newStatus === 'active' ? 'activado' : 'suspendido'} correctamente`,
      })

      // Refresh users list
      await fetchUsers()
    } catch (error) {
      console.error('Error updating user status:', error)
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado del usuario',
        variant: 'destructive',
      })
    } finally {
      setUpdating(null)
    }
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return 'Nunca'
    const date = new Date(dateString)
    return new Intl.RelativeTimeFormat('es', { numeric: 'auto' }).format(
      Math.round((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Input
          placeholder="Buscar usuarios..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
          disabled={loading}
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Despacho</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead className="text-center">Clientes</TableHead>
              <TableHead>Último acceso</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Cargando usuarios...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No se encontraron usuarios
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.firm_name || 'Sin nombre'}</div>
                      <div className="text-sm text-muted-foreground">
                        {user.full_name || 'Sin email'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' || user.role === 'super_admin' ? 'default' : 'outline'}>
                      {user.role === 'super_admin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'Abogado'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.status === 'active' ? 'default' : user.status === 'suspended' ? 'destructive' : 'secondary'}
                    >
                      {user.status === 'active' ? (
                        <>
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Activo
                        </>
                      ) : user.status === 'suspended' ? (
                        <>
                          <XCircle className="mr-1 h-3 w-3" />
                          Suspendido
                        </>
                      ) : (
                        'Pendiente'
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.subscription_plan === 'pro' ? 'default' : 'outline'}>
                      {user.subscription_plan === 'pro' ? 'Pro' : user.subscription_plan === 'enterprise' ? 'Enterprise' : 'Free'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{user.clients_count || 0}</TableCell>
                  <TableCell>{formatDate(user.last_login_at)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={updating === user.user_id}>
                          {updating === user.user_id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreHorizontal className="h-4 w-4" />
                          )}
                          <span className="sr-only">Acciones</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/usuarios/${user.user_id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalles
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            if (user.user_id && user.status) {
                              handleToggleStatus(user.user_id, user.status)
                            }
                          }}
                          disabled={!user.user_id || !user.status}
                        >
                          {user.status === 'active' ? (
                            <>
                              <UserX className="mr-2 h-4 w-4" />
                              Suspender
                            </>
                          ) : (
                            <>
                              <UserCheck className="mr-2 h-4 w-4" />
                              Activar
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

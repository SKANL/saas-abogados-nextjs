/**
 * InviteUserDialog Component
 * 
 * Modal dialog for inviting new users to the organization
 */

"use client"

import * as React from "react"
import { Loader2, Mail } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

const inviteSchema = z.object({
  email: z.string().email('Email inválido'),
  role: z.enum(['lawyer', 'admin']),
})

type InviteFormData = {
  email: string
  role: 'lawyer' | 'admin'
}

interface InviteUserDialogProps {
  organizationId: string
  onInviteSuccess?: () => void
  trigger?: React.ReactNode
}

export function InviteUserDialog({ 
  organizationId, 
  onInviteSuccess,
  trigger 
}: InviteUserDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      role: 'lawyer',
    },
  })

  const selectedRole = watch('role')

  async function onSubmit(data: InviteFormData) {
    try {
      setLoading(true)

      const response = await fetch('/api/invitations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          role: data.role,
          organization_id: organizationId,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create invitation')
      }

      toast({
        title: '¡Invitación enviada!',
        description: `Se envió una invitación a ${data.email}`,
      })

      reset()
      setOpen(false)
      
      if (onInviteSuccess) {
        onInviteSuccess()
      }
    } catch (error) {
      console.error('Error creating invitation:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo enviar la invitación',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Mail className="mr-2 h-4 w-4" />
            Invitar Usuario
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Invitar nuevo usuario</DialogTitle>
            <DialogDescription>
              Envía una invitación a un nuevo abogado o administrador para unirse a tu organización.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="abogado@despacho.com"
                {...register('email')}
                disabled={loading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">
                Rol <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedRole}
                onValueChange={(value) => setValue('role', value as 'lawyer' | 'admin')}
                disabled={loading}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lawyer">
                    <div>
                      <div className="font-medium">Abogado</div>
                      <div className="text-xs text-muted-foreground">
                        Puede crear y gestionar sus propias salas de clientes
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div>
                      <div className="font-medium">Administrador</div>
                      <div className="text-xs text-muted-foreground">
                        Acceso completo: gestión de usuarios, plantillas y configuración
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-destructive">{errors.role.message}</p>
              )}
            </div>

            <div className="rounded-md bg-muted p-3 text-sm">
              <p className="font-medium mb-1">¿Qué sucede después?</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Se envía un email con un enlace de invitación</li>
                <li>El enlace es válido por 7 días</li>
                <li>El usuario crea su cuenta usando el enlace</li>
                <li>Automáticamente se une a tu organización</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar invitación
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

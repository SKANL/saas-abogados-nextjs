/**
 * OrganizationSettings Component
 * 
 * Displays organization details, usage stats, and allows editing
 */

"use client"

import * as React from "react"
import { Loader2, Building2, Users, FileText, HardDrive, Save } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

const organizationSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  tax_id: z.string().optional(),
  billing_address: z.string().optional(),
  logo_url: z.string().url('URL inválida').optional().or(z.literal('')),
  primary_color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color inválido (formato: #RRGGBB)').optional().or(z.literal('')),
  secondary_color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color inválido (formato: #RRGGBB)').optional().or(z.literal('')),
})

type OrganizationFormData = z.infer<typeof organizationSchema>

interface Organization {
  id: string
  name: string
  slug: string
  tax_id: string | null
  billing_address: string | null
  logo_url: string | null
  primary_color: string | null
  secondary_color: string | null
  subscription_plan: string
  max_lawyers: number | null
  max_clients_per_lawyer: number | null
  max_storage_gb: number | null
  status: string
}

interface OrganizationStats {
  lawyers_count: number
  clients_count: number
  storage_used_mb: number
}

export function OrganizationSettings() {
  const [organization, setOrganization] = React.useState<Organization | null>(null)
  const [stats, setStats] = React.useState<OrganizationStats | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
  })

  // Fetch organization and stats
  React.useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/admin/organization')
        
        if (!response.ok) {
          throw new Error('Failed to fetch organization')
        }

        const data = await response.json()
        setOrganization(data.organization)
        setStats(data.stats)
        
        // Populate form with current values
        reset({
          name: data.organization.name,
          tax_id: data.organization.tax_id || '',
          billing_address: data.organization.billing_address || '',
          logo_url: data.organization.logo_url || '',
          primary_color: data.organization.primary_color || '',
          secondary_color: data.organization.secondary_color || '',
        })
      } catch (error) {
        console.error('Error fetching organization:', error)
        toast({
          title: 'Error',
          description: 'No se pudo cargar la información de la organización',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [reset, toast])

  async function onSubmit(data: OrganizationFormData) {
    try {
      setSaving(true)

      const response = await fetch('/api/admin/organization', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to update organization')
      }

      const result = await response.json()
      setOrganization(result.organization)

      toast({
        title: '¡Guardado!',
        description: 'La información de la organización se actualizó correctamente',
      })
    } catch (error) {
      console.error('Error updating organization:', error)
      toast({
        title: 'Error',
        description: 'No se pudo guardar la información',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!organization) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No se encontró información de la organización</p>
        </CardContent>
      </Card>
    )
  }

  const planName = organization.subscription_plan === 'professional' ? 'Professional' : 
                   organization.subscription_plan === 'enterprise' ? 'Enterprise' : 'Free'
  
  const storageUsedPercentage = stats && organization.max_storage_gb 
    ? Math.round((stats.storage_used_mb / (organization.max_storage_gb * 1024)) * 100)
    : 0

  return (
    <div className="grid gap-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plan Activo</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{planName}</div>
            <p className="text-xs text-muted-foreground">
              {organization.status === 'active' ? 'Activo' : organization.status}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abogados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.lawyers_count || 0}</div>
            <p className="text-xs text-muted-foreground">
              {organization.max_lawyers 
                ? `de ${organization.max_lawyers} máximo` 
                : 'ilimitados'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.clients_count || 0}</div>
            <p className="text-xs text-muted-foreground">
              {organization.max_clients_per_lawyer 
                ? `${organization.max_clients_per_lawyer} por abogado` 
                : 'ilimitados'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Almacenamiento</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.storage_used_mb ? `${Math.round(stats.storage_used_mb / 1024)} GB` : '0 GB'}
            </div>
            <p className="text-xs text-muted-foreground">
              {organization.max_storage_gb 
                ? `de ${organization.max_storage_gb} GB (${storageUsedPercentage}%)` 
                : 'ilimitado'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Organization Details Form */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la Organización</CardTitle>
          <CardDescription>
            Actualiza los detalles de tu organización
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nombre de la organización <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  {...register('name')}
                  disabled={saving}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL amigable)</Label>
                <Input
                  id="slug"
                  value={organization.slug}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  No se puede modificar después de la creación
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax_id">RFC / Tax ID</Label>
                <Input
                  id="tax_id"
                  {...register('tax_id')}
                  placeholder="XAXX010101000"
                  disabled={saving}
                />
                {errors.tax_id && (
                  <p className="text-sm text-destructive">{errors.tax_id.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="billing_address">Dirección fiscal</Label>
                <Input
                  id="billing_address"
                  {...register('billing_address')}
                  placeholder="Calle, Ciudad, Estado, CP"
                  disabled={saving}
                />
                {errors.billing_address && (
                  <p className="text-sm text-destructive">{errors.billing_address.message}</p>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-4">Personalización</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="logo_url">URL del logo</Label>
                  <Input
                    id="logo_url"
                    {...register('logo_url')}
                    placeholder="https://example.com/logo.png"
                    disabled={saving}
                  />
                  {errors.logo_url && (
                    <p className="text-sm text-destructive">{errors.logo_url.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primary_color">Color primario</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary_color"
                      {...register('primary_color')}
                      placeholder="#3B82F6"
                      disabled={saving}
                    />
                    <input
                      type="color"
                      className="h-10 w-14 cursor-pointer rounded border"
                      {...register('primary_color')}
                      disabled={saving}
                    />
                  </div>
                  {errors.primary_color && (
                    <p className="text-sm text-destructive">{errors.primary_color.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondary_color">Color secundario</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary_color"
                      {...register('secondary_color')}
                      placeholder="#10B981"
                      disabled={saving}
                    />
                    <input
                      type="color"
                      className="h-10 w-14 cursor-pointer rounded border"
                      {...register('secondary_color')}
                      disabled={saving}
                    />
                  </div>
                  {errors.secondary_color && (
                    <p className="text-sm text-destructive">{errors.secondary_color.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Guardar cambios
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

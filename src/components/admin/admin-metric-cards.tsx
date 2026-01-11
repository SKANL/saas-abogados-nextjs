"use client"

import { Users, Building2, FileText, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface Metric {
  title: string
  value: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

export function AdminMetricCards() {
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await fetch('/api/admin/organization')
        if (response.ok) {
          const data = await response.json()
          const { organization, stats } = data

          setMetrics([
            {
              title: "Plan Activo",
              value: organization.subscription_plan === 'professional' ? 'Professional' : 
                     organization.subscription_plan === 'enterprise' ? 'Enterprise' : 'Free',
              description: organization.status === 'active' ? 'Activo' : organization.status,
              icon: Building2,
            },
            {
              title: "Abogados",
              value: String(stats.lawyers_count || 0),
              description: organization.max_lawyers 
                ? `de ${organization.max_lawyers} máximo` 
                : 'ilimitados',
              icon: Users,
            },
            {
              title: "Clientes Totales",
              value: String(stats.clients_count || 0),
              description: organization.max_clients_per_lawyer 
                ? `${organization.max_clients_per_lawyer} por abogado` 
                : 'ilimitados',
              icon: FileText,
            },
            {
              title: "Almacenamiento",
              value: stats.storage_used_mb ? `${Math.round(stats.storage_used_mb / 1024)} GB` : '0 GB',
              description: organization.max_storage_gb 
                ? `de ${organization.max_storage_gb} GB` 
                : 'ilimitado',
              icon: TrendingUp,
            },
          ])
        }
      } catch (error) {
        console.error('Error fetching metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-4 lg:px-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-4 lg:px-6">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {metric.title}
            </CardTitle>
            <metric.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-xs text-muted-foreground">
              {metric.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

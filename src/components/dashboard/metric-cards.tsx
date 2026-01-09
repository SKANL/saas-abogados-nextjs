"use client"

import { Users, FileCheck, Clock, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDashboardStats } from "@/hooks"

interface Metric {
  title: string
  value: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function MetricCards() {
  const { stats, loading } = useDashboardStats()

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const completionRate = stats?.total ? Math.round((stats.completed / stats.total) * 100) : 0

  const metrics: Metric[] = [
    {
      title: "Total Clientes",
      value: stats?.total.toString() || "0",
      description: "Total de salas creadas",
      icon: Users,
    },
    {
      title: "Completadas",
      value: stats?.completed.toString() || "0",
      description: "Salas finalizadas",
      icon: FileCheck,
    },
    {
      title: "Pendientes",
      value: stats?.pending.toString() || "0",
      description: "En proceso",
      icon: Clock,
    },
    {
      title: "Tasa Completado",
      value: `${completionRate}%`,
      description: "% de salas completadas",
      icon: TrendingUp,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

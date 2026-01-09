import { Users, Building2, Activity, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

export function AdminMetricCards() {
  // TODO: Fetch admin metrics from API
  const metrics: Metric[] = []
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
              {metric.trend && (
                <span
                  className={
                    metric.trend.isPositive
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {metric.trend.isPositive ? "+" : "-"}
                  {metric.trend.value}%{" "}
                </span>
              )}
              {metric.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

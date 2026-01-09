import { MetricCards } from "@/components/dashboard/metric-cards"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { RecentClients } from "@/components/dashboard/recent-clients"

// Force dynamic rendering since this page uses client-side data fetching
export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Panel Principal</h1>
        <p className="text-muted-foreground">
          Bienvenido de vuelta. Aquí tienes un resumen de tu actividad.
        </p>
      </div>
      <MetricCards />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentClients />
        </div>
        <QuickActions />
      </div>
    </div>
  )
}

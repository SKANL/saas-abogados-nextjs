import { AdminMetricCards } from "@/components/admin/admin-metric-cards"
import { AdminRecentActivity } from "@/components/admin/admin-recent-activity"

export default function AdminPage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-2xl font-semibold">Panel de Administración</h1>
        <p className="text-muted-foreground text-sm">
          Vista general del sistema
        </p>
      </div>
      <AdminMetricCards />
      <div className="px-4 lg:px-6">
        <AdminRecentActivity />
      </div>
    </div>
  )
}

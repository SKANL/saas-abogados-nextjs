import { AuditLogsTable } from "@/components/admin/audit-logs-table"

export default function AuditoriaPage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-2xl font-semibold">Auditoría</h1>
        <p className="text-muted-foreground text-sm">
          Registro de actividades del sistema
        </p>
      </div>
      <div className="px-4 lg:px-6">
        <AuditLogsTable />
      </div>
    </div>
  )
}

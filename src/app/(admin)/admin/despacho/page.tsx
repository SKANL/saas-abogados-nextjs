import { OrganizationSettings } from "@/components/admin/organization-settings"

export default function DespachoPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Organización</h1>
        <p className="text-muted-foreground">
          Administra la configuración y estadísticas de tu organización
        </p>
      </div>
      <OrganizationSettings />
    </div>
  )
}

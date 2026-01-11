import { SystemSettings } from "@/components/admin/system-settings"

export default function ConfiguracionPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuración del Sistema</h1>
        <p className="text-muted-foreground">
          Configuración avanzada y preferencias globales
        </p>
      </div>
      <SystemSettings />
    </div>
  )
}

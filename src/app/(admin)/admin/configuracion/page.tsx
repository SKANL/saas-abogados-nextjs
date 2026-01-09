import { GlobalSettingsForm } from "@/components/forms/global-settings-form"

export default function ConfiguracionAdminPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuración Global</h1>
        <p className="text-muted-foreground">
          Ajustes generales que aplican a todo el despacho
        </p>
      </div>
      <GlobalSettingsForm />
    </div>
  )
}

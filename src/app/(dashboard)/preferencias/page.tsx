import { UserPreferencesForm } from "@/components/forms/user-preferences-form"

export default function PreferenciasPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Preferencias</h1>
        <p className="text-muted-foreground">
          Personaliza tu experiencia en la plataforma
        </p>
      </div>
      <UserPreferencesForm />
    </div>
  )
}

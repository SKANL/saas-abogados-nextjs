import { CreateSalaForm } from "@/components/forms/create-sala-form"

export default function NuevoClientePage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nueva Sala de Bienvenida</h1>
        <p className="text-muted-foreground">
          Crea un enlace único para que tu cliente complete su onboarding.
        </p>
      </div>
      <CreateSalaForm />
    </div>
  )
}

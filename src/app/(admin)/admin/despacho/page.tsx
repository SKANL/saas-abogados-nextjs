import { FirmProfileForm } from "@/components/forms/firm-profile-form"

export default function DespachoPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Perfil del Despacho</h1>
        <p className="text-muted-foreground">
          Administra la información pública de tu despacho
        </p>
      </div>
      <FirmProfileForm />
    </div>
  )
}

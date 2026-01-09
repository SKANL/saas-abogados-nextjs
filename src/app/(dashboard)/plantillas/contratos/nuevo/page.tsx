import { ContractUploadForm } from "@/components/forms/contract-upload-form"

export default function NuevoContratoPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nueva Plantilla de Contrato</h1>
        <p className="text-muted-foreground">
          Sube un archivo PDF para usarlo como plantilla en tus salas
        </p>
      </div>
      <ContractUploadForm />
    </div>
  )
}

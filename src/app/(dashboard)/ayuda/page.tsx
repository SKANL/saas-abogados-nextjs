import { HelpContent } from "@/components/dashboard/help-content"

export default function AyudaPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Centro de Ayuda</h1>
        <p className="text-muted-foreground">
          Guía completa y respuestas frecuentes
        </p>
      </div>
      <HelpContent />
    </div>
  )
}

import { PortalFlow } from "@/components/portal/portal-flow"
import { PortalHeader } from "@/components/portal/portal-header"

interface Props {
  params: Promise<{ token: string }>
}

export default async function SalaPage({ params }: Props) {
  const { token } = await params
  
  // TODO: Validate token and fetch sala data from API
  const salaData = {
    firmName: "",
    firmLogo: "",
    clientName: "",
    contractContent: undefined,
    documentsRequired: [] as string[],
    questions: [] as Array<{ id: string; text: string; type: "text" | "textarea" | "select"; options?: string[]; required: boolean }>,
  }
  
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <PortalHeader firmName={salaData.firmName} firmLogo={salaData.firmLogo} />
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <PortalFlow
            clientName={salaData.clientName}
            contractContent={salaData.contractContent}
            documentsRequired={salaData.documentsRequired}
            questions={salaData.questions}
          />
        </div>
      </main>
    </div>
  )
}

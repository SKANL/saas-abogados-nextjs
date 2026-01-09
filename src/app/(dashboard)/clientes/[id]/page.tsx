import { ClientExpediente } from "@/components/dashboard/client-expediente"

interface Props {
  params: Promise<{ id: string }>
}

export default async function ExpedientePage({ params }: Props) {
  const { id } = await params
  
  return <ClientExpediente clientId={id} />
}

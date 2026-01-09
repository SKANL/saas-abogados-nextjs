import { UserDetail } from "@/components/admin/user-detail"

interface Props {
  params: Promise<{ id: string }>
}

export default async function UserDetailPage({ params }: Props) {
  const { id } = await params
  
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <UserDetail userId={id} />
    </div>
  )
}

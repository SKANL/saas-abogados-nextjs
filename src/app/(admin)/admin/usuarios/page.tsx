import { UsersTable } from "@/components/admin/users-table"
import { InviteUserDialogWrapper } from "@/components/admin/invite-user-dialog-wrapper"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

export default function UsuariosPage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-2xl font-semibold">Usuarios</h1>
          <p className="text-muted-foreground text-sm">
            Gestión de abogados registrados en tu organización
          </p>
        </div>
        <InviteUserDialogWrapper />
      </div>
      <div className="px-4 lg:px-6">
        <Suspense fallback={<LoadingSkeleton />}>
          <UsersTable />
        </Suspense>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      <span className="ml-2 text-muted-foreground">Cargando usuarios...</span>
    </div>
  )
}

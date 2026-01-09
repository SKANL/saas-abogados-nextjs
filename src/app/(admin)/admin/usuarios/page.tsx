import { UsersTable } from "@/components/admin/users-table"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"

export default function UsuariosPage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-2xl font-semibold">Usuarios</h1>
          <p className="text-muted-foreground text-sm">
            Gestión de abogados registrados en el sistema
          </p>
        </div>
        <Button>
          <PlusIcon className="mr-2 size-4" />
          Nuevo Usuario
        </Button>
      </div>
      <div className="px-4 lg:px-6">
        <UsersTable />
      </div>
    </div>
  )
}

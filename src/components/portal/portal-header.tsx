import { Building2 } from "lucide-react"

interface PortalHeaderProps {
  firmName: string
  firmLogo?: string
}

export function PortalHeader({ firmName, firmLogo }: PortalHeaderProps) {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-center px-4">
        <div className="flex items-center gap-3">
          {firmLogo ? (
            <img
              src={firmLogo}
              alt={firmName}
              className="h-10 w-10 rounded-lg object-contain"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Building2 className="h-5 w-5" />
            </div>
          )}
          <span className="text-lg font-semibold">{firmName}</span>
        </div>
      </div>
    </header>
  )
}

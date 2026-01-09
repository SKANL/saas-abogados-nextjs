"use client"

import Link from "next/link"
import { Plus, FileText, ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const actions = [
  {
    title: "Nueva Sala",
    description: "Crea una sala de bienvenida para un nuevo cliente",
    href: "/clientes/nuevo",
    icon: Plus,
    variant: "default" as const,
  },
  {
    title: "Nuevo Contrato",
    description: "Agrega una plantilla de contrato",
    href: "/plantillas/contratos/nuevo",
    icon: FileText,
    variant: "outline" as const,
  },
  {
    title: "Nuevo Cuestionario",
    description: "Crea un cuestionario para recopilar información",
    href: "/plantillas/cuestionarios/nuevo",
    icon: ClipboardList,
    variant: "outline" as const,
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Acciones Rápidas</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {actions.map((action) => (
          <Button
            key={action.title}
            variant={action.variant}
            className="h-auto justify-start px-4 py-3"
            asChild
          >
            <Link href={action.href}>
              <action.icon className="mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">{action.title}</div>
                <div className="text-xs font-normal opacity-70">
                  {action.description}
                </div>
              </div>
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}

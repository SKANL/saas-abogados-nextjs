"use client"

import { Download, Edit2, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface ContractViewerProps {
  id: string
  name: string
  createdAt: string
  fileUrl?: string
}

export function ContractViewer({ id, name, createdAt, fileUrl }: ContractViewerProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/plantillas/contratos">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
          <p className="text-muted-foreground text-sm">
            Creado el {new Date(createdAt).toLocaleDateString("es-MX")}
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vista Previa del Contrato</CardTitle>
            <CardDescription>
              Aquí se mostrará el PDF del contrato
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-4 min-h-96 bg-muted/50 rounded-lg p-8">
            {fileUrl ? (
              <>
                <p className="text-muted-foreground">
                  Archivo PDF cargado correctamente
                </p>
                <Button asChild>
                  <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" />
                    Descargar PDF
                  </a>
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground">
                No hay archivo PDF asociado
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">ID</p>
              <p className="text-sm font-mono">{id}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nombre</p>
              <p className="text-sm">{name}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Fecha de creación
              </p>
              <p className="text-sm">
                {new Date(createdAt).toLocaleString("es-MX")}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button asChild variant="outline">
            <Link href={`/plantillas/contratos/${id}/editar`}>
              <Edit2 className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  )
}

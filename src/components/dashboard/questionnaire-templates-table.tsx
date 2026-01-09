"use client"

import * as React from "react"
import Link from "next/link"
import { MoreHorizontal, Eye, Edit, Trash2, Plus, Loader2 } from "lucide-react"
import { useQuestionnaireTemplates } from "@/hooks"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"

interface QuestionnaireTemplate {
  id: string
  name: string
  description: string
  questionsCount: number
  usageCount: number
  createdAt: string
  updatedAt: string
}

export function QuestionnaireTemplatesTable() {
  const [search, setSearch] = React.useState("")
  const { templates, loading, remove } = useQuestionnaireTemplates()

  const filteredTemplates = React.useMemo(() => {
    if (!templates) return []
    return templates.filter((template) =>
      template.name?.toLowerCase().includes(search.toLowerCase())
    )
  }, [templates, search])

  const handleDelete = async (templateId: string) => {
    if (!confirm("¿Estás seguro de eliminar este cuestionario?")) return
    await remove(templateId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Buscar cuestionarios..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Button asChild>
          <Link href="/plantillas/cuestionarios/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Cuestionario
          </Link>
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead className="text-center">Preguntas</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead className="w-17.5"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTemplates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No se encontraron cuestionarios
                </TableCell>
              </TableRow>
            ) : (
              filteredTemplates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{template.questions?.length || 0}</Badge>
                  </TableCell>
                  <TableCell>
                    {template.created_at 
                      ? new Date(template.created_at).toLocaleDateString("es-MX")
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Acciones</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/plantillas/cuestionarios/${template.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/plantillas/cuestionarios/${template.id}/editar`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(template.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

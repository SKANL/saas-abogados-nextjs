"use client"

import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

interface SiteHeaderProps {
  isAdmin?: boolean
}

const routeNames: Record<string, string> = {
  "/": "Panel",
  "/clientes": "Clientes",
  "/clientes/nuevo": "Nueva Sala",
  "/plantillas/contratos": "Contratos",
  "/plantillas/cuestionarios": "Cuestionarios",
  "/perfil": "Despacho",
  "/configuracion": "Configuración",
  "/admin": "Panel Admin",
  "/admin/usuarios": "Usuarios",
  "/admin/auditoria": "Auditoría",
}

export function SiteHeader({ isAdmin = false }: SiteHeaderProps) {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)
  
  const getCurrentTitle = () => {
    // Check exact match first
    if (routeNames[pathname]) {
      return routeNames[pathname]
    }
    
    // Check for dynamic routes (like /clientes/[id])
    if (segments.length >= 2 && segments[0] === "clientes") {
      return "Expediente"
    }
    if (segments.length >= 3 && segments[0] === "admin" && segments[1] === "usuarios") {
      return "Detalle Usuario"
    }
    
    return "Dashboard"
  }

  const getParentRoute = () => {
    if (segments.length >= 2) {
      if (segments[0] === "clientes") {
        return { name: "Clientes", href: "/clientes" }
      }
      if (segments[0] === "plantillas") {
        return { name: "Plantillas", href: `/${segments[0]}/${segments[1]}` }
      }
      if (segments[0] === "admin" && segments.length > 1) {
        return { name: "Admin", href: "/admin" }
      }
    }
    return null
  }

  const parentRoute = getParentRoute()
  const currentTitle = getCurrentTitle()

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {parentRoute && (
              <>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href={parentRoute.href}>
                    {parentRoute.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
              </>
            )}
            <BreadcrumbItem>
              <BreadcrumbPage>{currentTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  )
}

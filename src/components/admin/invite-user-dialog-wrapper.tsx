/**
 * InviteUserDialogWrapper Component
 * 
 * Client component wrapper that fetches organization ID and renders InviteUserDialog
 */

"use client"

import * as React from "react"
import { InviteUserDialog } from "./invite-user-dialog"
import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export function InviteUserDialogWrapper() {
  const [organizationId, setOrganizationId] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchOrganization() {
      try {
        const response = await fetch('/api/admin/organization')
        if (response.ok) {
          const data = await response.json()
          setOrganizationId(data.organization?.id || null)
        }
      } catch (error) {
        console.error('Error fetching organization:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrganization()
  }, [])

  if (loading || !organizationId) {
    return (
      <Button disabled>
        <PlusIcon className="mr-2 size-4" />
        Invitar Usuario
      </Button>
    )
  }

  return (
    <InviteUserDialog 
      organizationId={organizationId}
      trigger={
        <Button>
          <PlusIcon className="mr-2 size-4" />
          Invitar Usuario
        </Button>
      }
    />
  )
}

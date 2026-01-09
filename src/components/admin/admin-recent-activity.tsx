"use client"

import {
  LogIn,
  UserPlus,
  FileText,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RecentActivity {
  id: string
  type: "login" | "register" | "create_sala"
  userName: string
  description: string
  time: string
}

const activityConfig = {
  login: { icon: LogIn, color: "text-blue-600" },
  register: { icon: UserPlus, color: "text-green-600" },
  create_sala: { icon: FileText, color: "text-purple-600" },
}

export function AdminRecentActivity() {
  // TODO: Fetch recent activity from API
  const activity: RecentActivity[] = []
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Actividad Reciente</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/auditoria">
            Ver todo
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {activity.map((act) => {
          const config = activityConfig[act.type]
          return (
            <div key={act.id} className="flex items-center gap-4">
              <div className={`rounded-full bg-muted p-2 ${config.color}`}>
                <config.icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{act.userName}</p>
                <p className="text-xs text-muted-foreground">
                  {act.description}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">{act.time}</span>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

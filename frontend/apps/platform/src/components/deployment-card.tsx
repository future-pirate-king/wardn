"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader } from "@repo/ui/card"
import { Badge } from "@repo/ui/badge"
import { SyncStatusBadge, HealthStatusBadge } from "@/components/status-badge"
import type { Deployment } from "@/lib/deployments"
import { getDeploymentResourceCount } from "@/lib/deployments"
import {
  ServerIcon,
  LayersIcon,
  ClockIcon,
  MoreVerticalIcon,
  BoxesIcon,
} from "lucide-react"

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "Never"
  const date = new Date(dateStr)
  const now = new Date("2026-08-30T09:20:00Z")
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)
  if (diffMin < 1) return "Just now"
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  return `${diffDay}d ago`
}

export function DeploymentCard({ deployment }: { deployment: Deployment }) {
  const resourceCount = getDeploymentResourceCount(deployment)
  const componentNames = deployment.components.map((c) => c.name)

  return (
    <Link href={`/deployments/${deployment.id}`} className="block">
      <Card className="group h-full min-w-[280px] overflow-hidden hover:ring-1 hover:ring-foreground/10 transition-all cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2">
                <LayersIcon className="size-4 shrink-0 text-muted-foreground" />
                <span className="font-medium truncate">{deployment.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">{deployment.namespace}</span>
            </div>
            <button className="text-muted-foreground hover:text-foreground shrink-0 rounded-lg p-1 hover:bg-muted" onClick={(e) => e.preventDefault()}>
              <MoreVerticalIcon className="size-4" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2 min-h-[24px]">
            <SyncStatusBadge status={deployment.syncStatus} />
            <HealthStatusBadge status={deployment.healthStatus} />
            <Badge variant="outline" className="text-xs">
              {deployment.project}
            </Badge>
          </div>

          <div className="flex flex-col gap-1.5 text-xs text-muted-foreground min-h-[60px]">
            <div className="flex items-center gap-2">
              <BoxesIcon className="size-3.5 shrink-0" />
              <span>{deployment.components.length} components</span>
              <span className="text-foreground/30">·</span>
              <span>{resourceCount} resources</span>
            </div>
            <div className="flex items-center gap-2">
              <ServerIcon className="size-3.5 shrink-0" />
              <span className="truncate">{deployment.targetCluster}</span>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="size-3.5 shrink-0" />
              <span>{formatRelativeTime(deployment.lastSyncAt)}</span>
            </div>
          </div>

          <div className="mt-auto border-t border-border pt-3 min-h-[32px]">
            <div className="flex flex-wrap gap-1">
              {componentNames.slice(0, 3).map((name) => (
                <Badge key={name} variant="secondary" className="text-[10px] gap-1">
                  {name}
                </Badge>
              ))}
              {componentNames.length > 3 && (
                <Badge variant="secondary" className="text-[10px]">
                  +{componentNames.length - 3}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader } from "@repo/ui/card"
import { Badge } from "@repo/ui/badge"
import { SyncStatusBadge, HealthStatusBadge } from "@/components/status-badge"
import type { Component } from "@/lib/deployments"
import {
  GitBranchIcon,
  BoxesIcon,
  ClockIcon,
  RefreshCwIcon,
  ArrowRightIcon,
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

export function ComponentCard({
  component,
  deploymentId,
}: {
  component: Component
  deploymentId: string
}) {
  return (
    <Link
      href={`/deployments/${deploymentId}/${component.id}`}
      className="group block"
    >
      <Card className="group h-full min-w-[280px] overflow-hidden hover:ring-1 hover:ring-foreground/10 transition-all cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1 min-w-0">
              <span className="font-semibold text-sm truncate">{component.name}</span>
              <span className="text-xs text-muted-foreground truncate">{component.namespace}</span>
            </div>
            <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2 min-h-[24px]">
            <SyncStatusBadge status={component.syncStatus} />
            <HealthStatusBadge status={component.healthStatus} />
            <Badge variant="outline" className="text-xs">
              {component.manifestType}
            </Badge>
          </div>

          <div className="flex flex-col gap-2 text-xs text-muted-foreground min-h-[60px]">
            <div className="flex items-center gap-2">
              <GitBranchIcon className="size-3.5 shrink-0" />
              <span className="truncate">{component.branch}</span>
              <span className="text-foreground/20">·</span>
              <span className="font-mono text-[10px]">{component.revision}</span>
            </div>
            <div className="flex items-center gap-2">
              <BoxesIcon className="size-3.5 shrink-0" />
              <span>{component.resources.length} resources</span>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="size-3.5 shrink-0" />
              <span>{formatRelativeTime(component.lastSyncAt)}</span>
            </div>
          </div>

          <div className="mt-auto border-t border-border pt-3 min-h-[32px]">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {component.autoSync && (
                <span className="flex items-center gap-1">
                  <RefreshCwIcon className="size-3" />
                  Auto-sync
                </span>
              )}
              {component.prune && <span>Prune</span>}
              {component.selfHeal && <span>Self-heal</span>}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

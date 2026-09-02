"use client"

import { Card, CardContent, CardHeader } from "@repo/ui/card"
import { Badge } from "@repo/ui/badge"
import type { Cluster, ClusterStatus } from "@/lib/clusters"
import { cn } from "@/lib/utils"
import {
  ServerIcon,
  CpuIcon,
  MemoryStickIcon,
  BoxesIcon,
  GlobeIcon,
  MoreVerticalIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  CircleSlashIcon,
  CircleIcon,
} from "lucide-react"

const statusConfig: Record<ClusterStatus, { className: string; dot: string; icon: React.ReactNode }> = {
  Connected: {
    className: "bg-green-500/10 text-green-700 dark:text-green-400",
    dot: "bg-green-500",
    icon: <CircleCheckIcon className="size-3.5" />,
  },
  Disconnected: {
    className: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
    icon: <CircleSlashIcon className="size-3.5" />,
  },
  Error: {
    className: "bg-red-500/10 text-red-700 dark:text-red-400",
    dot: "bg-red-500",
    icon: <CircleAlertIcon className="size-3.5" />,
  },
  Unknown: {
    className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    dot: "bg-yellow-500",
    icon: <CircleIcon className="size-3.5" />,
  },
}

function UsageBar({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  const color = value > 80 ? "bg-red-500" : value > 60 ? "bg-yellow-500" : "bg-green-500"
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          {icon}
          {label}
        </span>
        <span className="font-medium">{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

export function ClusterCard({ cluster }: { cluster: Cluster }) {
  const config = statusConfig[cluster.status]
  return (
    <Card className="group h-full min-w-[300px] overflow-hidden hover:ring-1 hover:ring-foreground/10 transition-all cursor-pointer">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2">
              <ServerIcon className="size-4 shrink-0 text-muted-foreground" />
              <span className="font-medium truncate">{cluster.name}</span>
            </div>
            <span className="text-xs text-muted-foreground truncate">{cluster.serverUrl}</span>
          </div>
          <button className="text-muted-foreground hover:text-foreground shrink-0 rounded-lg p-1 hover:bg-muted">
            <MoreVerticalIcon className="size-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2 min-h-[24px]">
          <Badge variant="secondary" className={cn("gap-1.5", config.className)}>
            {config.icon}
            {cluster.status}
          </Badge>
          <Badge variant="outline" className="text-xs">{cluster.provider}</Badge>
          <Badge variant="outline" className="text-xs gap-1">
            <GlobeIcon className="size-3" />
            {cluster.region}
          </Badge>
        </div>

        <div className="flex flex-col gap-2 text-xs text-muted-foreground min-h-[60px]">
          <div className="flex items-center justify-between">
            <span>Version</span>
            <span className="font-mono text-foreground/70">{cluster.version}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Nodes</span>
            <span className="font-medium text-foreground/70">{cluster.nodeCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <BoxesIcon className="size-3" />
              Deployments
            </span>
            <span className="font-medium text-foreground/70">
              {cluster.healthyDeployments}/{cluster.deploymentCount} healthy
            </span>
          </div>
        </div>

        {cluster.status === "Connected" && (
          <div className="flex flex-col gap-2 min-h-[52px]">
            <UsageBar label="CPU" value={cluster.cpuUsage} icon={<CpuIcon className="size-3" />} />
            <UsageBar label="Memory" value={cluster.memoryUsage} icon={<MemoryStickIcon className="size-3" />} />
          </div>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-border pt-3 min-h-[32px]">
          <span className="text-xs text-muted-foreground">
            {cluster.lastSeen ? `Updated ${formatRelativeTime(cluster.lastSeen)}` : "Never connected"}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "Never"
  const date = new Date(dateStr)
  const now = new Date("2026-08-30T09:20:00Z")
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)
  if (diffMin < 1) return "just now"
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  return `${diffDay}d ago`
}

export { statusConfig as clusterStatusConfig }

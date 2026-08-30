import { Badge } from "@repo/ui/badge"
import { cn } from "@/lib/utils"
import type { SyncStatus, HealthStatus } from "@/lib/deployments"

const syncStatusConfig: Record<SyncStatus, { className: string; dot: string }> = {
  Synced: {
    className: "bg-green-500/10 text-green-700 dark:text-green-400",
    dot: "bg-green-500",
  },
  OutOfSync: {
    className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    dot: "bg-yellow-500",
  },
  Syncing: {
    className: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  Unknown: {
    className: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
}

const healthStatusConfig: Record<HealthStatus, { className: string; dot: string }> = {
  Healthy: {
    className: "bg-green-500/10 text-green-700 dark:text-green-400",
    dot: "bg-green-500",
  },
  Degraded: {
    className: "bg-red-500/10 text-red-700 dark:text-red-400",
    dot: "bg-red-500",
  },
  Progressing: {
    className: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  Missing: {
    className: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
    dot: "bg-orange-500",
  },
  Unknown: {
    className: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
}

export function SyncStatusBadge({ status }: { status: SyncStatus }) {
  const config = syncStatusConfig[status]
  return (
    <Badge variant="secondary" className={cn("gap-1.5", config.className)}>
      <span className={cn("size-1.5 rounded-full", config.dot)} />
      {status}
    </Badge>
  )
}

export function HealthStatusBadge({ status }: { status: HealthStatus }) {
  const config = healthStatusConfig[status]
  return (
    <Badge variant="secondary" className={cn("gap-1.5", config.className)}>
      <span className={cn("size-1.5 rounded-full", config.dot)} />
      {status}
    </Badge>
  )
}

"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table"
import { Badge } from "@repo/ui/badge"
import { clusterStatusConfig } from "@/components/cluster-card"
import type { Cluster } from "@/lib/clusters"
import type { ClusterSortField } from "@/components/cluster-view"
import type { SortDirection } from "@/components/deployment-view"
import { cn } from "@/lib/utils"
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronsUpDownIcon,
  MoreVerticalIcon,
  CpuIcon,
  MemoryStickIcon,
} from "lucide-react"

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

interface SortableHeaderProps {
  field: ClusterSortField
  label: string
  currentSort: ClusterSortField
  sortDirection: SortDirection
  onSort: (field: ClusterSortField) => void
}

function SortableHeader({ field, label, currentSort, sortDirection, onSort }: SortableHeaderProps) {
  const isActive = currentSort === field
  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 hover:text-foreground transition-colors"
    >
      {label}
      {isActive ? (
        sortDirection === "asc" ? <ArrowUpIcon className="size-3" /> : <ArrowDownIcon className="size-3" />
      ) : (
        <ChevronsUpDownIcon className="size-3 opacity-40" />
      )}
    </button>
  )
}

interface ClusterListProps {
  clusters: Cluster[]
  sortField: ClusterSortField
  sortDirection: SortDirection
  onSort: (field: ClusterSortField) => void
}

export function ClusterList({ clusters, sortField, sortDirection, onSort }: ClusterListProps) {
  return (
    <div className="rounded-xl bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[200px]">
              <SortableHeader field="name" label="Name" currentSort={sortField} sortDirection={sortDirection} onSort={onSort} />
            </TableHead>
            <TableHead>
              <SortableHeader field="status" label="Status" currentSort={sortField} sortDirection={sortDirection} onSort={onSort} />
            </TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>
              <SortableHeader field="region" label="Region" currentSort={sortField} sortDirection={sortDirection} onSort={onSort} />
            </TableHead>
            <TableHead>Version</TableHead>
            <TableHead>
              <SortableHeader field="nodeCount" label="Nodes" currentSort={sortField} sortDirection={sortDirection} onSort={onSort} />
            </TableHead>
            <TableHead>Deployments</TableHead>
            <TableHead>CPU / Memory</TableHead>
            <TableHead>
              <SortableHeader field="lastSeen" label="Last Seen" currentSort={sortField} sortDirection={sortDirection} onSort={onSort} />
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clusters.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="h-32 text-center text-muted-foreground">
                No clusters found
              </TableCell>
            </TableRow>
          ) : (
            clusters.map((cluster) => {
              const config = clusterStatusConfig[cluster.status]
              return (
                <TableRow key={cluster.id} className="cursor-pointer">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{cluster.name}</span>
                      <span className="text-xs text-muted-foreground font-mono">{cluster.serverUrl}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={cn("gap-1.5", config.className)}>
                      {config.icon}
                      {cluster.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{cluster.provider}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{cluster.region}</TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-muted-foreground">{cluster.version}</span>
                  </TableCell>
                  <TableCell className="font-medium">{cluster.nodeCount}</TableCell>
                  <TableCell>
                    <span className="text-sm">
                      <span className="text-green-600 dark:text-green-400 font-medium">{cluster.healthyDeployments}</span>
                      <span className="text-muted-foreground"> / {cluster.deploymentCount}</span>
                    </span>
                  </TableCell>
                  <TableCell>
                    {cluster.status === "Connected" ? (
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <CpuIcon className="size-3" />
                          {cluster.cpuUsage}%
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <MemoryStickIcon className="size-3" />
                          {cluster.memoryUsage}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {formatRelativeTime(cluster.lastSeen)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end">
                      <button className="rounded-lg p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground">
                        <MoreVerticalIcon className="size-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}

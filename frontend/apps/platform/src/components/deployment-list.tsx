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
import { SyncStatusBadge, HealthStatusBadge } from "@/components/status-badge"
import type { Deployment } from "@/lib/deployments"
import type { SortField, SortDirection } from "@/components/deployment-view"
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronsUpDownIcon,
  RefreshCwIcon,
  MoreVerticalIcon,
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

interface SortableHeaderProps {
  field: SortField
  label: string
  currentSort: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
  className?: string
}

function SortableHeader({ field, label, currentSort, sortDirection, onSort, className }: SortableHeaderProps) {
  const isActive = currentSort === field
  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 hover:text-foreground transition-colors"
    >
      {label}
      {isActive ? (
        sortDirection === "asc" ? (
          <ArrowUpIcon className="size-3" />
        ) : (
          <ArrowDownIcon className="size-3" />
        )
      ) : (
        <ChevronsUpDownIcon className="size-3 opacity-40" />
      )}
    </button>
  )
}

interface DeploymentListProps {
  deployments: Deployment[]
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
}

export function DeploymentList({ deployments, sortField, sortDirection, onSort }: DeploymentListProps) {
  return (
    <div className="rounded-xl bg-card overflow-hidden border border-border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[200px]">
              <SortableHeader field="name" label="Name" currentSort={sortField} sortDirection={sortDirection} onSort={onSort} />
            </TableHead>
            <TableHead>
              <SortableHeader field="namespace" label="Namespace" currentSort={sortField} sortDirection={sortDirection} onSort={onSort} />
            </TableHead>
            <TableHead>
              <SortableHeader field="syncStatus" label="Sync" currentSort={sortField} sortDirection={sortDirection} onSort={onSort} />
            </TableHead>
            <TableHead>
              <SortableHeader field="healthStatus" label="Health" currentSort={sortField} sortDirection={sortDirection} onSort={onSort} />
            </TableHead>
            <TableHead>
              <SortableHeader field="targetCluster" label="Cluster" currentSort={sortField} sortDirection={sortDirection} onSort={onSort} />
            </TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Revision</TableHead>
            <TableHead>
              <SortableHeader field="lastSyncAt" label="Last Sync" currentSort={sortField} sortDirection={sortDirection} onSort={onSort} />
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deployments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                No deployments found
              </TableCell>
            </TableRow>
          ) : (
            deployments.map((dep) => (
              <TableRow key={dep.id} className="cursor-pointer">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{dep.name}</span>
                    <span className="text-xs text-muted-foreground">{dep.manifestType}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{dep.namespace}</TableCell>
                <TableCell>
                  <SyncStatusBadge status={dep.syncStatus} />
                </TableCell>
                <TableCell>
                  <HealthStatusBadge status={dep.healthStatus} />
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">{dep.targetCluster}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">{dep.project}</Badge>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs text-muted-foreground">{dep.revision}</span>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {formatRelativeTime(dep.lastSyncAt)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <button className="rounded-lg p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground" title="Sync">
                      <RefreshCwIcon className="size-3.5" />
                    </button>
                    <button className="rounded-lg p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground" title="More">
                      <MoreVerticalIcon className="size-3.5" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

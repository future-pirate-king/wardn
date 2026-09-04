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
import type { Component } from "@/lib/deployments"
import {
  RefreshCwIcon,
  MoreVerticalIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronsUpDownIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"

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

type ComponentSortField = "name" | "syncStatus" | "healthStatus" | "lastSyncAt"
type SortDirection = "asc" | "desc"

interface SortableHeaderProps {
  field: ComponentSortField
  label: string
  currentSort: ComponentSortField
  sortDirection: SortDirection
  onSort: (field: ComponentSortField) => void
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

interface ComponentListProps {
  components: Component[]
  deploymentId: string
  sortField: ComponentSortField
  sortDirection: SortDirection
  onSort: (field: ComponentSortField) => void
}

export function ComponentList({ components, deploymentId, sortField, sortDirection, onSort }: ComponentListProps) {
  const router = useRouter()

  return (
    <div className="rounded-xl bg-card overflow-hidden border border-border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[200px]">
              <SortableHeader field="name" label="Name" currentSort={sortField} sortDirection={sortDirection} onSort={onSort} />
            </TableHead>
            <TableHead>
              <SortableHeader field="syncStatus" label="Sync" currentSort={sortField} sortDirection={sortDirection} onSort={onSort} />
            </TableHead>
            <TableHead>
              <SortableHeader field="healthStatus" label="Health" currentSort={sortField} sortDirection={sortDirection} onSort={onSort} />
            </TableHead>
            <TableHead>Manifest</TableHead>
            <TableHead>Branch</TableHead>
            <TableHead>Resources</TableHead>
            <TableHead>
              <SortableHeader field="lastSyncAt" label="Last Sync" currentSort={sortField} sortDirection={sortDirection} onSort={onSort} />
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {components.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                No components found
              </TableCell>
            </TableRow>
          ) : (
            components.map((comp) => (
              <TableRow
                key={comp.id}
                className="cursor-pointer"
                onClick={() => router.push(`/deployments/${deploymentId}/${comp.id}`)}
              >
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{comp.name}</span>
                    <span className="text-xs text-muted-foreground">{comp.namespace}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <SyncStatusBadge status={comp.syncStatus} />
                </TableCell>
                <TableCell>
                  <HealthStatusBadge status={comp.healthStatus} />
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">{comp.manifestType}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs font-mono">{comp.branch}</TableCell>
                <TableCell className="text-muted-foreground">{comp.resources.length}</TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {formatRelativeTime(comp.lastSyncAt)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      className="rounded-lg p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground"
                      title="Sync"
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                    >
                      <RefreshCwIcon className="size-3.5" />
                    </button>
                    <button
                      className="rounded-lg p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground"
                      title="More"
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                    >
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

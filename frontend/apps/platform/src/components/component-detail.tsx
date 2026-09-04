"use client"

import * as React from "react"
import { Badge } from "@repo/ui/badge"
import { Button } from "@repo/ui/button"
import { SyncStatusBadge, HealthStatusBadge } from "@/components/status-badge"
import { ResourceGraph } from "@/components/resource-graph"
import { YamlEditor } from "@/components/yaml-editor"
import type { Component, K8sResource } from "@/lib/deployments"
import { cn } from "@/lib/utils"
import {
  GitBranchIcon,
  RefreshCwIcon,
  ClockIcon,
  BoxesIcon,
  FileTextIcon,
  NetworkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CircleAlertIcon,
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

const statusDotColors: Record<string, string> = {
  Healthy: "bg-green-500",
  Degraded: "bg-red-500",
  Progressing: "bg-blue-500",
  Missing: "bg-orange-500",
  Unknown: "bg-muted-foreground",
}

function MetaItem({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Icon className="size-3.5 shrink-0" />
      {children}
    </div>
  )
}

function SectionHeader({
  icon: Icon,
  title,
  count,
  badge,
  collapsed,
  onToggle,
}: {
  icon: React.ElementType
  title: string
  count?: number
  badge?: React.ReactNode
  collapsed: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center gap-2 py-2"
    >
      {collapsed ? (
        <ChevronRightIcon className="size-4 text-muted-foreground" />
      ) : (
        <ChevronDownIcon className="size-4 text-muted-foreground" />
      )}
      <Icon className="size-4 text-muted-foreground" />
      <span className="text-sm font-semibold">{title}</span>
      {count !== undefined && (
        <span className="text-xs text-muted-foreground">{count}</span>
      )}
      {badge}
    </button>
  )
}

export function ComponentDetail({
  component,
  deploymentId,
}: {
  component: Component
  deploymentId: string
}) {
  const [graphOpen, setGraphOpen] = React.useState(true)
  const [podsOpen, setPodsOpen] = React.useState(true)
  const [yamlOpen, setYamlOpen] = React.useState(true)
  const [selectedResource, setSelectedResource] = React.useState<
    K8sResource | undefined
  >()

  const pods = component.resources.filter((r) => r.kind === "Pod")
  const hasDiff = component.resources.some((r) => r.liveManifest)

  return (
    <div className="flex flex-col gap-6">
      {/* Summary bar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <SyncStatusBadge status={component.syncStatus} />
          <HealthStatusBadge status={component.healthStatus} />
          <Badge variant="outline" className="text-xs">
            {component.manifestType}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {component.syncPolicy}
          </Badge>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm">
              <RefreshCwIcon className="size-3.5" />
              Sync
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <MetaItem icon={GitBranchIcon}>
            <span>{component.branch}</span>
            <span className="text-foreground/30">·</span>
            <span className="font-mono text-[10px]">{component.revision}</span>
          </MetaItem>
          <MetaItem icon={FileTextIcon}>
            <span className="truncate max-w-[200px]">{component.repoURL}</span>
          </MetaItem>
          <MetaItem icon={BoxesIcon}>
            <span>{component.resources.length} resources</span>
          </MetaItem>
          <MetaItem icon={ClockIcon}>
            <span>{formatRelativeTime(component.lastSyncAt)}</span>
          </MetaItem>
          {component.autoSync && (
            <MetaItem icon={RefreshCwIcon}>
              <span>Auto-sync</span>
            </MetaItem>
          )}
        </div>
      </div>

      {/* Graph section */}
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="px-4">
          <SectionHeader
            icon={NetworkIcon}
            title="Resource Graph"
            count={component.resources.length}
            collapsed={graphOpen}
            onToggle={() => setGraphOpen(!graphOpen)}
          />
        </div>
        {graphOpen && (
          <div className="border-t border-border">
            <ResourceGraph
              resources={component.resources}
              edges={component.edges}
            />
          </div>
        )}
      </div>

      {/* Pods section */}
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="px-4">
          <SectionHeader
            icon={BoxesIcon}
            title="Pods"
            count={pods.length}
            collapsed={podsOpen}
            onToggle={() => setPodsOpen(!podsOpen)}
          />
        </div>
        {podsOpen && (
          <div className="border-t border-border">
            {pods.length === 0 ? (
              <div className="flex h-20 items-center justify-center text-sm text-muted-foreground">
                No pods found
              </div>
            ) : (
              <div className="divide-y divide-border">
                {pods.map((pod) => (
                  <div
                    key={pod.id}
                    className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors"
                  >
                    <span
                      className={cn(
                        "size-2 shrink-0 rounded-full",
                        statusDotColors[pod.status] ?? statusDotColors["Unknown"],
                      )}
                    />
                    <span className="font-mono text-xs font-medium min-w-[180px] truncate">
                      {pod.name}
                    </span>
                    <span className="text-xs text-muted-foreground min-w-[80px]">
                      {pod.status}
                    </span>
                    <span className="text-xs text-muted-foreground min-w-[60px]">
                      {pod.ready ?? "—"}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground flex-1 truncate">
                      {pod.image?.split("/").pop() ?? "—"}
                    </span>
                    <span className="text-xs text-muted-foreground min-w-[50px] text-right">
                      {pod.age}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* YAML section */}
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="px-4">
          <SectionHeader
            icon={FileTextIcon}
            title="YAML Manifests"
            count={component.resources.length}
            badge={
              hasDiff && (
                <span className="flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-0.5 text-[10px] font-medium text-yellow-700 dark:text-yellow-400">
                  <CircleAlertIcon className="size-3" />
                  Drift detected
                </span>
              )
            }
            collapsed={yamlOpen}
            onToggle={() => setYamlOpen(!yamlOpen)}
          />
        </div>
        {yamlOpen && (
          <div className="border-t border-border divide-y divide-border">
            {component.resources.map((resource) => {
              const isOpen = !selectedResource || selectedResource.id === resource.id
              return (
                <div key={resource.id} className="flex flex-col">
                  <button
                    onClick={() =>
                      setSelectedResource(
                        selectedResource?.id === resource.id ? undefined : resource,
                      )
                    }
                    className="flex items-center gap-2 px-4 py-3 hover:bg-muted/30 transition-colors text-left"
                  >
                    {isOpen ? (
                      <ChevronDownIcon className="size-3.5 text-muted-foreground" />
                    ) : (
                      <ChevronRightIcon className="size-3.5 text-muted-foreground" />
                    )}
                    <span
                      className={cn(
                        "size-2 rounded-full",
                        statusDotColors[resource.status] ?? statusDotColors["Unknown"],
                      )}
                    />
                    <span className="text-sm font-medium">{resource.kind}</span>
                    <span className="text-sm text-muted-foreground">{resource.name}</span>
                    {resource.liveManifest && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
                      >
                        Drift
                      </Badge>
                    )}
                  </button>
                  {isOpen && (
                    <div className="h-[300px] border-t border-border">
                      <YamlEditor
                        manifest={resource.manifest}
                        liveManifest={resource.liveManifest}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

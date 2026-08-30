"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/tabs"
import { SyncStatusBadge, HealthStatusBadge } from "@/components/status-badge"
import { DonutChart, DonutLegend, BarList, Sparkline } from "@/components/charts"
import {
  mockClusters,
  mockRecentActivity,
  type RecentActivity,
} from "@/lib/clusters"
import {
  mockDeployments,
  syncStatuses,
  healthStatuses,
  type SyncStatus,
  type HealthStatus,
} from "@/lib/deployments"
import { cn } from "@/lib/utils"
import {
  ServerIcon,
  BoxesIcon,
  CircleCheckIcon,
  RefreshCwIcon,
  RefreshCcwIcon,
  ClockIcon,
  CircleAlertIcon,
  TrendingUpIcon,
  ActivityIcon,
  ZapIcon,
  CpuIcon,
  MemoryStickIcon,
  GitBranchIcon,
} from "lucide-react"
import Link from "next/link"

const activityIcons: Record<RecentActivity["type"], React.ReactNode> = {
  sync: <RefreshCwIcon className="size-3.5" />,
  health: <CircleCheckIcon className="size-3.5" />,
  cluster: <ServerIcon className="size-3.5" />,
  deployment: <BoxesIcon className="size-3.5" />,
}

const activityStatusStyles: Record<RecentActivity["status"], string> = {
  success: "bg-green-500/10 text-green-700 dark:text-green-400",
  warning: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  error: "bg-red-500/10 text-red-700 dark:text-red-400",
  info: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
}

const syncColors: Record<SyncStatus, string> = {
  Synced: "#22c55e",
  OutOfSync: "#ef4444",
  Syncing: "#3b82f6",
  Unknown: "#a3a3a3",
}

const healthColors: Record<HealthStatus, string> = {
  Healthy: "#22c55e",
  Degraded: "#ef4444",
  Progressing: "#eab308",
  Missing: "#a855f7",
  Unknown: "#a3a3a3",
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date("2026-08-30T09:20:00Z")
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMin / 60)
  if (diffMin < 1) return "just now"
  if (diffMin < 60) return `${diffMin}m ago`
  return `${diffHr}h ago`
}

const mockSyncHistory = [8, 9, 7, 10, 9, 11, 10, 12, 11, 13, 12, 14]
const mockHealthHistory = [10, 9, 10, 8, 9, 10, 11, 10, 9, 10, 11, 10]

function usageColor(v: number) {
  return v > 80 ? "#ef4444" : v > 60 ? "#eab308" : "#22c55e"
}

export default function Home() {
  const [resourceTab, setResourceTab] = React.useState<"cpu" | "memory">("cpu")

  const totalDeployments = mockDeployments.length
  const healthyDeployments = mockDeployments.filter((d) => d.healthStatus === "Healthy").length

  const syncSegments = syncStatuses.map((s) => ({
    label: s,
    value: mockDeployments.filter((d) => d.syncStatus === s).length,
    color: syncColors[s],
  })).filter((s) => s.value > 0)

  const healthSegments = healthStatuses.map((h) => ({
    label: h,
    value: mockDeployments.filter((d) => d.healthStatus === h).length,
    color: healthColors[h],
  })).filter((s) => s.value > 0)

  const connectedClusters = mockClusters.filter((c) => c.status === "Connected")

  const cpuItems = connectedClusters.map((c) => ({
    label: c.name,
    value: c.cpuUsage,
    max: 100,
    sub: `${c.cpuUsage}%`,
    color: usageColor(c.cpuUsage),
  }))

  const memoryItems = connectedClusters.map((c) => ({
    label: c.name,
    value: c.memoryUsage,
    max: 100,
    sub: `${c.memoryUsage}%`,
    color: usageColor(c.memoryUsage),
  }))

  const needsAttention = mockDeployments
    .filter((d) => d.syncStatus === "OutOfSync" || d.healthStatus === "Degraded" || d.healthStatus === "Missing")
    .slice(0, 5)

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 bg-card border-b border-border transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <h1 className="text-base font-medium">Overview</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {/* Charts row */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {/* Sync status donut */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Sync Status</CardTitle>
                  <RefreshCcwIcon className="size-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
                  <DonutChart
                    segments={syncSegments}
                    size={100}
                    centerLabel={String(totalDeployments)}
                    centerSub="total"
                  />
                  <div className="flex-1 min-w-0 w-full sm:w-auto">
                    <DonutLegend segments={syncSegments} />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <ActivityIcon className="size-3" />
                  <span>Last 7 days</span>
                  <Sparkline data={mockSyncHistory} width={80} height={20} className="text-blue-500 ml-auto" />
                </div>
              </CardContent>
            </Card>

            {/* Health status donut */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Health Status</CardTitle>
                  <TrendingUpIcon className="size-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
                  <DonutChart
                    segments={healthSegments}
                    size={100}
                    centerLabel={String(healthyDeployments)}
                    centerSub="healthy"
                  />
                  <div className="flex-1 min-w-0 w-full sm:w-auto">
                    <DonutLegend segments={healthSegments} />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <ActivityIcon className="size-3" />
                  <span>Last 7 days</span>
                  <Sparkline data={mockHealthHistory} width={80} height={20} className="text-green-500 ml-auto" />
                </div>
              </CardContent>
            </Card>

            {/* Resource utilization with CPU/Memory tabs */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Cluster Resources</CardTitle>
                  <Tabs value={resourceTab} onValueChange={(v) => setResourceTab(v as "cpu" | "memory")}>
                    <TabsList className="h-7">
                      <TabsTrigger value="cpu" className="text-xs gap-1 px-2">
                        <CpuIcon className="size-3" />
                        CPU
                      </TabsTrigger>
                      <TabsTrigger value="memory" className="text-xs gap-1 px-2">
                        <MemoryStickIcon className="size-3" />
                        Memory
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent>
                <BarList items={resourceTab === "cpu" ? cpuItems : memoryItems} className="mt-1" />
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-green-500" /> Normal
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-yellow-500" /> High
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-red-500" /> Critical
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom row: recent activity + needs attention */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Recent activity */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                  <ClockIcon className="size-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-0.5">
                  {mockRecentActivity.slice(0, 8).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 rounded-lg p-2 hover:bg-muted/50 transition-colors">
                      <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg mt-0.5", activityStatusStyles[activity.status])}>
                        {activityIcons[activity.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-snug">{activity.message}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                          <span className="truncate">{activity.cluster}</span>
                          <span>·</span>
                          <span className="shrink-0">{formatRelativeTime(activity.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Needs attention */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
                  <ZapIcon className="size-4 text-yellow-500" />
                </div>
              </CardHeader>
              <CardContent>
                {needsAttention.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <CircleCheckIcon className="size-8 text-green-500" />
                    <p className="text-sm text-muted-foreground">All deployments healthy</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {needsAttention.map((dep) => (
                      <Link key={dep.id} href="/deployments">
                        <div className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-muted/50 transition-colors cursor-pointer">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-700 dark:text-red-400">
                            <CircleAlertIcon className="size-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-sm truncate block">{dep.name}</span>
                            <div className="flex flex-wrap items-center gap-2 mt-0.5">
                              <SyncStatusBadge status={dep.syncStatus} />
                              <HealthStatusBadge status={dep.healthStatus} />
                            </div>
                          </div>
                          <div className="hidden sm:flex flex-col items-end gap-0.5 shrink-0">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <GitBranchIcon className="size-2.5" />
                              {dep.targetCluster}
                            </span>
                            <span className="text-xs text-muted-foreground">{dep.namespace}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@repo/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@repo/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/tabs"
import { SyncStatusBadge, HealthStatusBadge } from "@/components/status-badge"
import { ProgressTrack, ProgressIndicator } from "@repo/ui/progress"
import { Progress as ProgressPrimitive } from "@base-ui/react/progress"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@repo/ui/chart"
import { PieChart, Pie, Cell, Label, AreaChart, Area, XAxis, YAxis } from "recharts"
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

function usageColor(v: number) {
  return v > 80 ? "#ef4444" : v > 60 ? "#eab308" : "#22c55e"
}

const mockSyncHistory = [8, 9, 7, 10, 9, 11, 10, 12, 11, 13, 12, 14]
const mockHealthHistory = [10, 9, 10, 8, 9, 10, 11, 10, 9, 10, 11, 10]

function DonutCard({
  title,
  icon,
  segments,
  centerLabel,
  centerSub,
  sparkData,
  sparkColor,
  chartConfig,
}: {
  title: string
  icon: React.ReactNode
  segments: { label: string; value: number; color: string }[]
  centerLabel: string
  centerSub: string
  sparkData: number[]
  sparkColor: string
  chartConfig: ChartConfig
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1
  const pieData = segments.map((s) => ({ name: s.label, value: s.value, fill: s.color }))
  const lineData = sparkData.map((v, i) => ({ day: i, value: v }))
  const sparkConfig: ChartConfig = { value: { label: "Count", color: sparkColor } }
  const gradientId = React.useId().replace(/:/g, "")

  return (
    <Card className="hover:shadow-none hover:border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <ChartContainer
            config={chartConfig}
            className="aspect-square w-[120px] shrink-0"
            initialDimension={{ width: 120, height: 120 }}
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={38}
                outerRadius={48}
                strokeWidth={1}
                paddingAngle={2}
                cornerRadius={4}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                          <tspan x={viewBox.cx} y={viewBox.cy - 6} className="fill-foreground text-lg font-semibold">
                            {centerLabel}
                          </tspan>
                          <tspan x={viewBox.cx} y={viewBox.cy + 10} className="fill-muted-foreground text-xs">
                            {centerSub}
                          </tspan>
                        </text>
                      )
                    }
                    return null
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="flex-1 min-w-0 w-full sm:w-auto">
            <div className="flex flex-col gap-2">
              {segments.map((seg) => (
                <div key={seg.label} className="flex items-center gap-2 text-sm">
                  <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                  <span className="text-muted-foreground flex-1">{seg.label}</span>
                  <span className="font-medium">{seg.value}</span>
                  <span className="text-xs text-muted-foreground w-8 text-right">
                    {Math.round((seg.value / total) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <ActivityIcon className="size-3" />
          <span>Last 7 days</span>
          <ChartContainer
            config={sparkConfig}
            className="ml-auto h-[20px] w-[80px] !aspect-auto"
            initialDimension={{ width: 80, height: 20 }}
          >
            <AreaChart data={lineData} margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
              <defs>
                <linearGradient id={`sparkGradient-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-value)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--color-value)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" hide />
              <YAxis hide domain={["dataMin", "dataMax"]} />
              <Area
                dataKey="value"
                stroke="var(--color-value)"
                strokeWidth={1.5}
                fill={`url(#sparkGradient-${gradientId})`}
                dot={false}
                type="monotone"
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
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

  const syncChartConfig: ChartConfig = {
    Synced: { label: "Synced", color: syncColors.Synced },
    OutOfSync: { label: "OutOfSync", color: syncColors.OutOfSync },
    Syncing: { label: "Syncing", color: syncColors.Syncing },
    Unknown: { label: "Unknown", color: syncColors.Unknown },
  }

  const healthChartConfig: ChartConfig = {
    Healthy: { label: "Healthy", color: healthColors.Healthy },
    Degraded: { label: "Degraded", color: healthColors.Degraded },
    Progressing: { label: "Progressing", color: healthColors.Progressing },
    Missing: { label: "Missing", color: healthColors.Missing },
    Unknown: { label: "Unknown", color: healthColors.Unknown },
  }

  const needsAttention = mockDeployments
    .filter((d) => d.syncStatus === "OutOfSync" || d.healthStatus === "Degraded" || d.healthStatus === "Missing")
    .slice(0, 5)

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <h1 className="text-base font-medium">Overview</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 rounded-tl-2xl bg-background border-l border-t border-border">
          {/* Charts row */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <DonutCard
              title="Sync Status"
              icon={<RefreshCcwIcon className="size-4 text-muted-foreground" />}
              segments={syncSegments}
              centerLabel={String(totalDeployments)}
              centerSub="total"
              sparkData={mockSyncHistory}
              sparkColor="#3b82f6"
              chartConfig={syncChartConfig}
            />

            <DonutCard
              title="Health Status"
              icon={<TrendingUpIcon className="size-4 text-muted-foreground" />}
              segments={healthSegments}
              centerLabel={String(healthyDeployments)}
              centerSub="healthy"
              sparkData={mockHealthHistory}
              sparkColor="#22c55e"
              chartConfig={healthChartConfig}
            />

            {/* Resource utilization with CPU/Memory tabs */}
            <Card className="hover:shadow-none hover:border-border">
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
                <div className="flex flex-col gap-3 mt-1">
                  {(resourceTab === "cpu" ? cpuItems : memoryItems).map((item) => (
                    <div key={item.label} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="truncate">{item.label}</span>
                        <span className="text-muted-foreground text-xs shrink-0 ml-2">{item.sub}</span>
                      </div>
                      <ProgressPrimitive.Root value={item.value} max={item.max} data-slot="progress" className="flex flex-wrap gap-0">
                        <ProgressTrack className="h-2">
                          <ProgressIndicator
                            className="rounded-full transition-all duration-500"
                            style={{ backgroundColor: item.color }}
                          />
                        </ProgressTrack>
                      </ProgressPrimitive.Root>
                    </div>
                  ))}
                </div>
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
            <Card className="hover:shadow-none hover:border-border">
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
            <Card className="hover:shadow-none hover:border-border">
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

"use client"

import { cn } from "@/lib/utils"

interface DonutSegment {
  label: string
  value: number
  color: string
}

export function DonutChart({
  segments,
  size = 120,
  strokeWidth = 16,
  centerLabel,
  centerSub,
}: {
  segments: DonutSegment[]
  size?: number
  strokeWidth?: number
  centerLabel?: string
  centerSub?: string
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/40"
        />
        {segments.map((seg, i) => {
          const length = (seg.value / total) * circumference
          const dash = `${length} ${circumference - length}`
          const circle = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          )
          offset += length
          return circle
        })}
      </svg>
      {centerLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-semibold">{centerLabel}</span>
          {centerSub && <span className="text-xs text-muted-foreground">{centerSub}</span>}
        </div>
      )}
    </div>
  )
}

export function DonutLegend({ segments }: { segments: DonutSegment[] }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1
  return (
    <div className="flex flex-col gap-2">
      {segments.map((seg, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
          <span className="text-muted-foreground flex-1">{seg.label}</span>
          <span className="font-medium">{seg.value}</span>
          <span className="text-xs text-muted-foreground w-8 text-right">
            {Math.round((seg.value / total) * 100)}%
          </span>
        </div>
      ))}
    </div>
  )
}

interface BarItem {
  label: string
  value: number
  max: number
  color?: string
  sub?: string
}

export function BarList({ items, className }: { items: BarItem[]; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {items.map((item, i) => {
        const pct = item.max > 0 ? Math.round((item.value / item.max) * 100) : 0
        const color = item.color ?? (pct > 80 ? "#ef4444" : pct > 60 ? "#eab308" : "#22c55e")
        return (
          <div key={i} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="truncate">{item.label}</span>
              <span className="text-muted-foreground text-xs shrink-0 ml-2">
                {item.sub ?? `${item.value}/${item.max}`}
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function Sparkline({
  data,
  width = 120,
  height = 32,
  color = "currentColor",
  className,
}: {
  data: number[]
  width?: number
  height?: number
  color?: string
  className?: string
}) {
  if (data.length === 0) return null
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const step = width / Math.max(data.length - 1, 1)
  const points = data
    .map((v, i) => `${i * step},${height - ((v - min) / range) * height}`)
    .join(" ")
  const areaPoints = `0,${height} ${points} ${width},${height}`

  return (
    <svg width={width} height={height} className={cn("overflow-visible", className)} style={{ color }}>
      <polygon points={areaPoints} fill="currentColor" opacity={0.1} />
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function TrendBadge({ value, positive }: { value: string; positive: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-medium",
        positive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
      )}
    >
      {positive ? "↑" : "↓"} {value}
    </span>
  )
}

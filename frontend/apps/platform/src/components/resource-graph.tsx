"use client"

import { useMemo, useCallback } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type NodeProps,
  Handle,
  Position,
  BackgroundVariant,
  MarkerType,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import type { K8sResource, ResourceEdge, EdgeType } from "@/lib/deployments"
import { cn } from "@/lib/utils"

const statusConfig: Record<string, { bg: string; border: string; dot: string; label: string }> = {
  Healthy: {
    bg: "bg-card",
    border: "border-green-500/40",
    dot: "bg-green-500",
    label: "text-green-600 dark:text-green-400",
  },
  Degraded: {
    bg: "bg-card",
    border: "border-red-500/40",
    dot: "bg-red-500",
    label: "text-red-600 dark:text-red-400",
  },
  Progressing: {
    bg: "bg-card",
    border: "border-blue-500/40",
    dot: "bg-blue-500",
    label: "text-blue-600 dark:text-blue-400",
  },
  Missing: {
    bg: "bg-card",
    border: "border-orange-500/40",
    dot: "bg-orange-500",
    label: "text-orange-600 dark:text-orange-400",
  },
  Unknown: {
    bg: "bg-card",
    border: "border-border",
    dot: "bg-muted-foreground",
    label: "text-muted-foreground",
  },
}

const kindIcons: Record<string, string> = {
  Deployment: "D",
  StatefulSet: "SS",
  DaemonSet: "DS",
  ReplicaSet: "RS",
  Pod: "P",
  Service: "SV",
  Ingress: "IN",
  ConfigMap: "CM",
  Secret: "SE",
  Job: "J",
  CronJob: "CJ",
  HorizontalPodAutoscaler: "HPA",
  PersistentVolumeClaim: "PVC",
  NetworkPolicy: "NP",
  ServiceAccount: "SA",
  Role: "RL",
  RoleBinding: "RB",
}

const edgeStyleMap: Record<EdgeType, { stroke: string; dashed: boolean; animated: boolean }> = {
  owner: { stroke: "#94a3b8", dashed: false, animated: false },
  selector: { stroke: "#6366f1", dashed: true, animated: true },
  ingress: { stroke: "#f59e0b", dashed: true, animated: true },
  config: { stroke: "#22c55e", dashed: false, animated: false },
  volume: { stroke: "#a855f7", dashed: true, animated: false },
  scaling: { stroke: "#06b6d4", dashed: false, animated: false },
}

interface ResourceNodeData {
  resource: K8sResource
  [key: string]: unknown
}

function ResourceNode({ data }: NodeProps) {
  const { resource } = data as ResourceNodeData
  const fallback = statusConfig["Unknown"]!
  const config = statusConfig[resource.status] ?? fallback
  const icon = kindIcons[resource.kind] ?? "?"
  const isProgressing = resource.status === "Progressing"

  return (
    <div
      className={cn(
        "rounded-2xl border-2 bg-card px-4 py-3 shadow-md min-w-[170px] max-w-[240px] transition-all",
        config.border,
      )}
    >
      <Handle type="target" position={Position.Left} className="!h-2 !w-2 !border-0 !bg-muted-foreground/40" />

      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-xl text-[10px] font-bold",
            "bg-muted text-muted-foreground",
          )}
        >
          {icon}
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-xs font-semibold truncate">{resource.name}</span>
          <span className="text-[10px] text-muted-foreground">{resource.kind}</span>
        </div>
        <span className={cn("size-2.5 shrink-0 rounded-full", config.dot)} />
      </div>

      {resource.ready && (
        <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground border-t border-border/50 pt-2">
          <span className="font-medium">{resource.ready}</span>
          {resource.image && (
            <>
              <span className="text-foreground/20">·</span>
              <span className="truncate font-mono">{resource.image.split("/").pop()}</span>
            </>
          )}
        </div>
      )}

      {isProgressing && (
        <div className="mt-1.5 flex items-center gap-1 text-[10px] font-medium text-blue-600 dark:text-blue-400">
          <svg className="size-3 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Progressing
        </div>
      )}

      <Handle type="source" position={Position.Right} className="!h-2 !w-2 !border-0 !bg-muted-foreground/40" />
    </div>
  )
}

const nodeTypes = { resource: ResourceNode }

function buildNodesAndEdges(
  resources: K8sResource[],
  edges: ResourceEdge[],
): { nodes: Node[]; edges: Edge[] } {
  // Group resources by kind for horizontal layering
  const layerOrder = [
    "Ingress",
    "HorizontalPodAutoscaler",
    "Service",
    "Deployment",
    "StatefulSet",
    "DaemonSet",
    "ConfigMap",
    "Secret",
    "ReplicaSet",
    "Pod",
    "PersistentVolumeClaim",
    "ServiceAccount",
    "Role",
    "RoleBinding",
    "NetworkPolicy",
    "Job",
    "CronJob",
  ]

  const layerMap = new Map<string, number>()
  layerOrder.forEach((kind, i) => layerMap.set(kind, i))

  // Group by layer
  const layers = new Map<number, K8sResource[]>()
  for (const r of resources) {
    const layer = layerMap.get(r.kind) ?? 99
    if (!layers.has(layer)) layers.set(layer, [])
    layers.get(layer)!.push(r)
  }

  const sortedLayers = [...layers.entries()].sort((a, b) => a[0] - b[0])

  const nodes: Node[] = []
  const H_SPACING = 280
  const V_SPACING = 90

  sortedLayers.forEach(([, layerResources], layerCol) => {
    const col = layerCol
    layerResources.forEach((resource, rowIdx) => {
      const rowCount = layerResources.length
      const yOffset = (rowIdx - (rowCount - 1) / 2) * V_SPACING
      nodes.push({
        id: resource.id,
        type: "resource",
        position: { x: col * H_SPACING, y: yOffset },
        data: { resource },
      })
    })
  })

  const flowEdges: Edge[] = edges.map((edge) => {
    const style = edgeStyleMap[edge.type] ?? edgeStyleMap.owner
    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: "smoothstep",
      animated: style.animated,
      style: {
        stroke: style.stroke,
        strokeWidth: 2,
        strokeDasharray: style.dashed ? "6 4" : undefined,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 16,
        height: 16,
        color: style.stroke,
      },
      label: edge.label,
      labelStyle: {
        fontSize: 10,
        fill: "#94a3b8",
        fontWeight: 500,
      },
      labelBgStyle: {
        fill: "var(--color-card, #fff)",
        fillOpacity: 0.9,
      },
    }
  })

  return { nodes, edges: flowEdges }
}

export function ResourceGraph({
  resources,
  edges,
}: {
  resources: K8sResource[]
  edges: ResourceEdge[]
}) {
  const { nodes, edges: flowEdges } = useMemo(
    () => buildNodesAndEdges(resources, edges),
    [resources, edges],
  )

  const onInit = useCallback((instance: { fitView: () => void }) => {
    setTimeout(() => instance.fitView(), 100)
  }, [])

  if (resources.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center bg-muted/20">
        <p className="text-sm text-muted-foreground">No resources to display</p>
      </div>
    )
  }

  return (
    <div className="h-[480px] w-full bg-muted/10 overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        onInit={onInit}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ type: "smoothstep" }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#e2e8f0" />
        <Controls
          className="!border-border !bg-card !shadow-md !rounded-xl"
          showInteractive={false}
        />
        <MiniMap
          className="!bg-muted/40 !border-border !rounded-xl"
          nodeColor={(node) => {
            const resource = (node.data as ResourceNodeData)?.resource
            const config = statusConfig[resource?.status ?? "Unknown"]
            const dotColor = config?.dot ?? "bg-muted-foreground"
            if (dotColor.includes("green")) return "#22c55e"
            if (dotColor.includes("red")) return "#ef4444"
            if (dotColor.includes("blue")) return "#3b82f6"
            if (dotColor.includes("orange")) return "#f97316"
            return "#94a3b8"
          }}
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  )
}

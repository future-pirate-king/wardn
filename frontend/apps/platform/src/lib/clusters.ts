export type ClusterStatus = "Connected" | "Disconnected" | "Error" | "Unknown"
export type ClusterProvider = "AWS" | "GCP" | "Azure" | "On-Prem" | "Kind" | "Other"

export interface Cluster {
  id: string
  name: string
  serverUrl: string
  namespace: string
  status: ClusterStatus
  provider: ClusterProvider
  region: string
  version: string
  nodeCount: number
  cpuUsage: number
  memoryUsage: number
  deploymentCount: number
  healthyDeployments: number
  lastSeen: string | null
  createdAt: string
}

export const clusterStatuses: ClusterStatus[] = ["Connected", "Disconnected", "Error", "Unknown"]
export const clusterProviders: ClusterProvider[] = ["AWS", "GCP", "Azure", "On-Prem", "Kind", "Other"]

export const mockClusters: Cluster[] = [
  {
    id: "1",
    name: "prod-cluster",
    serverUrl: "https://10.0.1.10:6443",
    namespace: "wardn-system",
    status: "Connected",
    provider: "AWS",
    region: "us-east-1",
    version: "v1.31.2",
    nodeCount: 8,
    cpuUsage: 62,
    memoryUsage: 71,
    deploymentCount: 9,
    healthyDeployments: 8,
    lastSeen: "2026-08-30T09:15:00Z",
    createdAt: "2026-07-15T10:00:00Z",
  },
  {
    id: "2",
    name: "staging-cluster",
    serverUrl: "https://10.0.2.20:6443",
    namespace: "wardn-system",
    status: "Connected",
    provider: "AWS",
    region: "us-east-1",
    version: "v1.30.4",
    nodeCount: 4,
    cpuUsage: 34,
    memoryUsage: 45,
    deploymentCount: 4,
    healthyDeployments: 3,
    lastSeen: "2026-08-30T09:10:00Z",
    createdAt: "2026-07-20T14:30:00Z",
  },
  {
    id: "3",
    name: "prod-cluster-eu",
    serverUrl: "https://10.1.1.10:6443",
    namespace: "wardn-system",
    status: "Connected",
    provider: "AWS",
    region: "eu-west-1",
    version: "v1.31.2",
    nodeCount: 6,
    cpuUsage: 55,
    memoryUsage: 68,
    deploymentCount: 4,
    healthyDeployments: 3,
    lastSeen: "2026-08-30T09:18:00Z",
    createdAt: "2026-08-01T09:00:00Z",
  },
  {
    id: "4",
    name: "dev-cluster",
    serverUrl: "https://192.168.1.100:6443",
    namespace: "wardn-system",
    status: "Disconnected",
    provider: "Kind",
    region: "local",
    version: "v1.29.6",
    nodeCount: 1,
    cpuUsage: 0,
    memoryUsage: 0,
    deploymentCount: 0,
    healthyDeployments: 0,
    lastSeen: "2026-08-28T18:00:00Z",
    createdAt: "2026-06-10T12:00:00Z",
  },
  {
    id: "5",
    name: "edge-cluster-tokyo",
    serverUrl: "https://10.2.1.10:6443",
    namespace: "wardn-system",
    status: "Error",
    provider: "GCP",
    region: "asia-northeast1",
    version: "v1.30.4",
    nodeCount: 3,
    cpuUsage: 88,
    memoryUsage: 92,
    deploymentCount: 2,
    healthyDeployments: 0,
    lastSeen: "2026-08-30T08:45:00Z",
    createdAt: "2026-08-10T08:00:00Z",
  },
  {
    id: "6",
    name: "onprem-cluster",
    serverUrl: "https://172.16.0.10:6443",
    namespace: "wardn-system",
    status: "Connected",
    provider: "On-Prem",
    region: "datacenter-1",
    version: "v1.28.10",
    nodeCount: 12,
    cpuUsage: 48,
    memoryUsage: 53,
    deploymentCount: 6,
    healthyDeployments: 5,
    lastSeen: "2026-08-30T09:19:00Z",
    createdAt: "2026-05-01T10:00:00Z",
  },
  {
    id: "7",
    name: "azure-prod-west",
    serverUrl: "https://20.0.1.10:6443",
    namespace: "wardn-system",
    status: "Unknown",
    provider: "Azure",
    region: "westus2",
    version: "v1.31.0",
    nodeCount: 5,
    cpuUsage: 0,
    memoryUsage: 0,
    deploymentCount: 0,
    healthyDeployments: 0,
    lastSeen: null,
    createdAt: "2026-08-25T16:00:00Z",
  },
]

export interface RecentActivity {
  id: string
  type: "sync" | "health" | "cluster" | "deployment"
  message: string
  cluster: string
  timestamp: string
  status: "success" | "warning" | "error" | "info"
}

export const mockRecentActivity: RecentActivity[] = [
  {
    id: "1",
    type: "sync",
    message: "checkout-service synced to revision a1b2c3d",
    cluster: "prod-cluster",
    timestamp: "2026-08-30T09:12:00Z",
    status: "success",
  },
  {
    id: "2",
    type: "health",
    message: "catalog-service health degraded",
    cluster: "prod-cluster",
    timestamp: "2026-08-30T08:30:00Z",
    status: "warning",
  },
  {
    id: "3",
    type: "sync",
    message: "user-service syncing — revision m0n1o2p",
    cluster: "staging-cluster",
    timestamp: "2026-08-30T09:00:00Z",
    status: "info",
  },
  {
    id: "4",
    type: "cluster",
    message: "edge-cluster-tokyo connection error",
    cluster: "edge-cluster-tokyo",
    timestamp: "2026-08-30T08:45:00Z",
    status: "error",
  },
  {
    id: "5",
    type: "sync",
    message: "payment-service synced to revision q3r4s5t",
    cluster: "prod-cluster-eu",
    timestamp: "2026-08-30T07:45:00Z",
    status: "success",
  },
  {
    id: "6",
    type: "health",
    message: "search-service health degraded",
    cluster: "prod-cluster",
    timestamp: "2026-08-30T08:30:00Z",
    status: "warning",
  },
  {
    id: "7",
    type: "cluster",
    message: "dev-cluster disconnected",
    cluster: "dev-cluster",
    timestamp: "2026-08-28T18:00:00Z",
    status: "error",
  },
  {
    id: "8",
    type: "sync",
    message: "auth-service synced to revision g5h6i7j",
    cluster: "prod-cluster",
    timestamp: "2026-08-30T05:00:00Z",
    status: "success",
  },
]

export type SyncStatus = "Synced" | "OutOfSync" | "Syncing" | "Unknown"
export type HealthStatus = "Healthy" | "Degraded" | "Progressing" | "Missing" | "Unknown"
export type ManifestType = "Raw" | "Helm"
export type SyncPolicyType = "Automated" | "Manual"

export type ResourceType =
  | "Deployment"
  | "StatefulSet"
  | "DaemonSet"
  | "ReplicaSet"
  | "Pod"
  | "Service"
  | "Ingress"
  | "ConfigMap"
  | "Secret"
  | "Job"
  | "CronJob"
  | "HorizontalPodAutoscaler"
  | "PersistentVolumeClaim"
  | "NetworkPolicy"
  | "ServiceAccount"
  | "Role"
  | "RoleBinding"

export type ResourceStatus = HealthStatus

export type EdgeType = "owner" | "selector" | "ingress" | "config" | "volume" | "scaling"

export interface K8sResource {
  id: string
  name: string
  kind: ResourceType
  namespace: string
  status: ResourceStatus
  syncStatus: SyncStatus
  manifest: string
  liveManifest?: string
  age: string
  ready?: string
  image?: string
  ports?: string
}

export interface ResourceEdge {
  id: string
  source: string
  target: string
  type: EdgeType
  label?: string
}

export interface Component {
  id: string
  name: string
  namespace: string
  repoURL: string
  branch: string
  path: string
  manifestType: ManifestType
  syncPolicy: SyncPolicyType
  syncStatus: SyncStatus
  healthStatus: HealthStatus
  revision: string
  lastSyncAt: string | null
  autoSync: boolean
  prune: boolean
  selfHeal: boolean
  resources: K8sResource[]
  edges: ResourceEdge[]
}

export interface Deployment {
  id: string
  name: string
  namespace: string
  project: string
  targetCluster: string
  syncStatus: SyncStatus
  healthStatus: HealthStatus
  lastSyncAt: string | null
  createdAt: string
  components: Component[]
}

export const syncStatuses: SyncStatus[] = ["Synced", "OutOfSync", "Syncing", "Unknown"]
export const healthStatuses: HealthStatus[] = ["Healthy", "Degraded", "Progressing", "Missing", "Unknown"]
export const manifestTypes: ManifestType[] = ["Raw", "Helm"]
export const syncPolicyTypes: SyncPolicyType[] = ["Automated", "Manual"]

const yamlDeployment = (name: string, namespace: string, image: string, replicas: number, configMap?: string) => `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${name}
  namespace: ${namespace}
  labels:
    app: ${name}
spec:
  replicas: ${replicas}
  selector:
    matchLabels:
      app: ${name}
  template:
    metadata:
      labels:
        app: ${name}
    spec:
      containers:
      - name: ${name}
        image: ${image}
        ports:
        - containerPort: 8080
        envFrom:
        - configMapRef:
            name: ${configMap ?? `${name}-config`}
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 500m
            memory: 512Mi`

const yamlDeploymentLive = (name: string, namespace: string, image: string, replicas: number, configMap?: string) => `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${name}
  namespace: ${namespace}
  labels:
    app: ${name}
spec:
  replicas: ${replicas + 1}
  selector:
    matchLabels:
      app: ${name}
  template:
    metadata:
      labels:
        app: ${name}
    spec:
      containers:
      - name: ${name}
        image: ${image.replace(':v1', ':v2')}
        ports:
        - containerPort: 8080
        envFrom:
        - configMapRef:
            name: ${configMap ?? `${name}-config`}
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 500m
            memory: 512Mi`

const yamlService = (name: string, namespace: string, port: number) => `apiVersion: v1
kind: Service
metadata:
  name: ${name}
  namespace: ${namespace}
spec:
  selector:
    app: ${name}
  ports:
  - port: ${port}
    targetPort: 8080
    protocol: TCP`

const yamlIngress = (name: string, namespace: string, serviceName: string, host: string) => `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ${name}
  namespace: ${namespace}
spec:
  rules:
  - host: ${host}
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: ${serviceName}
            port:
              number: 8080`

const yamlConfigMap = (name: string, namespace: string) => `apiVersion: v1
kind: ConfigMap
metadata:
  name: ${name}
  namespace: ${namespace}
data:
  LOG_LEVEL: info
  DB_HOST: postgres.${namespace}.svc.cluster.local
  DB_PORT: "5432"`

const yamlHPA = (name: string, namespace: string, min: number, max: number) => `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ${name}
  namespace: ${namespace}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ${name}
  minReplicas: ${min}
  maxReplicas: ${max}
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70`

function makeComponent(
  id: string,
  name: string,
  namespace: string,
  repoURL: string,
  branch: string,
  path: string,
  manifestType: ManifestType,
  syncPolicy: SyncPolicyType,
  syncStatus: SyncStatus,
  healthStatus: HealthStatus,
  revision: string,
  lastSyncAt: string | null,
  autoSync: boolean,
  prune: boolean,
  selfHeal: boolean,
  image: string,
  replicas: number,
  hasIngress: boolean,
  hasHPA: boolean,
  hasConfigMap: boolean,
  podCount: number,
  outOfSync: boolean,
): Component {
  const resources: K8sResource[] = []
  const edges: ResourceEdge[] = []
  const cmName = `${name}-config`

  resources.push({
    id: `${id}-deploy`,
    name,
    kind: "Deployment",
    namespace,
    status: healthStatus,
    syncStatus: outOfSync ? "OutOfSync" : syncStatus,
    manifest: yamlDeployment(name, namespace, image, replicas, hasConfigMap ? cmName : undefined),
    liveManifest: outOfSync ? yamlDeploymentLive(name, namespace, image, replicas, hasConfigMap ? cmName : undefined) : undefined,
    age: "5d",
    ready: `${replicas}/${replicas}`,
    image,
  })

  resources.push({
    id: `${id}-rs`,
    name: `${name}-${revision}`,
    kind: "ReplicaSet",
    namespace,
    status: healthStatus,
    syncStatus,
    manifest: `apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: ${name}-${revision}
  namespace: ${namespace}
owners:
- ${name}`,
    age: "5d",
    ready: `${replicas}/${replicas}`,
  })
  edges.push({ id: `${id}-deploy-rs`, source: `${id}-deploy`, target: `${id}-rs`, type: "owner" })

  for (let i = 0; i < podCount; i++) {
    const podId = `${id}-pod-${i + 1}`
    const podName = `${name}-${revision}-${String.fromCharCode(97 + i)}${Math.floor(Math.random() * 9000 + 1000)}`
    resources.push({
      id: podId,
      name: podName,
      kind: "Pod",
      namespace,
      status: i === 0 && healthStatus === "Degraded" ? "Degraded" : "Healthy",
      syncStatus,
      manifest: `apiVersion: v1
kind: Pod
metadata:
  name: ${podName}
  namespace: ${namespace}
owners:
- ${name}-${revision}`,
      age: `${i + 1}h`,
      ready: "1/1",
      image,
    })
    edges.push({ id: `${id}-rs-${podId}`, source: `${id}-rs`, target: podId, type: "owner" })
  }

  resources.push({
    id: `${id}-svc`,
    name,
    kind: "Service",
    namespace,
    status: "Healthy",
    syncStatus,
    manifest: yamlService(name, namespace, 8080),
    age: "5d",
    ports: "8080",
  })
  for (let i = 0; i < podCount; i++) {
    edges.push({ id: `${id}-svc-pod-${i}`, source: `${id}-svc`, target: `${id}-pod-${i + 1}`, type: "selector" })
  }

  if (hasIngress) {
    const ingressName = `${name}-ingress`
    resources.push({
      id: `${id}-ingress`,
      name: ingressName,
      kind: "Ingress",
      namespace,
      status: "Healthy",
      syncStatus,
      manifest: yamlIngress(ingressName, namespace, name, `${name}.acme.io`),
      age: "5d",
    })
    edges.push({ id: `${id}-ingress-svc`, source: `${id}-ingress`, target: `${id}-svc`, type: "ingress" })
  }

  if (hasConfigMap) {
    resources.push({
      id: `${id}-cm`,
      name: cmName,
      kind: "ConfigMap",
      namespace,
      status: "Healthy",
      syncStatus,
      manifest: yamlConfigMap(cmName, namespace),
      age: "5d",
    })
    edges.push({ id: `${id}-cm-deploy`, source: `${id}-cm`, target: `${id}-deploy`, type: "config" })
  }

  if (hasHPA) {
    resources.push({
      id: `${id}-hpa`,
      name,
      kind: "HorizontalPodAutoscaler",
      namespace,
      status: "Healthy",
      syncStatus,
      manifest: yamlHPA(name, namespace, replicas, replicas * 4),
      age: "3d",
    })
    edges.push({ id: `${id}-hpa-deploy`, source: `${id}-hpa`, target: `${id}-deploy`, type: "scaling" })
  }

  return {
    id,
    name,
    namespace,
    repoURL,
    branch,
    path,
    manifestType,
    syncPolicy,
    syncStatus,
    healthStatus,
    revision,
    lastSyncAt,
    autoSync,
    prune,
    selfHeal,
    resources,
    edges,
  }
}

export const mockDeployments: Deployment[] = [
  {
    id: "1",
    name: "checkout",
    namespace: "checkout",
    project: "prod-apps",
    targetCluster: "prod-cluster (us-east-1)",
    syncStatus: "Synced",
    healthStatus: "Healthy",
    lastSyncAt: "2026-08-30T06:12:00Z",
    createdAt: "2026-07-15T10:00:00Z",
    components: [
      makeComponent(
        "1-1", "checkout-service", "checkout",
        "https://github.com/acme/checkout", "main", "/services/checkout",
        "Raw", "Automated", "Synced", "Healthy",
        "a1b2c3d", "2026-08-30T06:12:00Z",
        true, true, true,
        "ghcr.io/acme/checkout-service:v1.2.3", 3,
        true, true, true, 3, false,
      ),
      makeComponent(
        "1-2", "checkout-worker", "checkout",
        "https://github.com/acme/checkout", "main", "/services/checkout-worker",
        "Raw", "Automated", "Synced", "Healthy",
        "a1b2c3d", "2026-08-30T06:12:00Z",
        true, true, true,
        "ghcr.io/acme/checkout-worker:v1.2.3", 2,
        false, false, true, 2, false,
      ),
    ],
  },
  {
    id: "2",
    name: "catalog",
    namespace: "catalog",
    project: "prod-apps",
    targetCluster: "prod-cluster (us-east-1)",
    syncStatus: "OutOfSync",
    healthStatus: "Degraded",
    lastSyncAt: "2026-08-30T04:30:00Z",
    createdAt: "2026-07-20T14:30:00Z",
    components: [
      makeComponent(
        "2-1", "catalog-api", "catalog",
        "https://github.com/acme/catalog", "main", "/services/catalog-api",
        "Helm", "Automated", "OutOfSync", "Degraded",
        "e4f5g6h", "2026-08-30T04:30:00Z",
        true, true, false,
        "ghcr.io/acme/catalog-api:v2.1.0", 3,
        true, true, true, 3, true,
      ),
      makeComponent(
        "2-2", "catalog-worker", "catalog",
        "https://github.com/acme/catalog", "main", "/services/catalog-worker",
        "Helm", "Automated", "Synced", "Healthy",
        "e4f5g6h", "2026-08-30T04:30:00Z",
        true, true, false,
        "ghcr.io/acme/catalog-worker:v2.1.0", 2,
        false, false, true, 2, false,
      ),
    ],
  },
  {
    id: "3",
    name: "gateway",
    namespace: "gateway",
    project: "infra",
    targetCluster: "prod-cluster (us-east-1)",
    syncStatus: "Synced",
    healthStatus: "Healthy",
    lastSyncAt: "2026-08-29T22:15:00Z",
    createdAt: "2026-08-01T09:00:00Z",
    components: [
      makeComponent(
        "3-1", "api-gateway", "gateway",
        "https://github.com/acme/platform-gateway", "release", "/",
        "Raw", "Manual", "Synced", "Healthy",
        "i7j8k9l", "2026-08-29T22:15:00Z",
        false, false, false,
        "ghcr.io/acme/api-gateway:v3.0.1", 2,
        true, false, false, 2, false,
      ),
      makeComponent(
        "3-2", "rate-limiter", "gateway",
        "https://github.com/acme/rate-limiter", "main", "/",
        "Raw", "Manual", "Synced", "Degraded",
        "a0b1c2d", "2026-08-29T10:00:00Z",
        false, false, false,
        "ghcr.io/acme/rate-limiter:v1.5.0", 1,
        false, false, false, 1, false,
      ),
    ],
  },
  {
    id: "4",
    name: "payments",
    namespace: "payments",
    project: "prod-apps",
    targetCluster: "prod-cluster-eu (eu-west-1)",
    syncStatus: "Synced",
    healthStatus: "Healthy",
    lastSyncAt: "2026-08-30T07:45:00Z",
    createdAt: "2026-07-25T12:00:00Z",
    components: [
      makeComponent(
        "4-1", "payment-service", "payments",
        "https://github.com/acme/payments", "main", "/k8s",
        "Raw", "Automated", "Synced", "Healthy",
        "q3r4s5t", "2026-08-30T07:45:00Z",
        true, true, true,
        "ghcr.io/acme/payment-service:v1.8.2", 3,
        true, true, true, 3, false,
      ),
      makeComponent(
        "4-2", "payment-webhook", "payments",
        "https://github.com/acme/payments", "main", "/k8s/webhook",
        "Raw", "Automated", "Synced", "Healthy",
        "q3r4s5t", "2026-08-30T07:45:00Z",
        true, true, true,
        "ghcr.io/acme/payment-webhook:v1.8.2", 2,
        false, false, true, 2, false,
      ),
    ],
  },
  {
    id: "5",
    name: "auth",
    namespace: "auth",
    project: "infra",
    targetCluster: "prod-cluster (us-east-1)",
    syncStatus: "Syncing",
    healthStatus: "Progressing",
    lastSyncAt: "2026-08-30T09:00:00Z",
    createdAt: "2026-06-10T12:00:00Z",
    components: [
      makeComponent(
        "5-1", "auth-service", "auth",
        "https://github.com/acme/auth", "main", "/k8s",
        "Raw", "Automated", "Syncing", "Progressing",
        "g5h6i7j", "2026-08-30T09:00:00Z",
        true, true, true,
        "ghcr.io/acme/auth-service:v2.4.0", 3,
        true, true, true, 3, false,
      ),
    ],
  },
  {
    id: "6",
    name: "analytics",
    namespace: "analytics",
    project: "data",
    targetCluster: "prod-cluster-eu (eu-west-1)",
    syncStatus: "Unknown",
    healthStatus: "Unknown",
    lastSyncAt: null,
    createdAt: "2026-08-25T16:00:00Z",
    components: [
      makeComponent(
        "6-1", "analytics-pipeline", "analytics",
        "https://github.com/acme/analytics", "main", "/deploy",
        "Raw", "Automated", "Unknown", "Unknown",
        "c2d3e4f", null,
        true, true, true,
        "ghcr.io/acme/analytics-pipeline:v0.9.0", 1,
        false, false, false, 0, false,
      ),
    ],
  },
]

export function getDeployment(id: string): Deployment | undefined {
  return mockDeployments.find((d) => d.id === id)
}

export function getComponent(deploymentId: string, componentId: string): Component | undefined {
  const deployment = getDeployment(deploymentId)
  return deployment?.components.find((c) => c.id === componentId)
}

export function getComponentResourceCount(comp: Component): number {
  return comp.resources.length
}

export function getDeploymentResourceCount(deployment: Deployment): number {
  return deployment.components.reduce((sum, c) => sum + c.resources.length, 0)
}

export const clusters = [
  "prod-cluster (us-east-1)",
  "staging-cluster (us-east-1)",
  "prod-cluster-eu (eu-west-1)",
]

export const projects = ["prod-apps", "infra", "data"]

export const resourceTypeIcons: Record<ResourceType, string> = {
  Deployment: "D",
  StatefulSet: "S",
  DaemonSet: "DS",
  ReplicaSet: "R",
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

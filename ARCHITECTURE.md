# wardn — Architecture & Roadmap

## Overview

wardn is a GitOps continuous delivery platform for Kubernetes. It aims for **ArgoCD-level feature parity** while keeping self-hosting, day-to-day usage, and UI/UX simple.

**Core principle:** Enterprise features, not enterprise complexity.

---

## Component Topology

```
┌──────────────────────────────────────────────────────────────┐
│                         wardn Stack                          │
│                                                               │
│  ┌──────────┐    ┌──────────┐    ┌────────────────┐          │
│  │ Frontend  │───▶│  Server  │───▶│   Postgres     │          │
│  │ (Next.js) │    │ (Go API) │    │  (state store) │          │
│  └──────────┘    └────┬─────┘    └────────────────┘          │
│                       │                                        │
│                       ├──▶ Redis (cache + pubsub)             │
│                       │                                        │
│                       ├──▶ Operator (k8s controller)          │
│                       │     - watches GitApplication          │
│                       │     - git clone/pull                  │
│                       │     - manifest parse + SOPS decrypt   │
│                       │     - apply to cluster                │
│                       │     - health checks                   │
│                       │                                        │
│                       └──▶ Webhook receiver                   │
│                                                                │
│  Secret Management (3 integration layers):                    │
│                                                                │
│  Layer 1: SOPS — decrypt at apply time (AWS KMS, GCP, age)    │
│  Layer 2: External Secrets Operator — watch ESO CRD status    │
│  Layer 3: Vault Direct — fetch from Vault (optional)          │
│                                                                │
│  External (existing in cluster, not deployed by wardn):       │
│  ├── External Secrets Operator (syncs to k8s Secrets)         │
│  └── HashiCorp Vault (optional, direct or via ESO)            │
└──────────────────────────────────────────────────────────────┘
```

### Deployable Components (3)

| Component | Technology | Role |
|-----------|-----------|------|
| **Server** | Go binary (REST + gRPC) | API, auth, RBAC, cluster management, diff engine, sync orchestration, audit log |
| **Operator** | Go binary (kubebuilder/controller-runtime) | Reconciliation loop: git sync, manifest parse, apply, health checks |
| **Frontend** | Next.js (static build) | Dashboard, app management, sync UI, settings, real-time updates |

### Stateful Components (2)

| Component | Role |
|-----------|------|
| **Postgres** | Users, projects, RBAC, clusters, repo credentials, sync history, audit log |
| **Redis** | Cache (git metadata, parsed manifests, health results), pub/sub (real-time updates), session store, rate limiting |

### Comparison with ArgoCD

ArgoCD deploys 5+ separate services (argocd-server, argocd-repo-server, argocd-application-controller, argocd-dex, argocd-redis). wardn deploys 3 pods + 2 statefulsets in a single namespace. Secret management is via integration (SOPS, ESO, Vault) — no extra component to run.

---

## Component Details

### 1. Server (new)

The central API layer. Equivalent to ArgoCD's `argocd-server` but with built-in auth (no separate Dex).

**Responsibilities:**

- **REST API** — CRUD for GitApplications, clusters, projects, users, credentials
- **Auth** — OIDC (Google/GitHub/Keycloak) + local users stored in Postgres, session management via Redis
- **RBAC** — project-scoped permissions (read/sync/admin), stored in Postgres, enforced at API level
- **Cluster management** — register external clusters (store kubeconfig in Secrets), test connectivity
- **Repository credentials** — store git creds (SSH keys, tokens) in k8s Secrets, referenced by GitApplications
- **Diff engine** — live vs desired state comparison, served to frontend
- **Sync orchestration** — manual sync trigger, sync history, rollback to previous revision
- **Real-time updates** — SSE/WebSocket to frontend via Redis pub/sub
- **Audit log** — who did what, stored in Postgres
- **Secret management** — unified interface for SOPS, External Secrets Operator, and Vault (see Secret Management section)

**Tech stack:**
- Go standard library + `chi` or `gin` router
- `coreos/go-oidc` for OIDC
- `jackc/pgx` for Postgres
- `redis/go-redis` for Redis
- `golang.org/x/crypto` for password hashing

### 2. Operator (evolve existing)

Keep the kubebuilder pattern. The reconciliation loop is already scaffolded — needs the execution layer filled in.

**Current state (scaffolded):**
- `GitApplication` CRD with full spec (RepoURL, Branch, Path, ManifestType, HelmConfig, TargetCluster, SyncPolicy, Notifications, Webhook)
- Reconciliation pipeline: clone/pull → parse → compare revision → check sync policy → apply → health check → update status + notify
- Git client (shallow clone, fetch + hard reset, revision tracking)
- Status tracking (SyncStatus, HealthStatus, per-resource ResourceStatus, Conditions, PreviousRevisions)
- Slack notifications on sync success/failure
- GitHub webhook handler (partial)
- Leader election, metrics, health probes

**What needs to be built:**

| Feature | Current | Target |
|---------|---------|--------|
| Server-side apply | Placeholder (logs only) | Dynamic client, 3-way merge via server-side apply |
| Git auth | None | SSH keys / HTTPS tokens from k8s Secrets |
| YAML parsing | Naive string matching | `sig.k8s.io/yaml` unmarshal |
| Health checks | All hardcoded `Healthy` | Per-kind: Deployment, StatefulSet, Service, Job, CRD (lua or Go plugins) |
| Helm rendering | Returns error | Helm Go SDK |
| Kustomize | Not started | `sigs.k8s.io/kustomize` |
| Multi-cluster | `TargetCluster` field ignored | Read cluster configs from Secrets, apply to remote clusters |
| Pruning | Empty placeholder | Track applied resources via labels, delete orphans |
| Self-heal | Not implemented | Watch live resources, re-sync on drift detection |
| Sync waves & hooks | Not in CRD | PreSync/Sync/PostSync/SyncFail hooks, wave ordering |
| Webhook validation | No signature check | HMAC validation using SecretRef |
| GitLab webhooks | Stub | Full push event parsing + token validation |
| SOPS decryption | Not implemented | Detect & decrypt SOPS-encrypted manifests at apply time |
| ESO status watching | Not implemented | Watch ExternalSecret/SecretStore CRDs, surface sync status |
| Vault direct fetch | Not implemented | Optional Vault provider for direct secret retrieval |

### 3. Frontend (evolve existing)

**Current state:** Next.js 16 + shadcn/ui + TailwindCSS. Login/signup pages only. Homepage is default template.

**UX principle:** ArgoCD's UI is powerful but cluttered. wardn should be opinionated and clean.

**Pages to build:**

| Page | Description |
|------|-------------|
| **Dashboard** | Grid/list of GitApplications with sync + health badges |
| **App Detail** | Tree/topology view of resources, sync status per resource, health per resource, diff view |
| **App Creation Wizard** | Step-by-step: pick repo → pick path → pick cluster → pick sync policy → done |
| **Sync Panel** | One-click manual sync, sync history, rollback button |
| **Diff View** | Side-by-side live vs desired with syntax highlighting |
| **Projects** | List/create projects, manage members and roles |
| **Clusters** | Register/manage clusters, connectivity status |
| **Repo Credentials** | Add/manage git credentials, assign to projects |
| **Secret Stores** | Configure and monitor secret integrations (SOPS, ESO, Vault) |
| **App Secrets Tab** | Per-app secret source status, sync state, last refreshed |
| **Settings** | Users, OIDC config, notification config |
| **Audit Log** | Searchable activity history |

**UX differentiators vs ArgoCD:**
- **Wizard for app creation** — ArgoCD dumps you into a YAML editor; wardn guides you through 4 steps
- **Visual sync diff** — side-by-side with syntax highlighting
- **One-click rollback** — front and center, not buried in menus
- **Project-scoped views** — filter by project, see only what you have access to
- **No Application vs ApplicationSet confusion** — wardn has one concept: GitApplication

**Tech stack (already chosen):**
- Next.js 16 (App Router)
- shadcn/ui components (already installed: badge, card, table, dialog, tabs, etc.)
- TailwindCSS 4
- lucide-react icons
- next-themes (dark mode ready)
- sonner (toast notifications)

---

## Data Model

### Postgres Schema

GitApplication CRDs remain the source of truth for app definitions. Postgres stores operational metadata.

```sql
-- Users & Auth
users            (id, email, name, password_hash, role, created_at, updated_at)

-- Projects (logical grouping + RBAC boundary)
projects         (id, name, description, sync_windows_json, allowed_clusters_json, created_at)
project_users    (project_id, user_id, role)  -- role: read | sync | admin

-- Cluster registration
clusters         (id, name, server_url, kubeconfig_secret_ref, namespace, status, created_at)

-- Repository credentials
repo_creds       (id, name, type, secret_ref, project_id, created_at)
  -- type: ssh | https | github-app

-- Secret stores (wardn-managed integration configs)
secret_stores    (id, name, type, backend, config_json, secret_ref, project_id, status, created_at)
  -- type: sops | external-secrets | vault
  -- backend: aws-kms | gcp-kms | azure-kv | age | vault-transit | hashicorp-vault | aws-sm | gcp-sm | azure-kv
  -- config_json: store-specific configuration (KMS key ARN, Vault address, etc.)
  -- secret_ref: k8s Secret containing credentials for the store (Vault token, AWS creds, etc.)

-- Sync history (for rollback + audit)
sync_history     (id, app_name, app_namespace, project_id, revision, previous_revision,
                   started_at, finished_at, status, triggered_by, message)

-- Audit log
audit_log        (id, user_id, action, resource_type, resource_name, details_json, timestamp)
```

### Redis Keys

```
cache:repo:{repo_url}:manifests     — parsed manifests cache
cache:repo:{repo_url}:revision      — last known revision
cache:health:{app_name}:{namespace} — health check results
cache:secrets:{store_id}            — secret store connectivity status
cache:secrets:{app_name}:{ns}       — per-app secret resolution cache
session:{session_id}                — user session data
pubsub:app:{namespace}:{name}       — status change channel for SSE
pubsub:secrets:{store_id}           — secret store status change channel
ratelimit:webhook:{source}          — webhook rate limiting
```

### CRD: GitApplication (existing, to be extended)

Current spec fields:
- `RepoURL`, `Branch`, `Path`
- `ManifestType` (Raw | Helm)
- `HelmConfig` (ValuesFile, ReleaseName, Namespace, InlineValues)
- `TargetCluster`
- `SyncPolicy` (Automated, Prune, SelfHeal)
- `Notifications` (Slack, OnSyncSuccess, OnSyncFailure, OnHealthDegraded)
- `Webhook` (Enabled, SecretRef)

Fields to add:
- `Project` — project name for RBAC scoping
- `SyncWaves` — wave ordering for resources
- `Hooks` — PreSync/Sync/PostSync/SyncFail hook resources
- `IgnoreDifferences` — json pointers for diff customization
- `CredentialRef` — reference to repo credentials Secret
- `KustomizeConfig` — kustomize-specific settings (images, overlays)
- `SecretStoreRef` — reference to a wardn-managed secret store configuration

Current status fields:
- `SyncStatus`, `HealthStatus`, `LastSyncAt`, `Revision`, `PreviousRevisions`
- `Resources[]` (per-resource sync + health status)
- `Conditions[]`

---

## Feature Parity Matrix vs ArgoCD

| ArgoCD Feature | wardn Status | wardn Plan | Priority |
|---|---|---|---|
| Git sync (raw YAML) | Scaffolded | Finish `applier.go` with server-side apply | P0 |
| Git auth (SSH/token) | Missing | Read creds from k8s Secrets | P0 |
| Proper YAML parsing | Naive string matching | `sig.k8s.io/yaml` unmarshal | P0 |
| Health checks | Hardcoded `Healthy` | Per-kind Go health checks | P0 |
| Sync policy (auto/prune/self-heal) | In CRD, not wired | Wire up logic in reconciler | P0 |
| Server (API + auth) | Missing | New Go server with Postgres + Redis | P0 |
| Frontend dashboard | Login pages only | App list, detail, sync, settings | P0 |
| Multi-cluster | Field exists, ignored | Cluster registration + remote apply | P1 |
| Helm rendering | Returns error | Helm Go SDK | P1 |
| Kustomize | Not started | `sigs.k8s.io/kustomize` | P1 |
| RBAC / Projects | Missing | Server + Postgres, UI-managed | P1 |
| SSO (OIDC) | Missing | `coreos/go-oidc` in Server | P1 |
| Diff view | Missing | Server diff engine + frontend | P1 |
| Sync history / rollback | `PreviousRevisions` in CRD | Server endpoint + frontend UI | P1 |
| Notifications (multi-channel) | Slack only | Add Teams, Email, generic webhook | P2 |
| Webhook triggers | GitHub partial | Finish GitHub + GitLab + signature validation | P2 |
| Sync waves & hooks | Not in CRD | Add to spec, implement in reconciler | P2 |
| Sync windows | Missing | Add to Project spec | P2 |
| Resource hooks | Missing | Add to CRD | P2 |
| Diff customizations | Missing | `IgnoreDifferences` in CRD | P2 |
| SOPS decryption | Not implemented | Detect & decrypt SOPS-encrypted manifests at apply time | P1 |
| ESO integration | Not implemented | Watch ExternalSecret/SecretStore CRDs, surface sync status in UI | P2 |
| Vault direct fetch | Not implemented | Optional Vault provider for direct secret retrieval | P3 |
| Secret stores UI | Missing | Unified UI for SOPS, ESO, Vault — status, config, per-app view | P2 |
| CLI | Missing | New Go binary (`wardn` CLI) | P3 |
| App-of-Apps | Missing | `GitApplicationSet` CRD (future) | P3 |
| ApplicationSet | Missing | Future CRD | P3 |

---

## Secret Management

wardn does **not** build its own secret store. It integrates with industry-standard secret management tools and provides a unified UI across all three layers.

**Design principle:** Be the glue layer with a clean interface — not the vault itself.

### Layer 1: SOPS (Git-native encrypted secrets)

**What:** [SOPS](https://github.com/getsops/sops) encrypts secret values in-place within YAML/JSON files. The encrypted file lives in git. wardn decrypts at apply time using a key provider.

**Supported key providers:** AWS KMS, GCP KMS, Azure Key Vault, HashiCorp Vault Transit, age, PGP.

**Why it's the GitOps-native choice:**
- Secrets are version-controlled in git (same repo or separate secrets repo)
- No extra component to run — wardn just needs the decryption key
- ArgoCD and Flux both support this; it's the most popular GitOps secret pattern
- Works with all major cloud KMS providers

**wardn's role:**
- During manifest parsing, detect SOPS-encrypted files (they contain a `sops` metadata block)
- Decrypt using keys from a referenced Kubernetes Secret (which itself can come from Layer 2 or 3)
- Apply the decrypted secret to the cluster
- UI: show which apps use SOPS-encrypted secrets, key rotation status

**Implementation:**
- Operator: add SOPS decryption step in manifest parser, between raw file read and YAML unmarshal
- Use `getsops/sops` Go library for decryption
- Decryption key stored in k8s Secret, referenced by `SecretStoreRef` in GitApplication spec

### Layer 2: External Secrets Operator (ESO) Integration

**What:** [External Secrets Operator](https://external-secrets.io/) is the Kubernetes-standard way to sync secrets from external stores into Kubernetes Secrets. It's already widely adopted in enterprise clusters.

**Supported backends:** HashiCorp Vault, AWS Secrets Manager, GCP Secret Manager, Azure Key Vault, 1Password, Doppler, GitHub, GitLab, and 15+ more.

**wardn's role:**
- **Does not manage secrets directly** — ESO does the syncing, wardn just observes
- **Detect and surface** `ExternalSecret` and `SecretStore` CRDs in managed namespaces
- **Show sync status** in the app detail view (is the ExternalSecret synced? last refresh? ready?)
- **UI integration** — a "Secret Stores" settings page showing configured `SecretStore`/`ClusterSecretStore` resources and their connectivity status
- **Access policies** — wardn RBAC can restrict which projects can reference which secret stores
- **Health aggregation** — if an ExternalSecret referenced by an app is not ready, wardn marks the app health as `Degraded`

**Implementation:**
- Operator: watch `ExternalSecret` and `SecretStore` CRDs in managed namespaces
- Server: API endpoints to list/inspect secret stores and external secrets
- Frontend: Secret Stores settings page + per-app Secrets tab
- No dependency on ESO — wardn works without it, just won't show ESO status

### Layer 3: Direct Vault Integration (optional)

**What:** Some enterprises run HashiCorp Vault as their central secret store and want direct integration without ESO as a middleman. This layer is optional and only needed for Vault-heavy shops.

**wardn's role:**
- Optional Vault provider in the server — wardn can fetch secrets directly from Vault during sync
- Configured via a `SecretStoreRef` with type `vault` (Vault address, auth method: K8s auth, AppRole, token)
- UI: Vault connection status, secret path browser (read-only), assign secret paths to projects
- Secrets fetched at sync time and applied as Kubernetes Secrets to the target cluster

**Implementation:**
- Server: Vault client using `hashicorp/vault/api` Go SDK
- Auth methods: Kubernetes auth (most common in-cluster), AppRole, token
- Secret paths configured per app or per project
- Fetched secrets are applied as k8s Secrets with wardn-managed labels for tracking/pruning

### Secret Store CRD Types

```go
// SecretStoreRef references a wardn-managed secret store configuration.
type SecretStoreRef struct {
    // Type specifies the secret store integration.
    // +kubebuilder:validation:Enum=SOPS;ExternalSecrets;Vault
    Type SecretStoreType `json:"type"`

    // Name of the SecretStore/ClusterSecretStore (for ExternalSecrets)
    // or the Kubernetes Secret containing the SOPS decryption key.
    // +optional
    Name string `json:"name,omitempty"`

    // KeyPath is the path to the decryption key (for SOPS)
    // or the Vault mount path (for Vault direct).
    // +optional
    KeyPath string `json:"keyPath,omitempty"`
}

type SecretStoreType string

const (
    SecretStoreTypeSOPS            SecretStoreType = "SOPS"
    SecretStoreTypeExternalSecrets SecretStoreType = "ExternalSecrets"
    SecretStoreTypeVault           SecretStoreType = "Vault"
)
```

### wardn-Managed Secrets (internal)

For wardn's own operational secrets (repo creds, cluster kubeconfigs, OIDC client secrets, notification webhook URLs):
- Stored as Kubernetes Secrets (as already designed)
- Can be sourced from external stores via ESO — wardn just reads the resulting k8s Secret
- UI: credentials management page — user doesn't need to know if the Secret was manually created or synced from Vault

### UI/UX for Secrets

**Key UX principle:** Users shouldn't need to understand 3 different secret systems. wardn abstracts them into one interface.

**App Detail → Secrets Tab:**

| Secret Name | Source | Status | Last Synced |
|-------------|--------|--------|-------------|
| `db-credentials` | SOPS (AWS KMS) | Decrypted | — |
| `api-keys` | ExternalSecret (Vault) | Synced | 2 min ago |
| `tls-cert` | ExternalSecret (AWS SM) | Pending | 5 min ago |
| `redis-password` | Kubernetes Secret | Available | — |

**Settings → Secret Stores:**

| Store Name | Type | Backend | Status | Projects |
|------------|------|---------|--------|----------|
| `vault-prod` | ExternalSecrets | HashiCorp Vault | Connected | prod-apps |
| `aws-secrets` | ExternalSecrets | AWS Secrets Manager | Connected | all |
| `sops-kms` | SOPS | AWS KMS | Key available | all |
| `vault-direct` | Vault (direct) | HashiCorp Vault | Connected | infra |

**App Creation Wizard → Secrets Step:**

```
Step 3 of 5: Secrets

  How are secrets managed for this app?

  ○ No secrets needed
  ● SOPS-encrypted files in repo
    └─ Decryption key: [vault-prod-kms-key v]
  ○ External Secrets Operator
    └─ Secret store: [vault-prod v]
  ○ Plain Kubernetes Secrets
    └─ (existing secrets in target namespace)
```

### Comparison: How Others Handle Secrets

| Platform | Approach |
|----------|----------|
| **ArgoCD** | SOPS native support + Kustomize secret plugins. No built-in external store integration — relies on ESO or Vault agent sidecars. No secrets UI. |
| **FluxCD** | SOPS native support via `sops-decrypt` controller. Works with ESO. No UI (CLI-only). |
| **Rancher Fleet** | Uses Kubernetes Secrets + `SecretStore` CRDs. Limited external integration. |
| **wardn** | SOPS + ESO + optional Vault direct. **Unified UI** showing all secret sources in one view. Best of all worlds. |

**wardn's advantage:** ArgoCD and Flux handle SOPS but have **no UI for secrets** — you're blind to secret sync status. wardn surfaces it in the dashboard with a clean interface.

---

## Simplicity Differentiators

| Aspect | ArgoCD | wardn |
|--------|--------|-------|
| **Components** | 5+ (server, repo-server, controller, dex, redis) | 3 (server, operator, frontend) |
| **Install** | Complex values.yaml, many options | One Helm chart, opinionated defaults |
| **App creation** | YAML editor or CLI with 20+ flags | UI wizard: 4 steps, click through |
| **RBAC** | CAS config + roles + policies in YAML | UI-managed, project-scoped, dropdown roles |
| **Cluster registration** | `argocd cluster add` CLI or manual Secret | UI: paste kubeconfig or use in-cluster |
| **Repo credentials** | Secret + repo registration via CLI | UI: add credentials, pick from dropdown |
| **SSO/Dex** | Separate Dex component, complex config | Built into Server, OIDC config in UI |
| **Concepts** | Application, ApplicationSet, AppProject, Repository, Cluster, Account, Certificate, GPGKey | GitApplication, Project, Cluster, Credentials, SecretStore |
| **GitOps model** | Application CRD + ApplicationSet for templating | GitApplication CRD (ApplicationSet as future addition) |
| **Secret management** | SOPS only, no external store UI, relies on sidecars/ESO separately | SOPS + ESO + Vault with unified UI — see all secret sources in one view |

---

## Build Roadmap

### Phase 1 — MVP (Operator Core + Server + Frontend Dashboard)

**Goal:** A usable GitOps platform that can deploy raw YAML to a single cluster with a UI.

**Operator:**
1. Server-side apply via dynamic client (replace placeholder in `applier.go`)
2. Git auth — SSH keys / HTTPS tokens from k8s Secrets
3. Proper YAML parsing — replace naive string matching with `sig.k8s.io/yaml`
4. Health checks — Deployment, StatefulSet, Service at minimum
5. Wire up SyncPolicy (Automated, Prune, SelfHeal) logic
6. SOPS decryption — detect `sops` metadata block, decrypt using `getsops/sops` Go library, key from k8s Secret

**Server:**
7. Go server scaffold — router, middleware, Postgres connection, Redis connection
8. Auth — local users (email/password), session management
9. REST API — GitApplication CRUD, sync trigger, status endpoints
10. Real-time — SSE endpoint via Redis pub/sub
11. Secret stores API — CRUD for secret store configs (SOPS key refs, ESO store refs, Vault configs)

**Frontend:**
12. Dashboard — app list with sync + health badges
13. App detail — resource tree, sync status, health status, secrets tab (SOPS status)
14. App creation wizard — repo → path → cluster → sync policy → secrets step
15. Sync panel — manual sync button, sync history, rollback
16. Settings — basic (user profile, project list, secret store configs)

**Deliverable:** Single Helm chart deploying wardn + Postgres + Redis. User can add a git repo, see apps sync, view health, trigger manual syncs, roll back, and use SOPS-encrypted secrets — all from the UI.

### Phase 2 — Enterprise Features

**Goal:** Feature parity with ArgoCD for enterprise use cases.

- Multi-cluster registration and remote apply
- Helm rendering (Helm Go SDK)
- Kustomize support
- RBAC / Projects (UI-managed, project-scoped permissions)
- SSO (OIDC — Google, GitHub, Keycloak)
- Diff view (live vs desired, side-by-side)
- Sync history and rollback (full UI)
- Repo credentials management (UI)
- Cluster management (UI)
- ESO integration — watch ExternalSecret/SecretStore CRDs, surface sync status in UI
- Secret stores UI — unified settings page for SOPS, ESO, Vault store configs
- Per-app secrets tab — show all secret sources, sync status, last refreshed

### Phase 3 — Advanced

- Sync waves & hooks (PreSync/Sync/PostSync/SyncFail)
- Sync windows (time-based sync restrictions)
- Resource hooks
- Diff customizations (ignoreDifferences)
- Notifications expansion (Teams, Email, generic webhook)
- Webhook signature validation (GitHub HMAC, GitLab token)
- Vault direct integration — fetch secrets from Vault at sync time, apply as k8s Secrets
- Secret path browser (read-only Vault UI)
- CLI (`wardn` binary)

### Phase 4 — Future

- App-of-Apps pattern
- `GitApplicationSet` CRD (templated app generation)
- Lua-based custom health checks
- Progressive delivery (canary, blue-green) integration
- Plugin system for custom sync logic
- SOPS key rotation workflows
- Secret rotation policies (auto-rotate via ESO/Vault)

---

## Repository Structure (Target)

```
wardn/
├── operator/              # kubebuilder operator (existing)
│   ├── api/v1alpha1/      # CRD types
│   ├── cmd/operator/      # entrypoint
│   ├── internal/
│   │   ├── controller/    # reconciliation loop
│   │   ├── git/           # git client
│   │   ├── manifest/      # manifest parsing (raw, helm, kustomize)
│   │   ├── k8s/           # apply, prune, diff
│   │   ├── health/        # health checks
│   │   ├── secrets/       # SOPS decryption, ESO status watching, Vault fetch
│   │   ├── notify/        # notifications
│   │   └── webhook/       # git webhook receiver
│   ├── Dockerfile
│   └── go.mod
├── server/                # new — Go API server
│   ├── cmd/server/
│   ├── internal/
│   │   ├── api/           # REST handlers
│   │   ├── auth/          # OIDC + local users
│   │   ├── rbac/          # project-scoped permissions
│   │   ├── store/         # Postgres data layer
│   │   ├── cache/         # Redis cache layer
│   │   ├── cluster/       # cluster management
│   │   ├── repo/          # repo credential management
│   │   ├── secrets/       # secret store configs, Vault client, ESO status
│   │   ├── diff/          # live vs desired diff engine
│   │   └── audit/         # audit logging
│   ├── Dockerfile
│   └── go.mod
├── frontend/              # Next.js UI (existing)
│   ├── src/
│   │   ├── app/           # pages (dashboard, app detail, settings)
│   │   ├── components/    # shared components
│   │   └── lib/           # API client, utils
│   ├── Dockerfile
│   └── package.json
├── charts/                # Helm chart
│   └── wardn/
│       ├── Chart.yaml
│       ├── values.yaml
│       └── templates/
├── cli/                   # future — wardn CLI
│   ├── cmd/wardn/
│   └── go.mod
├── docs/                  # documentation
├── ARCHITECTURE.md        # this file
└── LICENSE
```

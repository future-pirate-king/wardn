# Wardn — Feature Roadmap

## ✅ Completed

### Frontend
- [x] Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui scaffold
- [x] Login page (`/login`) with branded Wardn logo (RocketIcon)
- [x] Signup page (`/signup`) with branded Wardn logo (RocketIcon)
- [x] Cross-linking between login and signup pages
- [x] AuroraBackground component — animated grid with colorful sparks illuminating grid lines radially, slow drifting aurora glow
- [x] CSS organized into `src/styles/` per-component files
- [x] `prefers-reduced-motion` support
- [x] Responsive layout (right panel hidden on mobile)

### Operator
- [x] Go 1.27 + controller-runtime scaffold
- [x] `GitApplication` CRD (`cd.wardn.space/v1alpha1`) with full spec/status
- [x] Reconciliation loop skeleton (clone → parse → apply → health → notify)
- [x] Git client (clone/pull, revision tracking, concurrent-safe)
- [x] Manifest parser (raw YAML/JSON, Helm placeholder)
- [x] K8s applier skeleton (server-side apply placeholder)
- [x] Health checker stub
- [x] Notification dispatcher (Slack webhook)
- [x] Webhook handler (GitHub + GitLab push events)
- [x] Dependency injection in reconciler (GitClient, Parser, HealthChecker, Notifier)
- [x] Dockerfile (multi-stage build)

---

## 🚧 In Progress

### Frontend
- [ ] Dashboard page — overview of all GitApplications
- [ ] App detail page — sync status, health, resources, logs, secrets tab
- [ ] Dark/light theme toggle
- [ ] Auth flow (login → token → API calls)
- [ ] App creation wizard — repo → path → cluster → sync policy → secrets step

### Operator
- [ ] Server-side apply implementation in K8s applier (dynamic client, 3-way merge)
- [ ] Git auth — SSH keys / HTTPS tokens from k8s Secrets
- [ ] Proper YAML parsing — replace naive string matching with `sig.k8s.io/yaml`
- [ ] Pruning of removed resources
- [ ] Real health checks per resource type (Deployment, StatefulSet, Service, etc.)
- [ ] Wire up SyncPolicy logic (Automated, Prune, SelfHeal)
- [ ] SOPS decryption — detect `sops` metadata block, decrypt at apply time

### Server (new component)
- [ ] Go server scaffold — router, middleware, Postgres connection, Redis connection
- [ ] Auth — local users (email/password), session management via Redis
- [ ] REST API — GitApplication CRUD, sync trigger, status endpoints
- [ ] Real-time — SSE endpoint via Redis pub/sub
- [ ] Secret stores API — CRUD for secret store configs (SOPS key refs, ESO store refs, Vault configs)

---

## 📋 Planned

### Phase 1 — MVP (Operator Core + Server + Frontend Dashboard)

**Goal:** A usable GitOps platform that can deploy raw YAML to a single cluster with a UI.

#### Core GitOps
- [ ] Manual sync trigger from UI
- [ ] Sync history / revision timeline
- [ ] Rollback to previous revision (UI + API)
- [ ] Diff view — compare live state vs Git state
- [ ] Partial sync — sync specific resources only

#### Manifest Management
- [ ] Helm chart support (values files, overrides) — Helm Go SDK
- [ ] Manifest validation (dry-run before apply)
- [ ] Resource custom actions (restart, scale)

#### UI / UX
- [ ] Application tree view — grouped by project/namespace
- [ ] Real-time sync status via WebSocket / SSE
- [ ] Resource tree — show dependent resources
- [ ] Pod logs viewer
- [ ] Activity / audit log
- [ ] Search and filter across all apps
- [ ] Bookmark / favorite apps
- [ ] Keyboard shortcuts

#### Auth & RBAC
- [ ] Auth backend (local users, OIDC, GitHub OAuth)
- [ ] Role-based access control (admin, read-only, sync-only)
- [ ] Project-level permissions
- [ ] API token management
- [ ] SSO integration (Google, Microsoft, custom OIDC)

#### Secret Management — Layer 1: SOPS
- [ ] SOPS decryption in operator — detect `sops` metadata, decrypt using `getsops/sops` Go library
- [ ] Decryption key from k8s Secret, referenced by `SecretStoreRef` in GitApplication spec
- [ ] Supported key providers: AWS KMS, GCP KMS, Azure Key Vault, age, PGP
- [ ] Secret stores API in server — CRUD for SOPS key refs
- [ ] Secrets tab in app detail — show SOPS decryption status
- [ ] Secrets step in app creation wizard — pick SOPS + decryption key

#### Operations
- [ ] Deployment manifests (Kubernetes YAMLs for Wardn itself)
- [ ] Helm chart for Wardn installation
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Multi-arch container builds (amd64, arm64)
- [ ] Health probe endpoints (liveness, readiness)
- [ ] Metrics endpoint (Prometheus)
- [ ] Leader election for HA
- [ ] Graceful shutdown

---

### Phase 2 — Enterprise Features

**Goal:** Feature parity with ArgoCD for enterprise use cases.

#### Core GitOps
- [ ] Multi-cluster support — deploy to remote clusters via kubeconfig/secret
- [ ] Sync windows — restrict when auto-sync can occur
- [ ] Sync hooks (PreSync, Sync, PostSync, SyncFail)

#### Manifest Management
- [ ] Kustomize support — `sigs.k8s.io/kustomize`
- [ ] Jsonnet support

#### Secret Management — Layer 2: External Secrets Operator
- [ ] Watch `ExternalSecret` and `SecretStore` CRDs in managed namespaces
- [ ] Surface ExternalSecret sync status in app detail view (synced, pending, last refresh)
- [ ] Secret Stores settings page — show configured `SecretStore`/`ClusterSecretStore` resources
- [ ] Health aggregation — if ExternalSecret not ready, mark app health as Degraded
- [ ] RBAC — restrict which projects can reference which secret stores
- [ ] No hard dependency — wardn works without ESO installed

#### UI / UX
- [ ] Secret stores UI — unified settings page for SOPS, ESO, Vault store configs
- [ ] Per-app secrets tab — show all secret sources, sync status, last refreshed
- [ ] Repo credentials management (UI)
- [ ] Cluster management (UI)

#### Notifications
- [ ] Slack notifications (sync success/failure) — already scaffolded in operator
- [ ] Microsoft Teams notifications
- [ ] Email notifications
- [ ] Discord webhook
- [ ] Custom webhook (generic HTTP)
- [ ] Notification templates and triggers (per-event config)

#### Webhooks
- [ ] GitHub webhook handling (push, PR) — partial, finish implementation
- [ ] GitLab webhook handling (push, MR)
- [ ] Bitbucket webhook support
- [ ] Webhook signature verification (GitHub HMAC, GitLab token)
- [ ] Manual refresh trigger from UI

---

### Phase 3 — Advanced

#### Core GitOps
- [ ] Diff customizations (ignoreDifferences) — json pointers in CRD
- [ ] Resource hooks

#### Secret Management — Layer 3: Vault Direct (optional)
- [ ] Vault client in server using `hashicorp/vault/api` Go SDK
- [ ] Auth methods: Kubernetes auth, AppRole, token
- [ ] Fetch secrets from Vault at sync time, apply as k8s Secrets
- [ ] Secret path browser (read-only Vault UI)
- [ ] Assign secret paths to projects
- [ ] Fetched secrets labeled with wardn-managed labels for tracking/pruning

#### Advanced
- [ ] Progressive delivery (Canary, Blue/Green via Argo Rollouts integration)
- [ ] Image updater — auto-update image tags from registry
- [ ] OPA/Gatekeeper policy validation before sync
- [ ] Cost insights per application
- [ ] Multi-tenancy with namespace isolation
- [ ] Git repository connection status indicator
- [ ] Branch/PR-based preview environments
- [ ] CLI (`wardn` binary)

---

### Phase 4 — Future

- [ ] App-of-Apps pattern
- [ ] `GitApplicationSet` CRD (templated app generation)
- [ ] Lua-based custom health checks
- [ ] Plugin system for custom sync logic
- [ ] SOPS key rotation workflows
- [ ] Secret rotation policies (auto-rotate via ESO/Vault)

---

## 🎯 Design Principles

1. **Simple to set up** — one Helm chart, sensible defaults, minimal config
2. **Simple to maintain** — clear CRDs, readable status, good error messages
3. **Simple to operate** — health at a glance, actionable alerts
4. **Not simple in features** — enterprise-grade capabilities with a clean UI
5. **GitOps first** — Git is the source of truth, everything is declarative
6. **Progressive complexity** — basic usage needs zero config, advanced features opt-in

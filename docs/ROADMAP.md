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
- [ ] App detail page — sync status, health, resources, logs
- [ ] Dark/light theme toggle
- [ ] Auth flow (login → token → API calls)

### Operator
- [ ] Server-side apply implementation in K8s applier
- [ ] Pruning of removed resources
- [ ] Helm chart rendering (helm template)
- [ ] Real health checks per resource type (Deployment, StatefulSet, Service, etc.)

---

## 📋 Planned

### Core GitOps
- [ ] Multi-cluster support — deploy to remote clusters via kubeconfig/secret
- [ ] Sync windows — restrict when auto-sync can occur
- [ ] Manual sync trigger from UI
- [ ] Sync history / revision timeline
- [ ] Rollback to previous revision (UI + API)
- [ ] Diff view — compare live state vs Git state
- [ ] Partial sync — sync specific resources only
- [ ] Sync hooks (PreSync, Sync, PostSync, SyncFail)

### Manifest Management
- [ ] Helm chart support (values files, overrides)
- [ ] Kustomize support
- [ ] Jsonnet support
- [ ] Manifest validation (dry-run before apply)
- [ ] Resource custom actions (restart, scale)

### UI / UX
- [ ] Application tree view — grouped by project/namespace
- [ ] Real-time sync status via WebSocket / SSE
- [ ] Resource tree — show dependent resources
- [ ] Pod logs viewer
- [ ] Exec into pods (optional)
- [ ] Activity / audit log
- [ ] Search and filter across all apps
- [ ] Bookmark / favorite apps
- [ ] Keyboard shortcuts

### Auth & RBAC
- [ ] Auth backend (OIDC, GitHub OAuth, local users)
- [ ] Role-based access control (admin, read-only, sync-only)
- [ ] Project-level permissions
- [ ] API token management
- [ ] SSO integration (Google, Microsoft, custom OIDC)

### Notifications
- [ ] Slack notifications (sync success/failure)
- [ ] Microsoft Teams notifications
- [ ] Email notifications
- [ ] Discord webhook
- [ ] Custom webhook (generic HTTP)
- [ ] Notification templates and triggers (per-event config)

### Webhooks
- [ ] GitHub webhook handling (push, PR)
- [ ] GitLab webhook handling (push, MR)
- [ ] Bitbucket webhook support
- [ ] Webhook signature verification
- [ ] Manual refresh trigger from UI

### Operations
- [ ] Deployment manifests (Kubernetes YAMLs for Wardn itself)
- [ ] Helm chart for Wardn installation
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Multi-arch container builds (amd64, arm64)
- [ ] Health probe endpoints (liveness, readiness)
- [ ] Metrics endpoint (Prometheus)
- [ ] Leader election for HA
- [ ] Graceful shutdown

### Advanced
- [ ] GitOps for secrets (SealedSecrets, SOPS, External Secrets)
- [ ] Progressive delivery (Canary, Blue/Green via Argo Rollouts integration)
- [ ] Image updater — auto-update image tags from registry
- [ ] OPA/Gatekeeper policy validation before sync
- [ ] Cost insights per application
- [ ] Multi-tenancy with namespace isolation
- [ ] Git repository connection status indicator
- [ ] Branch/PR-based preview environments

---

## 🎯 Design Principles

1. **Simple to set up** — one Helm chart, sensible defaults, minimal config
2. **Simple to maintain** — clear CRDs, readable status, good error messages
3. **Simple to operate** — health at a glance, actionable alerts
4. **Not simple in features** — enterprise-grade capabilities with a clean UI
5. **GitOps first** — Git is the source of truth, everything is declarative
6. **Progressive complexity** — basic usage needs zero config, advanced features opt-in

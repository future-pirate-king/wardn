# Wardn

> GitOps continuous delivery — simpler to set up, simpler to maintain, not simpler in features.

Wardn is a GitOps CD tool for Kubernetes that syncs your infrastructure from Git to clusters. It watches your repositories, parses manifests (raw YAML, Helm, Kustomize), and applies them to target clusters — with health checks, notifications, and a clean UI.

**URL:** [wardn.space](https://wardn.space)

## Architecture

```
wardn/
├── operator/          # Go operator (controller-runtime, Go 1.27)
│   ├── api/v1alpha1/          # GitApplication CRD types
│   ├── cmd/operator/          # Entry point
│   ├── internal/
│   │   ├── controller/        # Reconciliation loop
│   │   ├── git/               # Git clone/pull client
│   │   ├── manifest/          # YAML/Helm/Kustomize parser
│   │   ├── k8s/               # Server-side apply
│   │   ├── health/            # Resource health checks
│   │   ├── notify/            # Slack/Teams/email notifications
│   │   └── webhook/           # GitHub/GitLab webhook handler
│   └── Dockerfile
├── frontend/          # Next.js 16 + shadcn/ui
│   ├── src/
│   │   ├── app/               # Pages (login, signup, dashboard)
│   │   ├── components/        # Reusable UI components
│   │   └── styles/            # Per-component CSS files
│   └── package.json
└── docs/              # Documentation and roadmap
```

## Getting Started

### Prerequisites

- Go 1.27+
- Node.js 20+
- A Kubernetes cluster (or kind/minikube for local dev)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000`

### Operator

```bash
cd operator
go mod download
go run ./cmd/operator
```

## GitApplication CRD

```yaml
apiVersion: cd.wardn.space/v1alpha1
kind: GitApplication
metadata:
  name: my-app
  namespace: default
spec:
  repoURL: https://github.com/myorg/my-repo
  branch: main
  path: manifests/
  targetCluster: ""
  manifestType: raw  # raw | helm
  syncPolicy:
    automated: true
    prune: true
  helm:
    chartPath: ""
    valuesFiles: []
  notifications:
    slack:
      webhookURL: ""
  webhook:
    enabled: false
    secret: ""
```

## Features

- **Git sync** — clone, pull, and track revisions automatically
- **Manifest parsing** — raw YAML/JSON, Helm (planned: Kustomize, Jsonnet)
- **Server-side apply** — declarative resource management with pruning
- **Health checks** — per-resource health status aggregation
- **Notifications** — Slack (planned: Teams, email, Discord, custom webhooks)
- **Webhooks** — GitHub and GitLab push event triggers
- **UI** — clean, modern interface with real-time status
- **RBAC** — role-based access control (planned)

See [docs/ROADMAP.md](docs/ROADMAP.md) for the full feature roadmap.

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Operator | Go 1.27, controller-runtime, Kubernetes client-go |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui |
| Container | Multi-stage Docker build |
| CRD API | `cd.wardn.space/v1alpha1` |

## License

MIT

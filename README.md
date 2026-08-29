<div align="center">


<a href="https://wardn.space">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/wardn_logo_dark.svg">
    <img width="32" alt="Wardn Logo" src="./assets/wardn_logo_light.svg">
  </picture>
</a>

<h1>Wardn</h1>

### GitOps Continuous Delivery for Kubernetes

[![Docs](https://img.shields.io/badge/docs-docs.wardn.space-6366f1)](https://docs.wardn.space)
[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue)](https://www.gnu.org/licenses/agpl-3.0)
[![Go](https://img.shields.io/badge/Go-1.27-00ADD8)](https://go.dev)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-336791)](https://www.postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-8-DC382D)](https://redis.io)

[![GitHub Repo stars](https://img.shields.io/github/stars/future-pirate-king/wardn?style=social)](https://github.com/future-pirate-king/wardn)

<p align="center">
  <a href="https://wardn.space">Website</a>
  ·
  <a href="https://docs.wardn.space">Documentation</a>
  ·
  <a href="https://platform.wardn.space">Platform</a>
  ·
  <a href="https://github.com/wardn/wardn/issues">Issues</a>
</p>

</div>

---

### What is Wardn?

Wardn is a GitOps-first continuous delivery platform for Kubernetes. It synchronizes cluster state from Git repositories — handling manifest parsing, server-side apply, health checks, and notifications — with a focus on operational simplicity.

**Enterprise features, not enterprise complexity.** Three components. Built-in auth. A UI that doesn't require a YAML editor to create an application.

### Get started quickly

The fastest way to get started is with Docker Compose — note that this requires [Docker](https://www.docker.com/get-started) installed locally:

```sh
git clone https://github.com/future-pirate-king/wardn.git
cd wardn
docker compose up -d
```

This brings up the full stack — Postgres, Redis, server, operator, and all frontend apps. The platform dashboard is available at `http://localhost:3002`.

For manual development setup, see the [documentation](https://docs.wardn.space/docs/getting-started).

### When should I use Wardn?

Wardn is designed for teams that want **GitOps without the operational overhead**. It's a good fit if you need:

- **Multi-cluster delivery** from a single control plane
- **Built-in authentication and RBAC** without external identity providers
- **Unified secret management** — SOPS, External Secrets Operator, and Vault in one interface
- **Real-time visibility** — sync status, health checks, and audit logs in a polished UI
- **Simple installation** — one Helm chart with opinionated defaults

---

### Wardn Features

#### Core GitOps

- [Git synchronization](https://docs.wardn.space/docs/configuration): clone, pull, and track revisions automatically with commit-level granularity
- [Manifest parsing](https://docs.wardn.space/docs/configuration): raw YAML/JSON and Helm support (Kustomize planned)
- [Server-side apply](https://docs.wardn.space/docs/configuration): declarative resource management with automatic pruning
- [Health checks](https://docs.wardn.space/docs/configuration): per-resource health status aggregation with configurable probes
- [Sync policies](https://docs.wardn.space/docs/configuration): automated sync, prune, and self-heal
- [Multi-cluster](https://docs.wardn.space/docs/configuration): register and deploy to remote clusters from a single control plane

#### Platform & Security

- [Authentication](https://docs.wardn.space/docs/server): local users (bcrypt) + OIDC (Google, GitHub, Keycloak)
- [RBAC](https://docs.wardn.space/docs/server): project-scoped permissions with read, sync, and admin roles
- [Audit logging](https://docs.wardn.space/docs/server): complete activity trail for compliance
- [Real-time updates](https://docs.wardn.space/docs/server): SSE via Redis pub/sub for live sync status
- [Sync history & rollback](https://docs.wardn.space/docs/cli): revision tracking with one-click rollback

#### Secret Management

- [SOPS](https://docs.wardn.space/docs/configuration): decrypt at apply time (AWS KMS, GCP KMS, age, Vault Transit)
- [External Secrets Operator](https://docs.wardn.space/docs/configuration): watch CRDs and surface sync status in the UI
- [Vault Direct](https://docs.wardn.space/docs/configuration): optional direct Vault integration
- **Unified UI**: all secret sources visible in a single interface

#### Notifications & Webhooks

- [Slack](https://docs.wardn.space/docs/configuration): notifications on sync success, failure, and health degradation
- [GitHub & GitLab](https://docs.wardn.space/docs/configuration): webhook triggers with signature validation

---

### Wardn vs...

<details>
<summary>Wardn vs ArgoCD</summary>

####

ArgoCD is the most widely adopted GitOps tool for Kubernetes, but it comes with significant operational complexity — five or more components (server, repo server, controller, Dex, Redis), each with its own scaling profile and failure modes.

Wardn takes a different approach:

- **3 components** (server, operator, frontend) vs ArgoCD's 5+ — fewer moving parts, simpler upgrades
- **Built-in auth** — no separate Dex component; OIDC and local users handled natively
- **UI-driven workflows** — app creation wizard instead of requiring YAML knowledge
- **Unified secret management** — SOPS, ESO, and Vault in a single interface instead of separate tools
- **One Helm chart** install with opinionated defaults vs ArgoCD's multi-chart setup

ArgoCD has a larger ecosystem and more production battle-testing. If you need mature multi-tenancy or are deeply invested in the Argo ecosystem, ArgoCD remains a solid choice. Wardn is for teams that want GitOps without the operational overhead.

</details>

<details>
<summary>Wardn vs Flux</summary>

####

Flux is a CNCF-graduated GitOps operator that excels at being lightweight and Kubernetes-native. It's purely CLI/CRD-driven with no built-in UI.

Wardn differs in that:

- **Full platform** — server + UI + operator vs Flux's operator-only approach
- **Built-in dashboard** — visual app management, sync status, and health without third-party tools
- **Authentication & RBAC** — project-scoped permissions out of the box
- **Audit logging** — complete activity trail for compliance requirements
- **Multi-cluster management** — register and manage remote clusters from a single control plane

Flux is ideal for teams that prefer pure GitOps via CLI and CRDs, and don't need a UI or built-in auth. Wardn is for teams that want a complete platform with a polished interface.

</details>

<details>
<summary>Wardn vs Jenkins X</summary>

####

Jenkins X is a full CI/CD platform that includes build pipelines, preview environments, and GitOps deployment. It's a broader tool with a steeper learning curve.

Wardn is focused specifically on **continuous delivery** — getting manifests from Git to clusters. It doesn't include CI pipeline features. If you need integrated build pipelines, Jenkins X covers more ground. If you already have CI and just need CD, Wardn is simpler.

</details>

---

### Documentation

The most up-to-date documentation can be found at [docs.wardn.space](https://docs.wardn.space).

Additional resources:

- [Architecture](ARCHITECTURE.md) — detailed component topology and design decisions
- [Roadmap](docs/ROADMAP.md) — feature roadmap and development phases
- [Server Reference](https://docs.wardn.space/docs/server) — API server architecture and endpoints
- [CLI Reference](https://docs.wardn.space/docs/cli) — command-line tool for managing Wardn

---

### Community & Support

- [GitHub Issues](https://github.com/wardn/wardn/issues) — used for filing bug reports
- [GitHub Discussions](https://github.com/wardn/wardn/discussions) — used for starting in-depth technical discussions
- [Email](mailto:contact@wardn.space) — best for support and billing inquiries

---

### Issues

Please submit any bugs that you encounter via [GitHub issues](https://github.com/wardn/wardn/issues).

---

### I'd Like to Contribute

We welcome contributions of all kinds. Please see our [roadmap](docs/ROADMAP.md) for areas that need work.

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Commit your changes with clear messages
4. Open a pull request

For major changes, please open a [discussion](https://github.com/wardn/wardn/discussions) first to discuss what you would like to change.

---

### License

Copyright (c) Wardn.

This project is licensed under the **GNU Affero General Public License v3.0** — see the [LICENSE](LICENSE) file for details.

The AGPL-3.0 allows you to use, modify, and distribute Wardn, including for commercial purposes. If you modify Wardn and make the modified version available to users over a network, the AGPL-3.0 requires you to make the corresponding source code available under the same license. This helps ensure that improvements remain available to the community while allowing commercial self-hosting.

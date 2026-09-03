// @ts-nocheck
import * as __fd_glob_40 from "../content/docs/secrets/vault.mdx?collection=docs"
import * as __fd_glob_39 from "../content/docs/secrets/sops.mdx?collection=docs"
import * as __fd_glob_38 from "../content/docs/secrets/overview.mdx?collection=docs"
import * as __fd_glob_37 from "../content/docs/secrets/external-secrets.mdx?collection=docs"
import * as __fd_glob_36 from "../content/docs/reference/roadmap.mdx?collection=docs"
import * as __fd_glob_35 from "../content/docs/reference/comparison.mdx?collection=docs"
import * as __fd_glob_34 from "../content/docs/operator/webhooks.mdx?collection=docs"
import * as __fd_glob_33 from "../content/docs/operator/reconciliation.mdx?collection=docs"
import * as __fd_glob_32 from "../content/docs/operator/rbac.mdx?collection=docs"
import * as __fd_glob_31 from "../content/docs/operator/notifications.mdx?collection=docs"
import * as __fd_glob_30 from "../content/docs/operator/crd-reference.mdx?collection=docs"
import * as __fd_glob_29 from "../content/docs/operator/architecture.mdx?collection=docs"
import * as __fd_glob_28 from "../content/docs/guides/webhook-triggers.mdx?collection=docs"
import * as __fd_glob_27 from "../content/docs/guides/sync-waves.mdx?collection=docs"
import * as __fd_glob_26 from "../content/docs/guides/rollback.mdx?collection=docs"
import * as __fd_glob_25 from "../content/docs/guides/multi-cluster.mdx?collection=docs"
import * as __fd_glob_24 from "../content/docs/guides/kustomize.mdx?collection=docs"
import * as __fd_glob_23 from "../content/docs/guides/helm-charts.mdx?collection=docs"
import * as __fd_glob_22 from "../content/docs/guides/first-app.mdx?collection=docs"
import * as __fd_glob_21 from "../content/docs/guides/diff-view.mdx?collection=docs"
import * as __fd_glob_20 from "../content/docs/concepts/sync-policies.mdx?collection=docs"
import * as __fd_glob_19 from "../content/docs/concepts/manifest-management.mdx?collection=docs"
import * as __fd_glob_18 from "../content/docs/concepts/health-checks.mdx?collection=docs"
import * as __fd_glob_17 from "../content/docs/api/secret-stores.mdx?collection=docs"
import * as __fd_glob_16 from "../content/docs/api/projects.mdx?collection=docs"
import * as __fd_glob_15 from "../content/docs/api/clusters.mdx?collection=docs"
import * as __fd_glob_14 from "../content/docs/api/authentication.mdx?collection=docs"
import * as __fd_glob_13 from "../content/docs/api/audit.mdx?collection=docs"
import * as __fd_glob_12 from "../content/docs/api/applications.mdx?collection=docs"
import * as __fd_glob_11 from "../content/docs/server.mdx?collection=docs"
import * as __fd_glob_10 from "../content/docs/index.mdx?collection=docs"
import * as __fd_glob_9 from "../content/docs/getting-started.mdx?collection=docs"
import * as __fd_glob_8 from "../content/docs/configuration.mdx?collection=docs"
import * as __fd_glob_7 from "../content/docs/cli.mdx?collection=docs"
import { default as __fd_glob_6 } from "../content/docs/secrets/meta.json?collection=docs"
import { default as __fd_glob_5 } from "../content/docs/reference/meta.json?collection=docs"
import { default as __fd_glob_4 } from "../content/docs/operator/meta.json?collection=docs"
import { default as __fd_glob_3 } from "../content/docs/guides/meta.json?collection=docs"
import { default as __fd_glob_2 } from "../content/docs/concepts/meta.json?collection=docs"
import { default as __fd_glob_1 } from "../content/docs/api/meta.json?collection=docs"
import { default as __fd_glob_0 } from "../content/docs/meta.json?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();

export const docs = await create.docs("docs", "content/docs", {"meta.json": __fd_glob_0, "api/meta.json": __fd_glob_1, "concepts/meta.json": __fd_glob_2, "guides/meta.json": __fd_glob_3, "operator/meta.json": __fd_glob_4, "reference/meta.json": __fd_glob_5, "secrets/meta.json": __fd_glob_6, }, {"cli.mdx": __fd_glob_7, "configuration.mdx": __fd_glob_8, "getting-started.mdx": __fd_glob_9, "index.mdx": __fd_glob_10, "server.mdx": __fd_glob_11, "api/applications.mdx": __fd_glob_12, "api/audit.mdx": __fd_glob_13, "api/authentication.mdx": __fd_glob_14, "api/clusters.mdx": __fd_glob_15, "api/projects.mdx": __fd_glob_16, "api/secret-stores.mdx": __fd_glob_17, "concepts/health-checks.mdx": __fd_glob_18, "concepts/manifest-management.mdx": __fd_glob_19, "concepts/sync-policies.mdx": __fd_glob_20, "guides/diff-view.mdx": __fd_glob_21, "guides/first-app.mdx": __fd_glob_22, "guides/helm-charts.mdx": __fd_glob_23, "guides/kustomize.mdx": __fd_glob_24, "guides/multi-cluster.mdx": __fd_glob_25, "guides/rollback.mdx": __fd_glob_26, "guides/sync-waves.mdx": __fd_glob_27, "guides/webhook-triggers.mdx": __fd_glob_28, "operator/architecture.mdx": __fd_glob_29, "operator/crd-reference.mdx": __fd_glob_30, "operator/notifications.mdx": __fd_glob_31, "operator/rbac.mdx": __fd_glob_32, "operator/reconciliation.mdx": __fd_glob_33, "operator/webhooks.mdx": __fd_glob_34, "reference/comparison.mdx": __fd_glob_35, "reference/roadmap.mdx": __fd_glob_36, "secrets/external-secrets.mdx": __fd_glob_37, "secrets/overview.mdx": __fd_glob_38, "secrets/sops.mdx": __fd_glob_39, "secrets/vault.mdx": __fd_glob_40, });
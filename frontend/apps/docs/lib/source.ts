import { loader } from 'fumadocs-core/source';
import { defineDocs } from 'fumadocs-mdx/macro';
import { createElement, type ReactNode } from 'react';
import {
  BookOpen,
  Map,
  KeyRound,
  Code,
  Cog,
  Library,
  Rocket,
  Server,
  Terminal,
  GitBranch,
  HeartPulse,
  FileCode,
  Network,
  Bell,
  Webhook,
  ShieldCheck,
  Database,
  ScrollText,
  GitCompare,
  Layers,
  Cloud,
  Lock,
  FileSearch,
  History,
  Waves,
  Settings,
  Boxes,
  FolderTree,
} from 'lucide-react';

const docs = defineDocs({
  dir: 'content/docs',
});

const icon = (Component: React.ComponentType<{ className?: string }>): ReactNode =>
  createElement(Component);

const folderIconMap: Record<string, ReactNode> = {
  'concepts': icon(BookOpen),
  'guides': icon(Map),
  'secrets': icon(KeyRound),
  'api': icon(Code),
  'operator': icon(Cog),
  'reference': icon(Library),
};

const pageIconMap: Record<string, ReactNode> = {
  'getting-started': icon(Rocket),
  'configuration': icon(Settings),
  'server': icon(Server),
  'cli': icon(Terminal),
  'sync-policies': icon(GitBranch),
  'health-checks': icon(HeartPulse),
  'manifest-management': icon(FileCode),
  'first-app': icon(Rocket),
  'multi-cluster': icon(Network),
  'helm-charts': icon(Boxes),
  'kustomize': icon(Layers),
  'rollback': icon(History),
  'diff-view': icon(FileSearch),
  'sync-waves': icon(Waves),
  'webhook-triggers': icon(Webhook),
  'overview': icon(Lock),
  'sops': icon(KeyRound),
  'external-secrets': icon(KeyRound),
  'vault': icon(KeyRound),
  'authentication': icon(ShieldCheck),
  'applications': icon(Boxes),
  'projects': icon(FolderTree),
  'clusters': icon(Cloud),
  'audit': icon(ScrollText),
  'secret-stores': icon(Database),
  'architecture': icon(Cog),
  'crd-reference': icon(FileCode),
  'reconciliation': icon(GitBranch),
  'webhooks': icon(Webhook),
  'notifications': icon(Bell),
  'rbac': icon(ShieldCheck),
  'comparison': icon(GitCompare),
  'roadmap': icon(Map),
};

function attachIcons(node: any): any {
  if (!node) return node;

  if (node.type === 'root') {
    node.children?.forEach(attachIcons);
  } else if (node.type === 'folder') {
    if (!node.icon && folderIconMap[node.name]) {
      node.icon = folderIconMap[node.name];
    }
    if (!node.icon && pageIconMap[node.name]) {
      node.icon = pageIconMap[node.name];
    }
    node.children?.forEach(attachIcons);
  } else if (node.type === 'page') {
    const slug = node.url?.split('/').pop() ?? node.name;
    if (!node.icon && pageIconMap[slug]) {
      node.icon = pageIconMap[slug];
    }
  }

  return node;
}

const rawSource = loader({
  baseUrl: '/',
  source: docs.toFumadocsSource(),
});

attachIcons(rawSource.pageTree);

export const source = rawSource;

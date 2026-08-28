import { RocketIcon, CodeIcon, ServerIcon, GitBranchIcon, CheckCircleIcon } from "lucide-react";
import { Button } from "@repo/ui/button";

const apps = [
  { name: "api-gateway", branch: "main", status: "healthy", lastDeploy: "2 hours ago" },
  { name: "web-frontend", branch: "main", status: "healthy", lastDeploy: "5 hours ago" },
  { name: "worker-service", branch: "staging", status: "syncing", lastDeploy: "1 day ago" },
];

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2 font-medium">
          <RocketIcon className="size-5" />
          Wardn Platform
        </div>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <a href="https://wardn.space" className="hover:text-foreground transition-colors">Home</a>
          <a href="https://docs.wardn.space" className="hover:text-foreground transition-colors">Docs</a>
          <a href="https://github.com/wardn/wardn" className="hover:text-foreground transition-colors">
            <CodeIcon className="size-4" />
          </a>
        </nav>
      </header>

      <main className="flex flex-1 flex-col px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Monitor your GitOps deployments</p>
          </div>
          <Button size="lg">New Application</Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <div className="rounded-4xl bg-card p-6 shadow-md ring-1 ring-foreground/5">
            <div className="flex items-center gap-2 mb-2">
              <ServerIcon className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">Applications</span>
            </div>
            <p className="text-3xl font-bold">{apps.length}</p>
          </div>
          <div className="rounded-4xl bg-card p-6 shadow-md ring-1 ring-foreground/5">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircleIcon className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">Healthy</span>
            </div>
            <p className="text-3xl font-bold">{apps.filter((a) => a.status === "healthy").length}</p>
          </div>
          <div className="rounded-4xl bg-card p-6 shadow-md ring-1 ring-foreground/5">
            <div className="flex items-center gap-2 mb-2">
              <GitBranchIcon className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">Syncing</span>
            </div>
            <p className="text-3xl font-bold">{apps.filter((a) => a.status === "syncing").length}</p>
          </div>
        </div>

        <div className="rounded-4xl bg-card shadow-md ring-1 ring-foreground/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-heading text-base font-medium">Applications</h2>
          </div>
          <div className="divide-y divide-border">
            {apps.map((app) => (
              <div key={app.name} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <ServerIcon className="size-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{app.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <GitBranchIcon className="size-3" />
                      {app.branch}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">{app.lastDeploy}</span>
                  <span
                    className={
                      app.status === "healthy"
                        ? "text-sm font-medium text-green-600 dark:text-green-400"
                        : "text-sm font-medium text-yellow-600 dark:text-yellow-400"
                    }
                  >
                    {app.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

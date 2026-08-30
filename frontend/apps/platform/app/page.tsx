import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const stats = {
  clusters: 3,
  deployments: 12,
  healthy: 10,
  syncing: 2,
};

export default function Home() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 bg-card border-b border-border transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <h1 className="text-base font-medium">Overview</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="rounded-xl bg-card p-6 dark:ring-1 dark:ring-foreground/10">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Clusters</p>
                <p className="text-2xl font-semibold mt-1">{stats.clusters}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Deployments</p>
                <p className="text-2xl font-semibold mt-1">{stats.deployments}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Healthy</p>
                <p className="text-2xl font-semibold mt-1 text-green-600 dark:text-green-400">{stats.healthy}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Syncing</p>
                <p className="text-2xl font-semibold mt-1 text-yellow-600 dark:text-yellow-400">{stats.syncing}</p>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

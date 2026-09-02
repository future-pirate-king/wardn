import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@repo/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@repo/ui/sidebar"
import { DeploymentView } from "@/components/deployment-view"

export default function DeploymentsPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <h1 className="text-base font-medium">Deployments</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 rounded-tl-2xl bg-background border-l border-t border-border">
          <DeploymentView />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

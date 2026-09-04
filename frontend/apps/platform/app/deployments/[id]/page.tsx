import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@repo/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@repo/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@repo/ui/breadcrumb"
import { DeploymentDetail } from "@/components/deployment-detail"
import { getDeployment, mockDeployments } from "@/lib/deployments"
import { notFound } from "next/navigation"
import Link from "next/link"

export function generateStaticParams() {
  return mockDeployments.map((d) => ({ id: d.id }))
}

export default async function DeploymentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const deployment = getDeployment(id)
  if (!deployment) notFound()

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
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink render={<Link href="/deployments" />}>
                    Deployments
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{deployment.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6 rounded-tl-2xl bg-background border-l border-t border-border">
          <DeploymentDetail deployment={deployment} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

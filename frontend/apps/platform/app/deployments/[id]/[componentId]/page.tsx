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
import { ComponentDetail } from "@/components/component-detail"
import {
  getDeployment,
  getComponent,
  mockDeployments,
} from "@/lib/deployments"
import { notFound } from "next/navigation"
import Link from "next/link"

export function generateStaticParams() {
  const params: { id: string; componentId: string }[] = []
  for (const deployment of mockDeployments) {
    for (const component of deployment.components) {
      params.push({ id: deployment.id, componentId: component.id })
    }
  }
  return params
}

export default async function ComponentPage({
  params,
}: {
  params: Promise<{ id: string; componentId: string }>
}) {
  const { id, componentId } = await params
  const deployment = getDeployment(id)
  if (!deployment) notFound()
  const component = getComponent(id, componentId)
  if (!component) notFound()

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
                  <BreadcrumbLink render={<Link href={`/deployments/${deployment.id}`} />}>
                    {deployment.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{component.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6 rounded-tl-2xl bg-background border-l border-t border-border">
          <ComponentDetail
            component={component}
            deploymentId={deployment.id}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

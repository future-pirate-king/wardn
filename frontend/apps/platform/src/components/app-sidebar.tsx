"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { CreateWizard } from "@/components/create-wizard"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  LayoutDashboardIcon,
  LayersIcon,
  ServerIcon,
  KeyRoundIcon,
  Settings2Icon,
  RocketIcon,
} from "lucide-react"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navGroups: [
    {
      label: "Platform",
      items: [
        {
          title: "Overview",
          url: "/",
          icon: <LayoutDashboardIcon />,
        },
        {
          title: "Deployments",
          url: "/deployments",
          icon: <LayersIcon />,
        },
        {
          title: "Clusters",
          url: "/clusters",
          icon: <ServerIcon />,
        },
      ],
    },
    {
      label: "Configuration",
      items: [
        {
          title: "Secret Stores",
          url: "/secrets",
          icon: <KeyRoundIcon />,
        },
        {
          title: "Settings",
          url: "/settings",
          icon: <Settings2Icon />,
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="gap-2">
        <div className="flex h-16 items-center gap-2 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <RocketIcon className="size-6 shrink-0" />
          <span className="text-lg font-semibold group-data-[collapsible=icon]:hidden">Wardn</span>
        </div>

        <CreateWizard />
      </SidebarHeader>
      <SidebarContent className="pt-2">
        <NavMain groups={data.navGroups} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

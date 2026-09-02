"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui/sidebar"

export function NavMain({
  groups,
}: {
  groups: {
    label: string
    items: {
      title: string
      url: string
      icon?: React.ReactNode
    }[]
  }[]
}) {
  const pathname = usePathname()

  return (
    <>
      {groups.map((group) => (
        <SidebarGroup key={group.label}>
          <SidebarGroupLabel className="uppercase tracking-wider">
            {group.label}
          </SidebarGroupLabel>
          <SidebarMenu>
            {group.items.map((item) => {
              const isActive =
                item.url === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.url)
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isActive}
                    render={<Link href={item.url} />}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  )
}

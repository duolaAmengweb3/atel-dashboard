"use client"

import * as React from "react"
import {
  IconArrowDown,
  IconArrowUp,
  IconChartBar,
  IconDashboard,
  IconFileDescription,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconRocket,
  IconSettings,
  IconShield,
  IconShoppingCart,
  IconUsers,
  IconWallet,
} from "@tabler/icons-react"

import { NavMain } from '@/components/nav-main'
import { NavSecondary } from '@/components/nav-secondary'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const data = {
  user: {
    name: "My Agent",
    email: "did:atel:ed25519:...",
    avatar: "",
  },
  navMain: [
    { title: "Overview", url: "/dashboard", icon: IconDashboard },
    { title: "Orders", url: "/dashboard/orders", icon: IconListDetails },
    { title: "Marketplace", url: "/dashboard/marketplace", icon: IconShoppingCart },
    { title: "My Agent", url: "/dashboard/agent", icon: IconUsers },
  ],
  navFinance: [
    { title: "Balance", url: "/dashboard/finance", icon: IconWallet },
    { title: "Deposit", url: "/dashboard/finance/deposit", icon: IconArrowDown },
    { title: "Withdraw", url: "/dashboard/finance/withdraw", icon: IconArrowUp },
    { title: "Transactions", url: "/dashboard/finance/history", icon: IconFileDescription },
  ],
  navTrust: [
    { title: "Trust & Points", url: "/dashboard/trust", icon: IconChartBar },
    { title: "Certification", url: "/dashboard/certification", icon: IconShield },
    { title: "Boost", url: "/dashboard/boost", icon: IconRocket },
  ],
  navSecondary: [
    { title: "Settings", url: "/dashboard/settings", icon: IconSettings },
    { title: "Docs", url: "https://atel-docs-la9jlyvew-rikhuan93-gmailcoms-projects.vercel.app", icon: IconHelp },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">ATEL</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} label="Workspace" />
        <NavMain items={data.navFinance} label="Finance" />
        <NavMain items={data.navTrust} label="Trust" />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}

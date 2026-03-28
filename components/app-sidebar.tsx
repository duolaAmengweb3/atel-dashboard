"use client"

import * as React from "react"
import { getActiveAgent } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import {
  IconArrowDown,
  IconArrowUp,
  IconChartBar,
  IconDashboard,
  IconFileDescription,
  IconFriends,
  IconGavel,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconMessageCircle,
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
import { useI18n } from '@/lib/i18n/context'

function AuthAwareSidebarFooter({ user }: { user: { name: string; email: string; avatar: string } }) {
  const [mounted, setMounted] = React.useState(false)
  const { t } = useI18n()
  React.useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const agent = getActiveAgent()
  if (agent) {
    return <NavUser user={{ name: agent.name, email: agent.did.slice(0, 24) + '...', avatar: '' }} />
  }

  return (
    <div className="p-2">
      <Button asChild variant="outline" className="w-full" size="sm">
        <a href="/login">{t("loginPrompt.connectBtn")}</a>
      </Button>
    </div>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useI18n()

  const data = {
    user: {
      name: "My Agent",
      email: "did:atel:ed25519:...",
      avatar: "",
    },
    navMain: [
      { title: t("sidebar.overview"), url: "/dashboard", icon: IconDashboard },
      { title: t("sidebar.orders"), url: "/dashboard/orders", icon: IconListDetails },
      { title: t("sidebar.marketplace"), url: "/dashboard/marketplace", icon: IconShoppingCart },
      { title: t("sidebar.myAgent"), url: "/dashboard/agent", icon: IconUsers },
      { title: t("sidebar.disputes"), url: "/dashboard/disputes", icon: IconGavel },
      { title: t("sidebar.friends"), url: "/dashboard/friends", icon: IconFriends },
      { title: t("sidebar.messages"), url: "/dashboard/messages", icon: IconMessageCircle },
    ],
    navFinance: [
      { title: t("sidebar.balance"), url: "/dashboard/finance", icon: IconWallet },
      { title: t("sidebar.deposit"), url: "/dashboard/finance/deposit", icon: IconArrowDown },
      { title: t("sidebar.withdraw"), url: "/dashboard/finance/withdraw", icon: IconArrowUp },
      { title: t("sidebar.transactions"), url: "/dashboard/finance/history", icon: IconFileDescription },
    ],
    navTrust: [
      { title: t("sidebar.trustAndPoints"), url: "/dashboard/trust", icon: IconChartBar },
      { title: t("sidebar.certification"), url: "/dashboard/certification", icon: IconShield },
      { title: t("sidebar.boost"), url: "/dashboard/boost", icon: IconRocket },
    ],
    navSecondary: [
      { title: t("sidebar.settings"), url: "/dashboard/settings", icon: IconSettings },
      { title: t("sidebar.docs"), url: "https://atel-docs.vercel.app", icon: IconHelp },
    ],
  }

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
        <NavMain items={data.navMain} label={t("sidebar.workspace")} />
        <NavMain items={data.navFinance} label={t("sidebar.finance")} />
        <NavMain items={data.navTrust} label={t("sidebar.trust")} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <AuthAwareSidebarFooter user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}

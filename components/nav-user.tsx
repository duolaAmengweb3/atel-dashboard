"use client"

import {
  IconDotsVertical,
  IconLogout,
  IconPlus,
  IconCheck,
} from "@tabler/icons-react"

import {
  Avatar,
  AvatarFallback,
} from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { getActiveAgent, getLinkedAgents, switchAgent, clearAuth, type AgentSession } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const [activeAgent, setActiveAgent] = useState<AgentSession | null>(null)
  const [agents, setAgents] = useState<AgentSession[]>([])

  useEffect(() => {
    setActiveAgent(getActiveAgent())
    setAgents(getLinkedAgents())
  }, [])

  const displayName = activeAgent?.name || user.name
  const displayDid = activeAgent?.did ? activeAgent.did.slice(0, 24) + '...' : user.email
  const initials = displayName.slice(0, 2).toUpperCase()

  function handleSwitch(did: string) {
    switchAgent(did)
    setActiveAgent(getLinkedAgents().find(a => a.did === did) || null)
    router.push('/dashboard')
    router.refresh()
  }

  function handleLogout() {
    clearAuth()
    router.push('/login')
  }

  function handleLinkNew() {
    router.push('/login')
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {displayDid}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            {agents.length > 0 && (
              <>
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Switch Agent
                </DropdownMenuLabel>
                <DropdownMenuGroup>
                  {agents.map((agent) => (
                    <DropdownMenuItem
                      key={agent.did}
                      onClick={() => handleSwitch(agent.did)}
                      className="flex items-center gap-2"
                    >
                      {agent.did === activeAgent?.did && <IconCheck className="size-4 text-green-500" />}
                      {agent.did !== activeAgent?.did && <span className="size-4" />}
                      <div className="flex flex-col">
                        <span className="text-sm">{agent.name}</span>
                        <span className="text-xs text-muted-foreground font-mono">{agent.did.slice(0, 20)}...</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={handleLinkNew}>
              <IconPlus className="size-4" />
              Link Another Agent
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <IconLogout className="size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

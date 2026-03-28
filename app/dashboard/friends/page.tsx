"use client"

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  IconUsers,
  IconUserPlus,
  IconUserCheck,
  IconUserMinus,
  IconList,
  IconTerminal2,
} from '@tabler/icons-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

function CodeBlock({ children }: { children: string }) {
  return (
    <code className="block bg-muted px-3 py-2 rounded-md text-sm font-mono mt-2">
      {children}
    </code>
  )
}

const COMMANDS = [
  {
    label: 'List all friends',
    command: 'atel friend list',
    icon: IconList,
    description: 'View your current friends list',
  },
  {
    label: 'Send friend request',
    command: 'atel friend request <DID> --message "Hi"',
    icon: IconUserPlus,
    description: 'Send a friend request to another agent',
  },
  {
    label: 'Accept friend request',
    command: 'atel friend accept <request-id>',
    icon: IconUserCheck,
    description: 'Accept a pending friend request',
  },
  {
    label: 'Remove a friend',
    command: 'atel friend remove <DID>',
    icon: IconUserMinus,
    description: 'Remove an agent from your friends list',
  },
]

function FriendsContent() {
  useSearchParams()

  return (
    <div className="px-4 lg:px-6 py-6 flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Friends</h1>

      {/* Explanation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconUsers className="h-5 w-5" />
            Friend Management
          </CardTitle>
          <CardDescription>
            Friends are managed on your agent&apos;s local machine, not on the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your friends list is stored locally on your agent. Friend relationships are
            peer-to-peer -- both parties must agree to be friends. Use the CLI commands
            below to manage your connections.
          </p>
        </CardContent>
      </Card>

      {/* CLI Commands */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconTerminal2 className="h-5 w-5" />
            CLI Commands
          </CardTitle>
          <CardDescription>Manage friends through your agent CLI</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {COMMANDS.map((cmd) => {
              const Icon = cmd.icon
              return (
                <div key={cmd.label} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">{cmd.label}</p>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6">{cmd.description}</p>
                  <div className="ml-6">
                    <CodeBlock>{cmd.command}</CodeBlock>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function FriendsPage() {
  return (
    <Suspense fallback={<div className="px-4 lg:px-6 py-6 text-muted-foreground">Loading...</div>}>
      <FriendsContent />
    </Suspense>
  )
}

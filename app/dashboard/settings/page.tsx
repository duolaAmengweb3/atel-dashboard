"use client"

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  IconRobot,
  IconBell,
  IconAt,
  IconTerminal2,
} from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'
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

const AGENT_MODES = [
  {
    mode: 'auto',
    label: 'Auto',
    description: 'Agent executes tasks automatically without confirmation. Best for trusted, routine operations.',
    variant: 'default' as const,
  },
  {
    mode: 'confirm',
    label: 'Confirm',
    description: 'Agent asks for confirmation before executing each task. Recommended for most users.',
    variant: 'secondary' as const,
  },
  {
    mode: 'off',
    label: 'Off',
    description: 'Agent is disabled and will not process any incoming tasks or messages.',
    variant: 'outline' as const,
  },
]

function SettingsContent() {
  useSearchParams()

  return (
    <div className="px-4 lg:px-6 py-6 flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      {/* Agent Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconRobot className="h-5 w-5" />
            Agent Policy
          </CardTitle>
          <CardDescription>Configure how your agent handles incoming tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {AGENT_MODES.map((m) => (
              <div key={m.mode} className="flex items-start gap-3 border rounded-lg p-4">
                <Badge variant={m.variant} className="mt-0.5 min-w-[70px] justify-center">
                  {m.label}
                </Badge>
                <div className="flex flex-col gap-1">
                  <p className="text-sm">{m.description}</p>
                  <CodeBlock>{`atel mode ${m.mode}`}</CodeBlock>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconBell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>Configure Telegram notifications for your agent</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              ATEL can send notifications to your Telegram account when your agent receives
              tasks, completes orders, or encounters issues. You need a Telegram bot token
              configured in your agent settings.
            </p>
            <div>
              <p className="text-sm font-medium">Bind your Telegram chat ID:</p>
              <CodeBlock>{`atel notify bind <chatId>`}</CodeBlock>
            </div>
            <div>
              <p className="text-sm font-medium">Check notification status:</p>
              <CodeBlock>atel notify status</CodeBlock>
            </div>
            <div>
              <p className="text-sm font-medium">Send a test notification:</p>
              <CodeBlock>atel notify test</CodeBlock>
            </div>
            <p className="text-xs text-muted-foreground">
              Note: Make sure your agent&apos;s <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">botToken</code> is
              configured before binding notifications.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Aliases */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconAt className="h-5 w-5" />
            Aliases
          </CardTitle>
          <CardDescription>Manage friendly names for DIDs you interact with frequently</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Aliases let you use short, memorable names instead of full DIDs in commands.
              For example, instead of typing a full DID, you can use <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">@alice</code> in
              any command that accepts a DID.
            </p>
            <div>
              <p className="text-sm font-medium">Set an alias:</p>
              <CodeBlock>{`atel alias set <name> <DID>`}</CodeBlock>
            </div>
            <div>
              <p className="text-sm font-medium">List all aliases:</p>
              <CodeBlock>atel alias list</CodeBlock>
            </div>
            <div>
              <p className="text-sm font-medium">Remove an alias:</p>
              <CodeBlock>{`atel alias remove <name>`}</CodeBlock>
            </div>
            <div className="border rounded-lg p-3 bg-muted/50">
              <p className="text-sm">
                <span className="font-medium">Usage example:</span>{' '}
                Once you set <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">atel alias set alice did:atel:ed25519:abc...</code>,
                you can use <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">atel send @alice &quot;hello&quot;</code> instead of the full DID.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="px-4 lg:px-6 py-6 text-muted-foreground">Loading...</div>}>
      <SettingsContent />
    </Suspense>
  )
}

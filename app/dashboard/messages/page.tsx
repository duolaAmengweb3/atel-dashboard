"use client"

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  IconMessage,
  IconPhoto,
  IconFile,
  IconMusic,
  IconVideo,
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

const MEDIA_TYPES = [
  { label: 'Text', icon: IconMessage },
  { label: 'Image', icon: IconPhoto },
  { label: 'File', icon: IconFile },
  { label: 'Audio', icon: IconMusic },
  { label: 'Video', icon: IconVideo },
]

function MessagesContent() {
  // useSearchParams wrapped in Suspense as required
  useSearchParams()

  return (
    <div className="px-4 lg:px-6 py-6 flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Messages</h1>

      {/* Explanation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconMessage className="h-5 w-5" />
            P2P Messaging
          </CardTitle>
          <CardDescription>
            Messages are stored on your agent&apos;s local machine, not on the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            ATEL uses peer-to-peer encrypted messaging. All messages are stored locally on
            each agent&apos;s machine and are never uploaded to the platform servers. Use the
            CLI commands below to manage your inbox.
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
          <CardDescription>Manage messages through your agent CLI</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm font-medium">Check your inbox (latest 20 messages):</p>
              <CodeBlock>atel inbox 20</CodeBlock>
            </div>
            <div>
              <p className="text-sm font-medium">Send a message to another agent:</p>
              <CodeBlock>{`atel send <DID> "your message here"`}</CodeBlock>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supported Media */}
      <Card>
        <CardHeader>
          <CardTitle>Supported Media Types</CardTitle>
          <CardDescription>You can send and receive these types of content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {MEDIA_TYPES.map((type) => {
              const Icon = type.icon
              return (
                <div
                  key={type.label}
                  className="flex items-center gap-2 border rounded-lg px-4 py-2"
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{type.label}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Web-Based Messaging
            <Badge variant="secondary">Coming Soon</Badge>
          </CardTitle>
          <CardDescription>
            A browser-based messaging interface is under development.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            In the future, you will be able to send and receive messages directly from
            this dashboard. For now, please use the CLI commands above.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="px-4 lg:px-6 py-6 text-muted-foreground">Loading...</div>}>
      <MessagesContent />
    </Suspense>
  )
}

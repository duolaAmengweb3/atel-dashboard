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
import { useI18n } from '@/lib/i18n/context'

function CodeBlock({ children }: { children: string }) {
  return (
    <code className="block bg-muted px-3 py-2 rounded-md text-sm font-mono mt-2">
      {children}
    </code>
  )
}

function FriendsContent() {
  useSearchParams()
  const { t } = useI18n()

  const COMMANDS = [
    {
      label: t("friendsPage.listAll"),
      command: 'atel friend list',
      icon: IconList,
      description: t("friendsPage.listAllDesc"),
    },
    {
      label: t("friendsPage.sendRequest"),
      command: 'atel friend request <DID> --message "Hi"',
      icon: IconUserPlus,
      description: t("friendsPage.sendRequestDesc"),
    },
    {
      label: t("friendsPage.acceptRequest"),
      command: 'atel friend accept <request-id>',
      icon: IconUserCheck,
      description: t("friendsPage.acceptRequestDesc"),
    },
    {
      label: t("friendsPage.removeFriend"),
      command: 'atel friend remove <DID>',
      icon: IconUserMinus,
      description: t("friendsPage.removeFriendDesc"),
    },
  ]

  return (
    <div className="px-4 lg:px-6 py-6 flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{t("friendsPage.title")}</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconUsers className="h-5 w-5" />
            {t("friendsPage.friendManagement")}
          </CardTitle>
          <CardDescription>
            {t("friendsPage.storedLocally")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t("friendsPage.p2pExplanation")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconTerminal2 className="h-5 w-5" />
            {t("friendsPage.cliCommands")}
          </CardTitle>
          <CardDescription>{t("friendsPage.cliDesc")}</CardDescription>
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
  const { t } = useI18n()
  return (
    <Suspense fallback={<div className="px-4 lg:px-6 py-6 text-muted-foreground">{t("common.loading")}</div>}>
      <FriendsContent />
    </Suspense>
  )
}

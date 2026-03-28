"use client"

import { Suspense } from 'react'
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
import { getStoredAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n/context'

function CodeBlock({ children }: { children: string }) {
  return (
    <code className="block bg-muted px-3 py-2 rounded-md text-sm font-mono mt-2">
      {children}
    </code>
  )
}

function MessagesContent() {
  const auth = getStoredAuth()
  const { t } = useI18n()

  const MEDIA_TYPES = [
    { label: t("messagesPage.text"), icon: IconMessage },
    { label: t("messagesPage.image"), icon: IconPhoto },
    { label: t("messagesPage.file"), icon: IconFile },
    { label: t("messagesPage.audio"), icon: IconMusic },
    { label: t("messagesPage.video"), icon: IconVideo },
  ]

  if (!auth) {
    return (
      <div className="px-4 lg:px-6 py-6 text-muted-foreground">
        {t("common.loginPrompt")} <a href="/login" className="text-primary underline underline-offset-4">{t("common.logIn")}</a> {t("common.loginToView")}
      </div>
    )
  }

  return (
    <div className="px-4 lg:px-6 py-6 flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{t("messagesPage.title")}</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconMessage className="h-5 w-5" />
            {t("messagesPage.p2pMessaging")}
          </CardTitle>
          <CardDescription>
            {t("messagesPage.storedLocally")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t("messagesPage.p2pExplanation")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconTerminal2 className="h-5 w-5" />
            {t("messagesPage.cliCommands")}
          </CardTitle>
          <CardDescription>{t("messagesPage.cliDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm font-medium">{t("messagesPage.checkInbox")}</p>
              <CodeBlock>atel inbox 20</CodeBlock>
            </div>
            <div>
              <p className="text-sm font-medium">{t("messagesPage.sendMessage")}</p>
              <CodeBlock>{`atel send <DID> "your message here"`}</CodeBlock>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("messagesPage.supportedMedia")}</CardTitle>
          <CardDescription>{t("messagesPage.supportedMediaDesc")}</CardDescription>
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {t("messagesPage.webMessaging")}
            <Badge variant="secondary">{t("common.comingSoon")}</Badge>
          </CardTitle>
          <CardDescription>
            {t("messagesPage.webMessagingDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t("messagesPage.webMessagingNote")}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function MessagesPage() {
  const { t } = useI18n()
  return (
    <Suspense fallback={<div className="px-4 lg:px-6 py-6 text-muted-foreground">{t("common.loading")}</div>}>
      <MessagesContent />
    </Suspense>
  )
}

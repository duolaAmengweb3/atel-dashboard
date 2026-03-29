"use client"

import { Suspense, useEffect, useState } from 'react'
import { LoginPrompt } from '@/components/login-prompt'
import {
  IconRobot,
  IconBell,
  IconAt,
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

function SettingsContent() {
  const { t } = useI18n()
  const [auth, setAuth] = useState<{ did: string; token: string } | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setAuth(getStoredAuth())
  }, [])

  const AGENT_MODES = [
    {
      mode: 'auto',
      label: t("settingsPage.auto"),
      description: t("settingsPage.autoDesc"),
      variant: 'default' as const,
    },
    {
      mode: 'confirm',
      label: t("settingsPage.confirm"),
      description: t("settingsPage.confirmDesc"),
      variant: 'secondary' as const,
    },
    {
      mode: 'off',
      label: t("settingsPage.off"),
      description: t("settingsPage.offDesc"),
      variant: 'outline' as const,
    },
  ]

  if (!mounted) return null
  if (!auth) return <LoginPrompt />

  return (
    <div className="px-4 lg:px-6 py-6 flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{t("settingsPage.title")}</h1>

      {/* Agent Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconRobot className="h-5 w-5" />
            {t("settingsPage.agentPolicy")}
          </CardTitle>
          <CardDescription>{t("settingsPage.agentPolicyDesc")}</CardDescription>
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
            {t("settingsPage.notifications")}
          </CardTitle>
          <CardDescription>{t("settingsPage.notificationsDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              {t("settingsPage.notifyExplanation")}
            </p>
            <div>
              <p className="text-sm font-medium">{t("settingsPage.bindTelegram")}</p>
              <CodeBlock>{`atel notify bind <chatId>`}</CodeBlock>
            </div>
            <div>
              <p className="text-sm font-medium">{t("settingsPage.checkNotifyStatus")}</p>
              <CodeBlock>atel notify status</CodeBlock>
            </div>
            <div>
              <p className="text-sm font-medium">{t("settingsPage.sendTestNotify")}</p>
              <CodeBlock>atel notify test</CodeBlock>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("settingsPage.notifyNote")} <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">botToken</code> {t("settingsPage.notifyNoteEnd")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Aliases */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconAt className="h-5 w-5" />
            {t("settingsPage.aliases")}
          </CardTitle>
          <CardDescription>{t("settingsPage.aliasesDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              {t("settingsPage.aliasExplanation")} <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">@alice</code> {t("settingsPage.aliasExplanationEnd")}
            </p>
            <div>
              <p className="text-sm font-medium">{t("settingsPage.setAlias")}</p>
              <CodeBlock>{`atel alias set <name> <DID>`}</CodeBlock>
            </div>
            <div>
              <p className="text-sm font-medium">{t("settingsPage.listAliases")}</p>
              <CodeBlock>atel alias list</CodeBlock>
            </div>
            <div>
              <p className="text-sm font-medium">{t("settingsPage.removeAlias")}</p>
              <CodeBlock>{`atel alias remove <name>`}</CodeBlock>
            </div>
            <div className="border rounded-lg p-3 bg-muted/50">
              <p className="text-sm">
                <span className="font-medium">{t("settingsPage.usageExample")}</span>{' '}
                {t("settingsPage.usageExampleText1")} <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">atel alias set alice did:atel:ed25519:abc...</code>,
                {' '}{t("settingsPage.usageExampleText2")} <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">atel send @alice &quot;hello&quot;</code> {t("settingsPage.usageExampleText3")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SettingsPage() {
  const { t } = useI18n()
  return (
    <Suspense fallback={<div className="px-4 lg:px-6 py-6 text-muted-foreground">{t("common.loading")}</div>}>
      <SettingsContent />
    </Suspense>
  )
}

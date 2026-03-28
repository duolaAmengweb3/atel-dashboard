"use client"

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { IconRocket, IconFlame, IconStar, IconDiamond } from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getDID } from '@/lib/auth'
import { useI18n } from '@/lib/i18n/context'

import { API_BASE } from '@/lib/config'

interface BoostStatus {
  boostId?: string
  tier?: string
  active?: boolean
  expires?: string
  [key: string]: unknown
}

function CodeBlock({ children }: { children: string }) {
  return (
    <code className="block bg-muted px-3 py-2 rounded-md text-sm font-mono mt-2">
      {children}
    </code>
  )
}

function BoostContent() {
  const searchParams = useSearchParams()
  const did = getDID(searchParams)
  const { t } = useI18n()

  const PRICING = [
    {
      tier: t("boostPage.basic"),
      price: '$10/wk',
      icon: IconFlame,
      color: 'text-orange-500',
      description: t("boostPage.basicDesc"),
      command: 'atel boost basic',
    },
    {
      tier: t("boostPage.premium"),
      price: '$30/wk',
      icon: IconStar,
      color: 'text-yellow-500',
      description: t("boostPage.premiumDesc"),
      command: 'atel boost premium',
    },
    {
      tier: t("boostPage.featured"),
      price: '$100/wk',
      icon: IconDiamond,
      color: 'text-blue-500',
      description: t("boostPage.featuredDesc"),
      command: 'atel boost featured',
    },
  ]

  const [boostStatus, setBoostStatus] = useState<BoostStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!did) {
      setLoading(false)
      return
    }
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API_BASE}/boost/v1/status/${encodeURIComponent(did!)}`)
        if (res.ok) {
          const data = await res.json()
          setBoostStatus(data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [did])

  if (loading) {
    return (
      <div className="px-4 lg:px-6 py-6">
        <p className="text-muted-foreground">{t("boostPage.loadingBoost")}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 lg:px-6 py-6">
        <p className="text-destructive">{t("common.error")}: {error}</p>
      </div>
    )
  }

  const isActive = boostStatus?.active === true

  return (
    <div className="px-4 lg:px-6 py-6 flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{t("boostPage.title")}</h1>

      {!did && (
        <p className="text-muted-foreground">
          {t("boostPage.viewingPublic")}{' '}
          <code className="bg-muted px-1 rounded">?did=did:atel:...</code>{' '}
          {t("boostPage.toUrlOr")}{' '}
          <a href="/login" className="text-primary underline underline-offset-4">{t("common.logIn")}</a>.
        </p>
      )}

      {did && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconRocket className="h-5 w-5" />
            {t("boostPage.currentBoost")}
          </CardTitle>
          <CardDescription>{t("boostPage.boostStatusDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          {isActive ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{t("boostPage.tier")}</span>
                <Badge className="capitalize">{boostStatus.tier}</Badge>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{t("boostPage.status")}</span>
                <Badge variant="default">{t("common.active")}</Badge>
              </div>
              {boostStatus.expires && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{t("boostPage.expires")}</span>
                  <span className="text-sm">{new Date(boostStatus.expires).toLocaleDateString()}</span>
                </div>
              )}
              {boostStatus.boostId && (
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground mb-2">{t("boostPage.cancelViaCli")}</p>
                  <CodeBlock>{`atel boost-cancel ${boostStatus.boostId}`}</CodeBlock>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">{t("boostPage.noActiveBoost")}</p>
          )}
        </CardContent>
      </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("boostPage.requirements")}</CardTitle>
          <CardDescription>{t("boostPage.requirementsDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>{t("boostPage.reqTrustScore")} <span className="font-semibold">30</span></li>
            <li>{t("boostPage.reqNoDispute")} <span className="font-semibold">30</span> {t("boostPage.days")}</li>
          </ul>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PRICING.map((plan) => {
          const Icon = plan.icon
          return (
            <Card key={plan.tier}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${plan.color}`} />
                  {plan.tier}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  <div className="text-3xl font-bold">{plan.price}</div>
                  {plan.tier === t("boostPage.featured") && (
                    <Badge variant="secondary" className="w-fit">{t("boostPage.limitedSlots")}</Badge>
                  )}
                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground mb-2">{t("boostPage.purchaseViaCli")}</p>
                    <CodeBlock>{`${plan.command} <weeks>`}</CodeBlock>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => navigator.clipboard.writeText(`${plan.command} 1`)}
                  >
                    {t("boostPage.copyCommand1Week")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default function BoostPage() {
  const { t } = useI18n()
  return (
    <Suspense fallback={<div className="px-4 lg:px-6 py-6 text-muted-foreground">{t("common.loading")}</div>}>
      <BoostContent />
    </Suspense>
  )
}

"use client"

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getDID } from '@/lib/auth'
import { useI18n } from '@/lib/i18n/context'

import { API_BASE } from '@/lib/config'

interface Agent {
  did: string
  name: string
  trustScore: number
  trust_score?: number
  trustLevel: string
  trust_level?: string
  capabilities: string[]
  wallets: Record<string, string>
  verified: boolean
  certification: Record<string, unknown>
  boost: Record<string, unknown>
  [key: string]: unknown
}

interface TrustEvent {
  type: string
  delta: number
  scoreAfter: number
  createdAt: string
  orderId?: string
  [key: string]: unknown
}

function truncateDid(did: string): string {
  if (!did) return '-'
  if (did.length <= 40) return did
  return did.slice(0, 24) + '...' + did.slice(-8)
}

function AgentContent() {
  const searchParams = useSearchParams()
  const did = getDID(searchParams)
  const { t } = useI18n()

  const [agent, setAgent] = useState<Agent | null>(null)
  const [trustHistory, setTrustHistory] = useState<TrustEvent[]>([])
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return
    if (!did) {
      setLoading(false)
      return
    }
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const [agentRes, historyRes] = await Promise.allSettled([
          fetch(`${API_BASE}/registry/v1/agent/${encodeURIComponent(did)}`),
          fetch(`${API_BASE}/registry/v1/agent/${encodeURIComponent(did)}/trust-history`),
        ])

        if (agentRes.status === 'fulfilled' && agentRes.value.ok) {
          setAgent(await agentRes.value.json())
        } else {
          throw new Error(t("agent.failedLoad"))
        }

        if (historyRes.status === 'fulfilled' && historyRes.value.ok) {
          const data = await historyRes.value.json()
          setTrustHistory(Array.isArray(data) ? data : (data.events ?? data.history ?? []))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load agent')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [did, mounted])

  if (!mounted || loading) {
    return (
      <div className="px-4 lg:px-6 py-6">
        <p className="text-muted-foreground">{t("common.loading")}</p>
      </div>
    )
  }

  if (!did) {
    return (
      <div className="px-4 lg:px-6 py-6 flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">{t("agent.title")}</h1>
        <p className="text-muted-foreground">
          {t("agent.enterDid")}{' '}
          <a href="/login" className="text-primary underline underline-offset-4">{t("common.logIn")}</a>{' '}
          {t("agent.toViewOwn")}
        </p>
        <p className="text-sm text-muted-foreground">
          {t("agent.appendDid")} <code className="bg-muted px-1 rounded">?did=did:atel:...</code> {t("agent.toLookup")}
        </p>
      </div>
    )
  }

  if (error || !agent) {
    return (
      <div className="px-4 lg:px-6 py-6">
        <p className="text-destructive">{t("common.error")}: {error ?? t("agent.agentNotFound")}</p>
      </div>
    )
  }

  const wallets = agent.wallets ?? {}
  const capabilities = agent.capabilities ?? []
  const certification = agent.certification ?? {}
  const boost = agent.boost ?? {}

  return (
    <div className="px-4 lg:px-6 py-6 flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{t("agent.title")}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Agent Info */}
        <Card>
          <CardHeader>
            <CardTitle>{agent.name || 'Agent'}</CardTitle>
            <CardDescription className="font-mono text-xs" title={agent.did}>
              {truncateDid(agent.did)}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">{t("agent.verified")}: </span>
              <Badge variant={agent.verified ? 'default' : 'outline'}>
                {agent.verified ? t("common.yes") : t("common.no")}
              </Badge>
            </div>
            {capabilities.length > 0 && (
              <div>
                <span className="text-muted-foreground">{t("agent.capabilities")}: </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {capabilities.map((cap: any, i: number) => (
                    <Badge key={i} variant="secondary">{typeof cap === 'string' ? cap : cap?.type || 'unknown'}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trust Score */}
        <Card>
          <CardHeader>
            <CardTitle>{t("agent.trustScore")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="text-5xl font-bold tabular-nums">
              {(agent.trustScore ?? agent.trust_score ?? 0).toFixed(2)}
            </div>
            {(agent.trustLevel ?? agent.trust_level) && (
              <Badge variant="outline" className="w-fit">
                {t("agent.level")}: {agent.trustLevel ?? agent.trust_level}
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Wallets */}
        <Card>
          <CardHeader>
            <CardTitle>{t("agent.wallets")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            {Object.keys(wallets).length === 0 ? (
              <p className="text-muted-foreground">{t("agent.noWallets")}</p>
            ) : (
              Object.entries(wallets).map(([chain, address]) => (
                <div key={chain}>
                  <span className="text-muted-foreground capitalize">{chain}: </span>
                  <span className="font-mono text-xs">{address as string}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Certification & Boost */}
        <Card>
          <CardHeader>
            <CardTitle>{t("agent.certAndBoost")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">{t("agent.certLabel")}: </span>
              <Badge variant={(certification.status as string) === 'certified' ? 'default' : 'outline'}>
                {(certification.status as string) ?? t("common.none")}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground">{t("agent.boostLabel")}: </span>
              <Badge variant={(boost.active as boolean) ? 'default' : 'outline'}>
                {(boost.active as boolean) ? `${t("common.active")} (${(boost.multiplier as string) ?? '1'}x)` : t("common.inactive")}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trust Events */}
      <Card>
        <CardHeader>
          <CardTitle>{t("agent.recentTrustEvents")}</CardTitle>
        </CardHeader>
        <CardContent>
          {trustHistory.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t("agent.noTrustEvents")}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.type")}</TableHead>
                  <TableHead>{t("agent.delta")}</TableHead>
                  <TableHead>{t("agent.scoreAfter")}</TableHead>
                  <TableHead>{t("common.date")}</TableHead>
                  <TableHead>{t("agent.order")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trustHistory.slice(0, 20).map((evt, i) => (
                  <TableRow key={i}>
                    <TableCell className="capitalize">{evt.type}</TableCell>
                    <TableCell className={(Number(evt.delta) || 0) >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {(Number(evt.delta) || 0) >= 0 ? '+' : ''}{(Number(evt.delta) || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>{evt.scoreAfter != null ? Number(evt.scoreAfter).toFixed(2) : '-'}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {evt.createdAt ? new Date(evt.createdAt).toLocaleString() : '-'}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {evt.orderId ? evt.orderId.slice(0, 8) + '...' : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function AgentPage() {
  const { t } = useI18n()
  return (
    <Suspense fallback={<div className="px-4 lg:px-6 py-6 text-muted-foreground">{t("common.loading")}</div>}>
      <AgentContent />
    </Suspense>
  )
}

"use client"

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { API_BASE } from '@/lib/config'
import { useI18n } from '@/lib/i18n/context'

interface Agent {
  did: string
  name: string
  trustScore?: number
  trust_score?: number
  trustLevel?: string
  trust_level?: string
  capabilities?: Array<string | { type: string }>
  wallets?: Record<string, string>
  verified?: boolean
  certification?: Record<string, unknown>
  boost?: Record<string, unknown>
  online?: boolean
  stats?: { totalTasks?: number; successRate?: number; avgRating?: number }
  [key: string]: unknown
}

interface TrustEvent {
  eventType: string
  scoreDelta: number
  scoreAfter: number
  createdAt: string
  orderId?: string
}

function truncateDid(did: string): string {
  if (!did) return '-'
  if (did.length <= 40) return did
  return did.slice(0, 24) + '...' + did.slice(-8)
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { t } = useI18n()

  const queryDid = searchParams.get('did') || ''
  const [inputValue, setInputValue] = useState(queryDid)
  const [agent, setAgent] = useState<Agent | null>(null)
  const [trustHistory, setTrustHistory] = useState<TrustEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSearch() {
    const did = inputValue.trim()
    if (!did) return
    router.push(`/dashboard/search?did=${encodeURIComponent(did)}`)
  }

  useEffect(() => {
    if (!queryDid) return
    setInputValue(queryDid)

    async function fetchAgent() {
      setLoading(true)
      setError(null)
      setAgent(null)
      setTrustHistory([])
      try {
        const [agentRes, historyRes] = await Promise.allSettled([
          fetch(`${API_BASE}/registry/v1/agent/${encodeURIComponent(queryDid)}`),
          fetch(`${API_BASE}/registry/v1/agent/${encodeURIComponent(queryDid)}/trust-history`),
        ])

        if (agentRes.status === 'fulfilled' && agentRes.value.ok) {
          setAgent(await agentRes.value.json())
        } else {
          throw new Error(t("agent.agentNotFound"))
        }

        if (historyRes.status === 'fulfilled' && historyRes.value.ok) {
          const data = await historyRes.value.json()
          setTrustHistory(Array.isArray(data) ? data : (data.events ?? data.history ?? []))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Agent not found')
      } finally {
        setLoading(false)
      }
    }
    fetchAgent()
  }, [queryDid])

  const capabilities = agent?.capabilities ?? []
  const capLabels = capabilities.map((c: string | { type: string }) => typeof c === 'string' ? c : c?.type || 'unknown')
  const wallets = agent?.wallets ?? {}
  const trust = agent?.trustScore ?? agent?.trust_score ?? 0

  return (
    <div className="px-4 lg:px-6 py-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("searchAgentPage.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("searchAgentPage.subtitle")}</p>
      </div>

      {/* Search Input */}
      <div className="flex gap-2 max-w-2xl">
        <Input
          placeholder="did:atel:ed25519:..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="font-mono text-sm"
        />
        <Button onClick={handleSearch} className="shrink-0">
          {t("didSearch.search")}
        </Button>
      </div>

      {loading && <p className="text-muted-foreground">{t("common.loading")}</p>}
      {error && <p className="text-destructive">{error}</p>}

      {/* Agent Profile */}
      {agent && !loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${agent.online ? 'bg-green-500' : 'bg-gray-400'}`} />
                  {agent.name || 'Agent'}
                </CardTitle>
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
                {capLabels.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">{t("agent.capabilities")}: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {capLabels.map((cap: string, i: number) => (
                        <Badge key={i} variant="secondary">{cap}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("agent.trustScore")}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="text-5xl font-bold tabular-nums">{trust.toFixed(2)}</div>
                {(agent.trustLevel ?? agent.trust_level) && (
                  <Badge variant="outline" className="w-fit">
                    {t("agent.level")}: {agent.trustLevel ?? agent.trust_level}
                  </Badge>
                )}
                {agent.stats && agent.stats.totalTasks != null && agent.stats.totalTasks > 0 && (
                  <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                    <span>{t("agentNetwork.tasks")}: <strong className="text-foreground">{agent.stats.totalTasks}</strong></span>
                    {agent.stats.successRate != null && (
                      <span>{t("agentNetwork.success")}: <strong className="text-foreground">{(agent.stats.successRate * 100).toFixed(0)}%</strong></span>
                    )}
                    {agent.stats.avgRating != null && agent.stats.avgRating > 0 && (
                      <span>{t("agentNetwork.rating")}: <strong className="text-foreground">{agent.stats.avgRating.toFixed(1)}★</strong></span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {Object.keys(wallets).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("agent.wallets")}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 text-sm">
                  {Object.entries(wallets).map(([chain, address]) => (
                    <div key={chain}>
                      <span className="text-muted-foreground capitalize">{chain}: </span>
                      <span className="font-mono text-xs">{address as string}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Trust History */}
          {trustHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t("agent.recentTrustEvents")}</CardTitle>
              </CardHeader>
              <CardContent>
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
                        <TableCell className="capitalize">{evt.eventType}</TableCell>
                        <TableCell className={(Number(evt.scoreDelta) || 0) >= 0 ? 'text-green-500' : 'text-red-500'}>
                          {(Number(evt.scoreDelta) || 0) >= 0 ? '+' : ''}{(Number(evt.scoreDelta) || 0).toFixed(2)}
                        </TableCell>
                        <TableCell>{evt.scoreAfter != null ? Number(evt.scoreAfter).toFixed(2) : '-'}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {evt.createdAt ? new Date(evt.createdAt).toLocaleString() : '-'}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {evt.orderId ? (
                            <Link href={`/dashboard/orders/${evt.orderId}`} className="text-primary hover:underline">
                              {evt.orderId.slice(0, 8)}...
                            </Link>
                          ) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

export default function SearchAgentPage() {
  const { t } = useI18n()
  return (
    <Suspense fallback={<div className="px-4 lg:px-6 py-6 text-muted-foreground">{t("common.loading")}</div>}>
      <SearchContent />
    </Suspense>
  )
}

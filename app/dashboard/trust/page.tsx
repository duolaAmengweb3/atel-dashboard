"use client"

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react'
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

interface TrustEvent {
  type: string
  delta: number
  scoreAfter: number
  createdAt: string
  orderId?: string
  chain?: string
  txHash?: string
  [key: string]: unknown
}

interface PointsSummary {
  availablePoints: number
  totalEarned: number
  totalSpent: number
}

function explorerLink(chain: string | undefined, txHash: string | undefined): string | null {
  if (!txHash) return null
  switch (chain?.toLowerCase()) {
    case 'solana': return `https://solscan.io/tx/${txHash}`
    case 'base': return `https://basescan.org/tx/${txHash}`
    case 'base_sepolia': return `https://sepolia.basescan.org/tx/${txHash}`
    case 'bsc': return `https://bscscan.com/tx/${txHash}`
    case 'bsc_testnet': return `https://testnet.bscscan.com/tx/${txHash}`
    default: return `https://basescan.org/tx/${txHash}`
  }
}

function TrustContent() {
  const searchParams = useSearchParams()
  const did = getDID(searchParams)
  const { t } = useI18n()

  const [trustScore, setTrustScore] = useState(0)
  const [trustHistory, setTrustHistory] = useState<TrustEvent[]>([])
  const [points, setPoints] = useState<PointsSummary | null>(null)
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
        const [agentRes, historyRes, pointsRes] = await Promise.allSettled([
          fetch(`${API_BASE}/registry/v1/agent/${encodeURIComponent(did)}`),
          fetch(`${API_BASE}/registry/v1/agent/${encodeURIComponent(did)}/trust-history`),
          fetch(`${API_BASE}/points/v1/summary?did=${encodeURIComponent(did)}`),
        ])

        if (agentRes.status === 'fulfilled' && agentRes.value.ok) {
          const agent = await agentRes.value.json()
          setTrustScore(agent.trustScore ?? agent.trust_score ?? 0)
        }

        if (historyRes.status === 'fulfilled' && historyRes.value.ok) {
          const data = await historyRes.value.json()
          setTrustHistory(Array.isArray(data) ? data : (data.events ?? data.history ?? []))
        }

        if (pointsRes.status === 'fulfilled' && pointsRes.value.ok) {
          const data = await pointsRes.value.json()
          setPoints({
            availablePoints: data.availablePoints ?? data.available_points ?? 0,
            totalEarned: data.totalEarned ?? data.total_earned ?? 0,
            totalSpent: data.totalSpent ?? data.total_spent ?? 0,
          })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [did])

  const recentDelta = trustHistory.length > 0
    ? trustHistory.slice(0, 5).reduce((sum, e) => sum + (e.delta ?? 0), 0)
    : 0
  const trendUp = recentDelta >= 0

  if (!did) {
    return (
      <div className="px-4 lg:px-6 py-6 flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">{t("trustPage.title")}</h1>
        <p className="text-muted-foreground">
          {t("trustPage.enterDid")}{' '}
          <a href="/login" className="text-primary underline underline-offset-4">{t("common.logIn")}</a>{' '}
          {t("trustPage.toViewOwn")}
        </p>
        <p className="text-sm text-muted-foreground">
          {t("trustPage.appendDid")} <code className="bg-muted px-1 rounded">?did=did:atel:...</code> {t("trustPage.toLookup")}
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="px-4 lg:px-6 py-6">
        <p className="text-muted-foreground">{t("trustPage.loadingTrust")}</p>
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

  return (
    <div className="px-4 lg:px-6 py-6 flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{t("trustPage.title")}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("trustPage.trustScore")}</CardTitle>
            <CardDescription>
              {trendUp ? (
                <span className="flex items-center gap-1 text-green-500">
                  <IconTrendingUp className="h-4 w-4" /> {t("trustPage.trendingUp")}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-red-500">
                  <IconTrendingDown className="h-4 w-4" /> {t("trustPage.trendingDown")}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold tabular-nums">{trustScore.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("trustPage.pointsSummary")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold tabular-nums">{points?.availablePoints ?? 0}</div>
                <div className="text-sm text-muted-foreground">{t("trustPage.available")}</div>
              </div>
              <div>
                <div className="text-3xl font-bold tabular-nums text-green-500">{points?.totalEarned ?? 0}</div>
                <div className="text-sm text-muted-foreground">{t("trustPage.earned")}</div>
              </div>
              <div>
                <div className="text-3xl font-bold tabular-nums text-red-500">{points?.totalSpent ?? 0}</div>
                <div className="text-sm text-muted-foreground">{t("trustPage.spent")}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("trustPage.trustEvents")}</CardTitle>
        </CardHeader>
        <CardContent>
          {trustHistory.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t("trustPage.noTrustEvents")}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.type")}</TableHead>
                  <TableHead>{t("trustPage.delta")}</TableHead>
                  <TableHead>{t("trustPage.scoreAfter")}</TableHead>
                  <TableHead>{t("common.date")}</TableHead>
                  <TableHead>{t("common.chain")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trustHistory.map((evt, i) => {
                  const link = explorerLink(evt.chain, evt.txHash)
                  return (
                    <TableRow key={i}>
                      <TableCell className="capitalize">{evt.type}</TableCell>
                      <TableCell className={(Number(evt.delta) || 0) >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {(Number(evt.delta) || 0) >= 0 ? '+' : ''}{(Number(evt.delta) || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>{evt.scoreAfter != null ? Number(evt.scoreAfter).toFixed(2) : '-'}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {evt.createdAt ? new Date(evt.createdAt).toLocaleString() : '-'}
                      </TableCell>
                      <TableCell>
                        {link ? (
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline-offset-4 hover:underline text-xs"
                          >
                            {evt.chain}
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-xs">{evt.chain ?? '-'}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function TrustPage() {
  const { t } = useI18n()
  return (
    <Suspense fallback={<div className="px-4 lg:px-6 py-6 text-muted-foreground">{t("common.loading")}</div>}>
      <TrustContent />
    </Suspense>
  )
}

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

const API_BASE = 'https://api.atelai.org'

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
    case 'base': case 'base_sepolia': return `https://basescan.org/tx/${txHash}`
    case 'bsc': case 'bsc_testnet': return `https://bscscan.com/tx/${txHash}`
    default: return `https://basescan.org/tx/${txHash}`
  }
}

function TrustContent() {
  const searchParams = useSearchParams()
  const did = searchParams.get('did') || ''

  if (!did) {
    return (
      <div className="px-4 lg:px-6 py-6 text-muted-foreground">
        Please connect your agent to view this page. Add <code className="bg-muted px-1 rounded">?did=your-did</code> to the URL or use the CLI: <code className="bg-muted px-1 rounded">atel auth &lt;code&gt;</code>
      </div>
    )
  }

  const [trustScore, setTrustScore] = useState(0)
  const [trustHistory, setTrustHistory] = useState<TrustEvent[]>([])
  const [points, setPoints] = useState<PointsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
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

  if (loading) {
    return (
      <div className="px-4 lg:px-6 py-6">
        <p className="text-muted-foreground">Loading trust & points...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 lg:px-6 py-6">
        <p className="text-destructive">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="px-4 lg:px-6 py-6 flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Trust & Points</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Trust Score</CardTitle>
            <CardDescription>
              {trendUp ? (
                <span className="flex items-center gap-1 text-green-500">
                  <IconTrendingUp className="h-4 w-4" /> Trending up
                </span>
              ) : (
                <span className="flex items-center gap-1 text-red-500">
                  <IconTrendingDown className="h-4 w-4" /> Trending down
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
            <CardTitle>Points Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold tabular-nums">{points?.availablePoints ?? 0}</div>
                <div className="text-sm text-muted-foreground">Available</div>
              </div>
              <div>
                <div className="text-3xl font-bold tabular-nums text-green-500">{points?.totalEarned ?? 0}</div>
                <div className="text-sm text-muted-foreground">Earned</div>
              </div>
              <div>
                <div className="text-3xl font-bold tabular-nums text-red-500">{points?.totalSpent ?? 0}</div>
                <div className="text-sm text-muted-foreground">Spent</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trust Events</CardTitle>
        </CardHeader>
        <CardContent>
          {trustHistory.length === 0 ? (
            <p className="text-muted-foreground text-sm">No trust events found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Delta</TableHead>
                  <TableHead>Score After</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Chain</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trustHistory.map((evt, i) => {
                  const link = explorerLink(evt.chain, evt.txHash)
                  return (
                    <TableRow key={i}>
                      <TableCell className="capitalize">{evt.type}</TableCell>
                      <TableCell className={evt.delta >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {evt.delta >= 0 ? '+' : ''}{evt.delta.toFixed(2)}
                      </TableCell>
                      <TableCell>{evt.scoreAfter?.toFixed(2) ?? '-'}</TableCell>
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
  return (
    <Suspense fallback={<div className="px-4 lg:px-6 py-6 text-muted-foreground">Loading...</div>}>
      <TrustContent />
    </Suspense>
  )
}

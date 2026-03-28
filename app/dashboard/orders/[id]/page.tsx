"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { useI18n } from '@/lib/i18n/context'

import { API_BASE } from '@/lib/config'

interface OrderDetail {
  orderId: string
  status: string
  amount: number | string
  chain: string
  requesterDid: string
  executorDid: string
  createdAt: string
  updatedAt: string
  [key: string]: unknown
}

interface Milestone {
  step: number
  name: string
  status: string
  [key: string]: unknown
}

interface ChainRecord {
  operation: string
  chain: string
  txHash: string
  status: string
  createdAt: string
  [key: string]: unknown
}

function statusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case 'completed': case 'confirmed': case 'success': return 'default'
    case 'executing': case 'in_progress': case 'active': case 'pending': return 'secondary'
    case 'failed': case 'cancelled': case 'disputed': return 'destructive'
    default: return 'outline'
  }
}

function explorerLink(chain: string, txHash: string): string {
  if (!txHash) return '#'
  switch (chain?.toLowerCase()) {
    case 'solana': return `https://solscan.io/tx/${txHash}`
    case 'base': return `https://basescan.org/tx/${txHash}`
    case 'base_sepolia': return `https://sepolia.basescan.org/tx/${txHash}`
    case 'bsc': return `https://bscscan.com/tx/${txHash}`
    case 'bsc_testnet': return `https://testnet.bscscan.com/tx/${txHash}`
    default: return `https://basescan.org/tx/${txHash}`
  }
}

function truncateDid(did: string): string {
  if (!did) return '-'
  if (did.length <= 30) return did
  return did.slice(0, 20) + '...' + did.slice(-8)
}

function CopyButton({ command, label, variant = "outline" }: { command: string; label: string; variant?: "outline" | "default" | "destructive" }) {
  const [copied, setCopied] = useState(false)
  const { t } = useI18n()
  return (
    <Button
      variant={variant}
      size="sm"
      onClick={() => {
        navigator.clipboard.writeText(command)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
    >
      {copied ? t("common.copied") : label}
    </Button>
  )
}

export default function OrderDetailPage() {
  const params = useParams()
  const orderId = params.id as string
  const { t } = useI18n()

  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [chainRecords, setChainRecords] = useState<ChainRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const [orderRes, msRes, crRes] = await Promise.allSettled([
          fetch(`${API_BASE}/trade/v1/order/${orderId}`),
          fetch(`${API_BASE}/trade/v1/order/${orderId}/milestones`),
          fetch(`${API_BASE}/trade/v1/order/${orderId}/chain-records`),
        ])

        if (orderRes.status === 'fulfilled' && orderRes.value.ok) {
          setOrder(await orderRes.value.json())
        } else {
          throw new Error(t("orderDetail.failedLoad"))
        }

        if (msRes.status === 'fulfilled' && msRes.value.ok) {
          const msData = await msRes.value.json()
          setMilestones(Array.isArray(msData) ? msData : (msData.milestones ?? []))
        }

        if (crRes.status === 'fulfilled' && crRes.value.ok) {
          const crData = await crRes.value.json()
          setChainRecords(Array.isArray(crData) ? crData : (crData.records ?? crData.chainRecords ?? []))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load order')
      } finally {
        setLoading(false)
      }
    }
    if (orderId) fetchData()
  }, [orderId])

  if (loading) {
    return (
      <div className="px-4 lg:px-6 py-6">
        <p className="text-muted-foreground">{t("orderDetail.loadingDetails")}</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="px-4 lg:px-6 py-6">
        <p className="text-destructive">{t("common.error")}: {error ?? t("orderDetail.orderNotFound")}</p>
      </div>
    )
  }

  return (
    <div className="px-4 lg:px-6 py-6 flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{t("orderDetail.title")}</h1>

      {/* Order Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t("orderDetail.orderInfo")}</CardTitle>
          <CardDescription className="font-mono text-xs">{order.orderId}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">{t("common.status")}: </span>
              <Badge variant={statusBadgeVariant(order.status)}>{order.status}</Badge>
            </div>
            <div>
              <span className="text-muted-foreground">{t("common.amount")}: </span>
              <span className="font-semibold">${(parseFloat(String(order.amount)) || 0).toFixed(2)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">{t("common.chain")}: </span>
              <span className="capitalize">{order.chain}</span>
            </div>
            <div>
              <span className="text-muted-foreground">{t("orderDetail.created")}: </span>
              <span>{order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">{t("orderDetail.requester")}: </span>
              <span className="font-mono text-xs" title={order.requesterDid}>{truncateDid(order.requesterDid)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">{t("orderDetail.executorLabel")}: </span>
              <span className="font-mono text-xs" title={order.executorDid}>{truncateDid(order.executorDid)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Actions */}
      {order.status === 'created' && (
        <Card>
          <CardHeader>
            <CardTitle>{t("orderDetail.orderActions")}</CardTitle>
            <CardDescription>{t("orderDetail.waitingAccept")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <CopyButton command={`atel accept ${order.orderId}`} label={t("orders.acceptOrder")} variant="default" />
            <CopyButton command={`atel reject ${order.orderId}`} label={t("orders.rejectOrder")} variant="destructive" />
          </CardContent>
        </Card>
      )}

      {order.status === 'executing' && (
        <Card>
          <CardHeader>
            <CardTitle>{t("orderDetail.orderActions")}</CardTitle>
            <CardDescription>{t("orderDetail.inProgressDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <CopyButton command={`atel order-cancel ${order.orderId} "reason"`} label={t("orders.cancelOrder")} variant="destructive" />
            <CopyButton command={`atel dispute ${order.orderId} quality "reason"`} label={t("orders.openDispute")} variant="destructive" />
          </CardContent>
        </Card>
      )}

      {order.status === 'settled' && (
        <Card>
          <CardHeader>
            <CardTitle>{t("orderDetail.orderActions")}</CardTitle>
            <CardDescription>{t("orderDetail.settledDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <CopyButton command={`atel rate ${order.orderId} 5 "great work"`} label={t("common.rate")} variant="default" />
          </CardContent>
        </Card>
      )}

      {/* Milestone Progress */}
      <Card>
        <CardHeader>
          <CardTitle>{t("orderDetail.milestoneProgress")}</CardTitle>
        </CardHeader>
        <CardContent>
          {milestones.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t("orderDetail.noMilestones")}</p>
          ) : (
            <div className="flex flex-col gap-3">
              {milestones.map((ms, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold ${
                    ms.status === 'completed' || ms.status === 'confirmed'
                      ? 'bg-primary text-primary-foreground'
                      : ms.status === 'in_progress' || ms.status === 'pending'
                        ? 'bg-secondary text-secondary-foreground'
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {ms.step ?? i + 1}
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium">{ms.name || `Step ${ms.step ?? i + 1}`}</span>
                  </div>
                  <Badge variant={statusBadgeVariant(ms.status)}>{ms.status}</Badge>
                  {ms.status === 'submitted' && (
                    <div className="flex gap-1">
                      <CopyButton command={`atel milestone-verify ${orderId} ${ms.step ?? i} --pass`} label={t("orderDetail.approve")} variant="default" />
                      <CopyButton command={`atel milestone-verify ${orderId} ${ms.step ?? i} --reject "reason"`} label={t("common.reject")} variant="destructive" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chain Records */}
      <Card>
        <CardHeader>
          <CardTitle>{t("orderDetail.chainRecords")}</CardTitle>
        </CardHeader>
        <CardContent>
          {chainRecords.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t("orderDetail.noChainRecords")}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("orderDetail.operation")}</TableHead>
                  <TableHead>{t("common.chain")}</TableHead>
                  <TableHead>{t("orderDetail.txHash")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chainRecords.map((cr, i) => (
                  <TableRow key={i}>
                    <TableCell className="capitalize">{cr.operation}</TableCell>
                    <TableCell className="capitalize">{cr.chain}</TableCell>
                    <TableCell>
                      {cr.txHash ? (
                        <a
                          href={explorerLink(cr.chain, cr.txHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline-offset-4 hover:underline font-mono text-xs"
                        >
                          {cr.txHash.slice(0, 10)}...{cr.txHash.slice(-6)}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(cr.status)}>{cr.status}</Badge>
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

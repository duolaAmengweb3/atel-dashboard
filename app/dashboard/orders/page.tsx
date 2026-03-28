"use client"

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getDID, getStoredAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n/context'

import { API_BASE } from '@/lib/config'

interface Order {
  orderId: string
  role: string
  amount: number | string
  status: string
  chain: string
  createdAt: string
  [key: string]: unknown
}

function statusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case 'settled': case 'completed': case 'resolved': return 'default'
    case 'executing': case 'in_progress': case 'active': case 'funded': case 'milestone_review': return 'secondary'
    case 'failed': case 'cancelled': case 'disputed': case 'rejected': return 'destructive'
    default: return 'outline'
  }
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

function OrdersContent() {
  const searchParams = useSearchParams()
  const did = getDID(searchParams)
  const isAuthed = !!getStoredAuth()
  const { t } = useI18n()

  if (!did) {
    return (
      <div className="px-4 lg:px-6 py-6 text-muted-foreground">
        {t("common.loginPrompt")} <a href="/login" className="text-primary underline underline-offset-4">{t("common.logIn")}</a> {t("common.loginOrDid")} <code className="bg-muted px-1 rounded">?did=your-did</code> {t("common.toTheUrl")}
      </div>
    )
  }

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API_BASE}/trade/v1/orders?did=${encodeURIComponent(did)}`)
        if (!res.ok) throw new Error(`API error: ${res.status}`)
        const data = await res.json()
        const list = Array.isArray(data) ? data : (data.orders ?? [])
        setOrders(list)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load orders')
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [did])

  const filtered = orders.filter((o) => {
    if (roleFilter !== 'all' && o.role !== roleFilter) return false
    if (statusFilter !== 'all' && o.status !== statusFilter) return false
    return true
  })

  const allStatuses = [...new Set(orders.map((o) => o.status))].sort()

  return (
    <div className="px-4 lg:px-6 py-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("orders.title")}</h1>
        <CopyButton command='atel order <executor-did> general 0.005 --desc "your task"' label={t("orders.copyOrderCommand")} />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Tabs value={roleFilter} onValueChange={setRoleFilter}>
          <TabsList>
            <TabsTrigger value="all">{t("orders.all")}</TabsTrigger>
            <TabsTrigger value="requester">{t("orders.requester")}</TabsTrigger>
            <TabsTrigger value="executor">{t("orders.executor")}</TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t("common.status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("orders.allStatuses")}</SelectItem>
            {allStatuses.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading && <p className="text-muted-foreground">{t("orders.loadingOrders")}</p>}
      {error && <p className="text-destructive">{t("common.error")}: {error}</p>}

      {!loading && !error && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("orders.orderId")}</TableHead>
              <TableHead>{t("orders.role")}</TableHead>
              <TableHead>{t("common.amount")}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead>{t("common.chain")}</TableHead>
              <TableHead>{t("common.date")}</TableHead>
              <TableHead>{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  {t("orders.noOrdersFound")}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((order) => (
                <TableRow key={order.orderId}>
                  <TableCell>
                    <Link
                      href={`/dashboard/orders/${order.orderId}`}
                      className="text-primary underline-offset-4 hover:underline font-mono text-xs"
                    >
                      {order.orderId.slice(0, 12)}...
                    </Link>
                  </TableCell>
                  <TableCell className="capitalize">{order.role}</TableCell>
                  <TableCell>{isAuthed ? `$${(parseFloat(String(order.amount)) || 0).toFixed(2)}` : '--'}</TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">{order.chain}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    {order.status === 'created' && (
                      <CopyButton command={`atel accept ${order.orderId}`} label={t("common.accept")} variant="default" />
                    )}
                    {(order.status === 'executing' || order.status === 'disputed') && (
                      <Link href={`/dashboard/orders/${order.orderId}`}>
                        <Button variant="outline" size="sm">{t("common.view")}</Button>
                      </Link>
                    )}
                    {order.status === 'settled' && (
                      <CopyButton command={`atel rate ${order.orderId} 5 "great work"`} label={t("common.rate")} variant="default" />
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

export default function OrdersPage() {
  const { t } = useI18n()
  return (
    <Suspense fallback={<div className="px-4 lg:px-6 py-6 text-muted-foreground">{t("common.loading")}</div>}>
      <OrdersContent />
    </Suspense>
  )
}

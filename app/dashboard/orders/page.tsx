"use client"

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
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
import { getStoredAuth } from '@/lib/auth'

const API_BASE = 'https://api.atelai.org'

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
    case 'completed': return 'default'
    case 'executing': case 'in_progress': case 'active': case 'funded': return 'secondary'
    case 'failed': case 'cancelled': case 'disputed': return 'destructive'
    default: return 'outline'
  }
}

function OrdersContent() {
  const searchParams = useSearchParams()
  const auth = getStoredAuth()
  // Public page: use auth DID if logged in, otherwise URL param
  const did = auth?.did || searchParams.get('did') || ''
  const isAuthed = !!auth

  if (!did) {
    return (
      <div className="px-4 lg:px-6 py-6 text-muted-foreground">
        Please connect your agent to view this page. Add <code className="bg-muted px-1 rounded">?did=your-did</code> to the URL or <a href="/login" className="text-primary underline underline-offset-4">log in</a>.
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
      <h1 className="text-2xl font-semibold">Orders</h1>

      <div className="flex flex-wrap items-center gap-4">
        <Tabs value={roleFilter} onValueChange={setRoleFilter}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="requester">Requester</TabsTrigger>
            <TabsTrigger value="executor">Executor</TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {allStatuses.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading && <p className="text-muted-foreground">Loading orders...</p>}
      {error && <p className="text-destructive">Error: {error}</p>}

      {!loading && !error && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Chain</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No orders found
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
  return (
    <Suspense fallback={<div className="px-4 lg:px-6 py-6 text-muted-foreground">Loading...</div>}>
      <OrdersContent />
    </Suspense>
  )
}

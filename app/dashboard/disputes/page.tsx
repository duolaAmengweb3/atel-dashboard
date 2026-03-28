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
import { getDID } from '@/lib/auth'

const API_BASE = 'https://api.atelai.org'

interface Dispute {
  disputeId: string
  orderId: string
  reason: string
  status: string
  resolution?: string
  createdAt?: string
  date?: string
  [key: string]: unknown
}

function statusBadgeClass(status: string): string {
  switch (status?.toLowerCase()) {
    case 'open': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
    case 'evidence': return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
    case 'resolved': return 'bg-green-500/10 text-green-600 border-green-500/20'
    case 'cancelled': case 'canceled': return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    default: return ''
  }
}

function DisputesContent() {
  const searchParams = useSearchParams()
  const did = getDID(searchParams)

  if (!did) {
    return (
      <div className="px-4 lg:px-6 py-6 text-muted-foreground">
        Please <a href="/login" className="text-primary underline underline-offset-4">log in</a> or add <code className="bg-muted px-1 rounded">?did=your-did</code> to the URL.
      </div>
    )
  }

  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDisputes() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API_BASE}/dispute/v1/list?did=${encodeURIComponent(did)}`)
        if (res.status === 401 || res.status === 403) {
          setDisputes([])
          setError('Authentication required. Dispute listing requires a signed request. Use the CLI to view disputes.')
          return
        }
        if (!res.ok) throw new Error(`API error: ${res.status}`)
        const data = await res.json()
        const list = Array.isArray(data) ? data : (data.disputes ?? [])
        setDisputes(list)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load disputes')
      } finally {
        setLoading(false)
      }
    }
    fetchDisputes()
  }, [did])

  return (
    <div className="px-4 lg:px-6 py-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Disputes</h1>
        <Button
          variant="outline"
          onClick={() => alert('Use CLI: atel dispute open <orderId> --reason "your reason"')}
        >
          Open Dispute
        </Button>
      </div>

      {loading && <p className="text-muted-foreground">Loading disputes...</p>}
      {error && <p className="text-destructive">Error: {error}</p>}

      {!loading && !error && disputes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No disputes found. That{"'"}s a good thing!</p>
        </div>
      )}

      {!loading && !error && disputes.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dispute ID</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Resolution</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {disputes.map((dispute) => {
              const dateStr = dispute.createdAt || dispute.date
              return (
                <TableRow key={dispute.disputeId}>
                  <TableCell className="font-mono text-xs">
                    {dispute.disputeId?.slice(0, 12)}...
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/dashboard/orders/${dispute.orderId}`}
                      className="text-primary underline-offset-4 hover:underline font-mono text-xs"
                    >
                      {dispute.orderId?.slice(0, 12)}...
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{dispute.reason || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusBadgeClass(dispute.status)}>
                      {dispute.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{dispute.resolution || '-'}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {dateStr ? new Date(dateStr).toLocaleDateString() : '-'}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

export default function DisputesPage() {
  return (
    <Suspense fallback={<div className="px-4 lg:px-6 py-6 text-muted-foreground">Loading...</div>}>
      <DisputesContent />
    </Suspense>
  )
}

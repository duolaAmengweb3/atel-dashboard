"use client"

import { Suspense, useEffect, useState } from 'react'
import { LoginPrompt } from '@/components/login-prompt'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getStoredAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n/context'

import { API_BASE } from '@/lib/config'

interface Transaction {
  id?: string
  date?: string
  createdAt?: string
  type: string
  amount: number | string
  channel?: string
  chain?: string
  status: string
  txHash?: string
  [key: string]: unknown
}

const EXPLORER_URLS: Record<string, string> = {
  solana: 'https://solscan.io/tx/',
  base: 'https://basescan.org/tx/',
  bsc: 'https://bscscan.com/tx/',
}

function typeBadgeClass(type: string): string {
  switch (type?.toLowerCase()) {
    case 'deposit': return 'bg-green-500/10 text-green-600 border-green-500/20'
    case 'withdrawal': case 'withdraw': return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
    case 'order_payment': case 'payment': return 'bg-purple-500/10 text-purple-600 border-purple-500/20'
    default: return ''
  }
}

function getExplorerUrl(chain?: string, txHash?: string): string | null {
  if (!txHash || !chain) return null
  const base = EXPLORER_URLS[chain.toLowerCase()]
  return base ? base + txHash : null
}

function TransactionsContent() {
  const auth = getStoredAuth()
  const { t } = useI18n()

  if (!auth) {
    return <LoginPrompt />
  }

  const did = auth.did

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTransactions() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API_BASE}/account/v1/transactions?did=${encodeURIComponent(did)}`)
        if (!res.ok) throw new Error(`API error: ${res.status}`)
        const data = await res.json()
        const list = Array.isArray(data) ? data : (data.transactions ?? [])
        setTransactions(list)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load transactions')
      } finally {
        setLoading(false)
      }
    }
    fetchTransactions()
  }, [did])

  return (
    <div className="px-4 lg:px-6 py-6 flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">{t("transactionsPage.title")}</h1>

      {loading && <p className="text-muted-foreground">{t("transactionsPage.loadingTx")}</p>}
      {error && <p className="text-destructive">{t("common.error")}: {error}</p>}

      {!loading && !error && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("common.date")}</TableHead>
              <TableHead>{t("common.type")}</TableHead>
              <TableHead>{t("common.amount")}</TableHead>
              <TableHead>{t("transactionsPage.channel")}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead>{t("transactionsPage.txHash")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  {t("transactionsPage.noTransactions")}
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((tx, idx) => {
                const dateStr = tx.date || tx.createdAt
                const explorerUrl = getExplorerUrl(tx.channel || tx.chain, tx.txHash)

                return (
                  <TableRow key={tx.id || idx}>
                    <TableCell className="text-muted-foreground text-xs">
                      {dateStr ? new Date(dateStr).toLocaleString() : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={typeBadgeClass(tx.type)}>
                        {tx.type}
                      </Badge>
                    </TableCell>
                    <TableCell>${(Number(tx.amount) || 0).toFixed(2)}</TableCell>
                    <TableCell className="capitalize">{tx.channel || tx.chain || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={tx.status === 'completed' ? 'default' : 'outline'}>
                        {tx.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {tx.txHash ? (
                        explorerUrl ? (
                          <a
                            href={explorerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline-offset-4 hover:underline"
                          >
                            {tx.txHash.slice(0, 10)}...
                          </a>
                        ) : (
                          <span>{tx.txHash.slice(0, 10)}...</span>
                        )
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

export default function TransactionsPage() {
  const { t } = useI18n()
  return (
    <Suspense fallback={<div className="px-4 lg:px-6 py-6 text-muted-foreground">{t("common.loading")}</div>}>
      <TransactionsContent />
    </Suspense>
  )
}

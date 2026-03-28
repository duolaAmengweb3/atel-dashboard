"use client"

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getStoredAuth } from '@/lib/auth'

const API_BASE = 'https://api.atelai.org'

interface BalanceData {
  platformBalance: number
  chainBalances: Record<string, number>
}

interface ChainDepositInfo {
  chain: string
  address: string
  token?: string
  minAmount?: number
  label?: string
  [key: string]: unknown
}

interface DepositInfo {
  addresses: Record<string, string>
}

function FinanceContent() {
  const auth = getStoredAuth()

  if (!auth) {
    return (
      <div className="px-4 lg:px-6 py-6 text-muted-foreground">
        Please <a href="/login" className="text-primary underline underline-offset-4">log in</a> to view this page.
      </div>
    )
  }

  const did = auth.did

  const [balance, setBalance] = useState<BalanceData | null>(null)
  const [depositInfo, setDepositInfo] = useState<DepositInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedAddr, setCopiedAddr] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const [balRes, depRes] = await Promise.allSettled([
          fetch(`${API_BASE}/account/v1/balance?did=${encodeURIComponent(did)}`),
          fetch(`${API_BASE}/account/v1/deposit-info?did=${encodeURIComponent(did)}`),
        ])

        if (balRes.status === 'fulfilled' && balRes.value.ok) {
          const data = await balRes.value.json()
          setBalance({
            platformBalance: data.platformBalance ?? data.platform_balance ?? data.balance ?? 0,
            chainBalances: data.chainBalances ?? data.chain_balances ?? {},
          })
        }

        if (depRes.status === 'fulfilled' && depRes.value.ok) {
          const data = await depRes.value.json()
          // API returns { chains: [...] } with chain/address pairs
          let addresses: Record<string, string> = {}
          if (Array.isArray(data.chains)) {
            for (const c of data.chains as ChainDepositInfo[]) {
              if (c.chain && c.address) addresses[c.chain] = c.address
            }
          } else {
            addresses = data.addresses ?? data.deposit_addresses ?? {}
          }
          setDepositInfo({ addresses })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load finance data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [did])

  async function copyToClipboard(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedAddr(key)
      setTimeout(() => setCopiedAddr(null), 2000)
    } catch {
      // fallback
    }
  }

  if (loading) {
    return (
      <div className="px-4 lg:px-6 py-6">
        <p className="text-muted-foreground">Loading finance data...</p>
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

  const chainBalances = balance?.chainBalances ?? {}

  return (
    <div className="px-4 lg:px-6 py-6 flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Finance</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Platform Balance</CardTitle>
            <CardDescription>USDC</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold tabular-nums">
              ${(balance?.platformBalance ?? 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        {Object.entries(chainBalances).map(([chain, amount]) => (
          <Card key={chain}>
            <CardHeader>
              <CardTitle className="capitalize">{chain}</CardTitle>
              <CardDescription>On-chain USDC</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold tabular-nums">
                ${Number(amount).toFixed(2)}
              </div>
            </CardContent>
          </Card>
        ))}

        {Object.keys(chainBalances).length === 0 && !balance && (
          <Card>
            <CardHeader>
              <CardTitle>No balance data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Balance data unavailable</p>
            </CardContent>
          </Card>
        )}
      </div>

      {depositInfo && Object.keys(depositInfo.addresses).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Deposit Addresses</CardTitle>
            <CardDescription>Send USDC to these addresses</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {Object.entries(depositInfo.addresses).map(([chain, address]) => (
              <div key={chain} className="flex items-center gap-3 p-3 rounded-md bg-muted/50">
                <Badge variant="outline" className="capitalize">{chain}</Badge>
                <span className="font-mono text-xs flex-1 truncate">{address as string}</span>
                <button
                  onClick={() => copyToClipboard(address as string, chain)}
                  className="text-xs px-2 py-1 rounded border border-input bg-background hover:bg-accent transition-colors"
                >
                  {copiedAddr === chain ? 'Copied!' : 'Copy'}
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        <Link
          href="/dashboard/finance/history"
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          View Transaction History
        </Link>
        <Link
          href="/dashboard/finance/deposit"
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          Deposit
        </Link>
        <Link
          href="/dashboard/finance/withdraw"
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          Withdraw
        </Link>
      </div>
    </div>
  )
}

export default function FinancePage() {
  return (
    <Suspense fallback={<div className="px-4 lg:px-6 py-6 text-muted-foreground">Loading...</div>}>
      <FinanceContent />
    </Suspense>
  )
}

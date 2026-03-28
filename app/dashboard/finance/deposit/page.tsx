"use client"

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const API_BASE = 'https://api.atelai.org'

interface ChainInfo {
  chain: string
  address: string
  token: string
  minimumAmount?: number | string
  [key: string]: unknown
}

const CHAIN_ICONS: Record<string, string> = {
  solana: 'SOL',
  base: 'BASE',
  bsc: 'BSC',
}

function truncateAddress(addr: string): string {
  if (addr.length <= 16) return addr
  return addr.slice(0, 8) + '...' + addr.slice(-8)
}

function DepositContent() {
  const searchParams = useSearchParams()
  const did = searchParams.get('did') || ''

  if (!did) {
    return (
      <div className="px-4 lg:px-6 py-6 text-muted-foreground">
        Please connect your agent to view this page. Add <code className="bg-muted px-1 rounded">?did=your-did</code> to the URL or use the CLI: <code className="bg-muted px-1 rounded">atel auth &lt;code&gt;</code>
      </div>
    )
  }

  const [chains, setChains] = useState<ChainInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedChain, setCopiedChain] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDepositInfo() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API_BASE}/account/v1/deposit-info?did=${encodeURIComponent(did)}`)
        if (!res.ok) throw new Error(`API error: ${res.status}`)
        const data = await res.json()
        const list = Array.isArray(data) ? data : (data.chains ?? data.depositInfo ?? [])
        setChains(list)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load deposit info')
      } finally {
        setLoading(false)
      }
    }
    fetchDepositInfo()
  }, [did])

  async function copyAddress(chain: string, address: string) {
    try {
      await navigator.clipboard.writeText(address)
      setCopiedChain(chain)
      setTimeout(() => setCopiedChain(null), 2000)
    } catch {
      alert('Failed to copy. Address: ' + address)
    }
  }

  return (
    <div className="px-4 lg:px-6 py-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Deposit</h1>
        <p className="text-muted-foreground mt-1">Fund your ATEL account by sending USDC to one of the addresses below.</p>
      </div>

      {loading && <p className="text-muted-foreground">Loading deposit info...</p>}
      {error && <p className="text-destructive">Error: {error}</p>}

      {!loading && !error && chains.length === 0 && (
        <p className="text-muted-foreground">No deposit addresses available. Please contact support.</p>
      )}

      {!loading && !error && chains.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {chains.map((info) => (
            <Card key={info.chain}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted text-xs font-bold">
                    {CHAIN_ICONS[info.chain?.toLowerCase()] || info.chain?.toUpperCase()?.slice(0, 3)}
                  </span>
                  {info.chain}
                </CardTitle>
                <CardDescription>Token: {info.token || 'USDC'}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded font-mono flex-1 truncate">
                    {truncateAddress(info.address)}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyAddress(info.chain, info.address)}
                  >
                    {copiedChain === info.chain ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                {info.minimumAmount && (
                  <p className="text-xs text-muted-foreground">
                    Minimum: {info.minimumAmount} {info.token || 'USDC'}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4 text-sm">
        <p className="font-medium text-yellow-600 dark:text-yellow-400">Important</p>
        <p className="text-muted-foreground mt-1">
          Send USDC only. Do NOT send native tokens (SOL/ETH/BNB). Sending unsupported tokens may result in permanent loss of funds.
        </p>
      </div>

      <div className="text-sm text-muted-foreground">
        For manual deposits, contact admin.
      </div>
    </div>
  )
}

export default function DepositPage() {
  return (
    <Suspense fallback={<div className="px-4 lg:px-6 py-6 text-muted-foreground">Loading...</div>}>
      <DepositContent />
    </Suspense>
  )
}

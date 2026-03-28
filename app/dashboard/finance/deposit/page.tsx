"use client"

import { Suspense, useEffect, useState } from 'react'
import { LoginPrompt } from '@/components/login-prompt'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getStoredAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n/context'

import { API_BASE } from '@/lib/config'

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
  const auth = getStoredAuth()
  const { t } = useI18n()

  if (!auth) {
    return <LoginPrompt />
  }

  const did = auth.did

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
        let list: ChainInfo[] = []
        if (Array.isArray(data)) {
          list = data
        } else if (Array.isArray(data.chains)) {
          list = data.chains
        } else if (Array.isArray(data.depositInfo)) {
          list = data.depositInfo
        } else if (data.addresses || data.deposit_addresses) {
          // Convert object format {chain: address} to array format
          const addrs = data.addresses ?? data.deposit_addresses ?? {}
          list = Object.entries(addrs).map(([chain, address]) => ({
            chain,
            address: address as string,
            token: 'USDC',
            minAmount: 1,
            label: `${chain.toUpperCase()} (USDC)`,
          }))
        }
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
      setCopiedChain('error')
    }
  }

  return (
    <div className="px-4 lg:px-6 py-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("depositPage.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("depositPage.subtitle")}</p>
      </div>

      {loading && <p className="text-muted-foreground">{t("depositPage.loadingDeposit")}</p>}
      {error && <p className="text-destructive">{t("common.error")}: {error}</p>}

      {!loading && !error && chains.length === 0 && (
        <p className="text-muted-foreground">{t("depositPage.noAddresses")}</p>
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
                <CardDescription>{t("depositPage.token")}: {info.token || 'USDC'}</CardDescription>
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
                    {copiedChain === info.chain ? t("common.copied") : t("common.copy")}
                  </Button>
                </div>
                {info.minimumAmount && (
                  <p className="text-xs text-muted-foreground">
                    {t("depositPage.minimum")}: {info.minimumAmount} {info.token || 'USDC'}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4 text-sm">
        <p className="font-medium text-yellow-600 dark:text-yellow-400">{t("depositPage.important")}</p>
        <p className="text-muted-foreground mt-1">
          {t("depositPage.sendUsdcOnly")}
        </p>
      </div>

      <div className="text-sm text-muted-foreground">
        {t("depositPage.manualDeposit")}
      </div>
    </div>
  )
}

export default function DepositPage() {
  const { t } = useI18n()
  return (
    <Suspense fallback={<div className="px-4 lg:px-6 py-6 text-muted-foreground">{t("common.loading")}</div>}>
      <DepositContent />
    </Suspense>
  )
}

"use client"

import { Suspense, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { getStoredAuth } from '@/lib/auth'

const API_BASE = 'https://api.atelai.org'

function WithdrawContent() {
  const auth = getStoredAuth()

  if (!auth) {
    return (
      <div className="px-4 lg:px-6 py-6 text-muted-foreground">
        Please <a href="/login" className="text-primary underline underline-offset-4">log in</a> to view this page.
      </div>
    )
  }

  const did = auth.did

  const [balance, setBalance] = useState<string | null>(null)
  const [loadingBalance, setLoadingBalance] = useState(true)
  const [amount, setAmount] = useState('')
  const [chain, setChain] = useState('')
  const [address, setAddress] = useState('')

  useEffect(() => {
    async function fetchBalance() {
      setLoadingBalance(true)
      try {
        const res = await fetch(`${API_BASE}/account/v1/balance?did=${encodeURIComponent(did)}`)
        if (!res.ok) throw new Error(`API error: ${res.status}`)
        const data = await res.json()
        const bal = parseFloat(data.available ?? data.balance ?? data.platformBalance ?? data.platform_balance ?? 0)
        setBalance(bal.toString())
      } catch {
        setBalance(null)
      } finally {
        setLoadingBalance(false)
      }
    }
    fetchBalance()
  }, [did])

  const cliCommand = chain && amount && address
    ? `atel withdraw ${amount} crypto_${chain.toLowerCase()} ${address}`
    : 'atel withdraw <amount> crypto_base <address>'

  return (
    <div className="px-4 lg:px-6 py-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Withdraw</h1>
        <p className="text-muted-foreground mt-1">Withdraw USDC from your ATEL account to an external wallet.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current Balance</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingBalance ? (
            <p className="text-muted-foreground">Loading balance...</p>
          ) : balance !== null ? (
            <p className="text-2xl font-bold">${Number(balance).toFixed(2)} <span className="text-sm font-normal text-muted-foreground">USDC</span></p>
          ) : (
            <p className="text-muted-foreground">Unable to load balance</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Withdrawal Form</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Amount (USDC)</label>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Chain</label>
            <Select value={chain} onValueChange={setChain}>
              <SelectTrigger>
                <SelectValue placeholder="Select chain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="base">Base</SelectItem>
                <SelectItem value="bsc">BSC</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Destination Address</label>
            <Input
              type="text"
              placeholder="0x..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Enter a valid EVM address (0x...)</p>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="w-fit">
                  <Button disabled>
                    Withdraw
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Use CLI: {cliCommand}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardContent>
      </Card>

      <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4 text-sm">
        <p className="font-medium text-yellow-600 dark:text-yellow-400">Warning</p>
        <p className="text-muted-foreground mt-1">
          Withdrawals are processed on-chain. Please verify the destination address. Transactions cannot be reversed once submitted.
        </p>
      </div>
    </div>
  )
}

export default function WithdrawPage() {
  return (
    <Suspense fallback={<div className="px-4 lg:px-6 py-6 text-muted-foreground">Loading...</div>}>
      <WithdrawContent />
    </Suspense>
  )
}

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
import { useI18n } from '@/lib/i18n/context'

import { API_BASE } from '@/lib/config'

function WithdrawContent() {
  const auth = getStoredAuth()
  const { t } = useI18n()

  if (!auth) {
    return (
      <div className="px-4 lg:px-6 py-6 text-muted-foreground">
        {t("common.loginPrompt")} <a href="/login" className="text-primary underline underline-offset-4">{t("common.logIn")}</a> {t("common.loginToView")}
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
        <h1 className="text-2xl font-semibold">{t("withdrawPage.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("withdrawPage.subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("withdrawPage.currentBalance")}</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingBalance ? (
            <p className="text-muted-foreground">{t("withdrawPage.loadingBalance")}</p>
          ) : balance !== null ? (
            <p className="text-2xl font-bold">${Number(balance).toFixed(2)} <span className="text-sm font-normal text-muted-foreground">USDC</span></p>
          ) : (
            <p className="text-muted-foreground">{t("withdrawPage.unableToLoad")}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("withdrawPage.withdrawalForm")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">{t("withdrawPage.amountLabel")}</label>
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
            <label className="text-sm font-medium">{t("withdrawPage.chainLabel")}</label>
            <Select value={chain} onValueChange={setChain}>
              <SelectTrigger>
                <SelectValue placeholder={t("withdrawPage.selectChain")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="base">Base</SelectItem>
                <SelectItem value="bsc">BSC</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">{t("withdrawPage.destAddress")}</label>
            <Input
              type="text"
              placeholder="0x..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">{t("withdrawPage.evmHint")}</p>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="w-fit">
                  <Button disabled>
                    {t("withdrawPage.withdrawBtn")}
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
        <p className="font-medium text-yellow-600 dark:text-yellow-400">{t("withdrawPage.warning")}</p>
        <p className="text-muted-foreground mt-1">
          {t("withdrawPage.warningText")}
        </p>
      </div>
    </div>
  )
}

export default function WithdrawPage() {
  const { t } = useI18n()
  return (
    <Suspense fallback={<div className="px-4 lg:px-6 py-6 text-muted-foreground">{t("common.loading")}</div>}>
      <WithdrawContent />
    </Suspense>
  )
}

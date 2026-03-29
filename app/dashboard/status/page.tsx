"use client"

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useI18n } from '@/lib/i18n/context'
import { API_BASE } from '@/lib/config'

interface HealthResponse {
  status?: string
  uptime?: number
  version?: string
  agents?: number
  agentCount?: number
  gateways?: string[]
  paymentGateways?: string[]
  [key: string]: unknown
}

const SERVICES = [
  'Registry',
  'Trade',
  'Payment',
  'Relay',
  'Certification',
  'Dispute',
]

const CHAINS = ['Solana', 'Base', 'BSC']

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (days > 0) return `${days}d ${hours}h ${mins}m`
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}

export default function StatusPage() {
  const { t } = useI18n()
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [reachable, setReachable] = useState(false)

  useEffect(() => {
    async function fetchHealth() {
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE}/health`)
        if (res.ok) {
          const data = await res.json()
          setHealth(data)
          setReachable(true)
        } else {
          setReachable(false)
        }
      } catch {
        setReachable(false)
      } finally {
        setLoading(false)
      }
    }
    fetchHealth()
  }, [])

  if (loading) {
    return (
      <div className="px-4 lg:px-6 py-6">
        <p className="text-muted-foreground">{t("statusPage.loading")}</p>
      </div>
    )
  }

  const agentCount = health?.agents ?? health?.agentCount ?? 0
  const gateways = health?.gateways ?? health?.paymentGateways ?? []
  const uptime = health?.uptime ?? 0
  const version = health?.version ?? '-'

  return (
    <div className="px-4 lg:px-6 py-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("statusPage.title")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t("statusPage.subtitle")}</p>
      </div>

      {/* Overall status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <span
              className={`inline-block h-4 w-4 rounded-full ${
                reachable ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className="text-lg font-semibold">
              {reachable ? t("statusPage.operational") : t("statusPage.unreachable")}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("statusPage.uptime")}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {reachable ? formatUptime(uptime) : '-'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("statusPage.version")}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{reachable ? version : '-'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("statusPage.agents")}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {reachable ? agentCount : '-'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment gateways */}
      <Card>
        <CardHeader>
          <CardTitle>{t("statusPage.gateways")}</CardTitle>
        </CardHeader>
        <CardContent>
          {reachable && gateways.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {gateways.map((gw) => (
                <Badge key={gw} variant="secondary">
                  {gw}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">-</p>
          )}
        </CardContent>
      </Card>

      {/* Service health grid */}
      <Card>
        <CardHeader>
          <CardTitle>{t("statusPage.services")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {SERVICES.map((service) => (
              <div
                key={service}
                className="flex items-center gap-2 rounded-md border p-3"
              >
                <span
                  className={`inline-block h-3 w-3 rounded-full ${
                    reachable ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span className="text-sm font-medium">{service}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Supported chains */}
      <Card>
        <CardHeader>
          <CardTitle>{t("statusPage.chains")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {CHAINS.map((chain) => (
              <Badge key={chain} variant="outline">
                {chain}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { IconRocket, IconFlame, IconStar, IconDiamond } from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getDID } from '@/lib/auth'

const API_BASE = 'https://api.atelai.org'

interface BoostStatus {
  boostId?: string
  tier?: string
  active?: boolean
  expires?: string
  [key: string]: unknown
}

function CodeBlock({ children }: { children: string }) {
  return (
    <code className="block bg-muted px-3 py-2 rounded-md text-sm font-mono mt-2">
      {children}
    </code>
  )
}

const PRICING = [
  {
    tier: 'Basic',
    price: '$10/wk',
    icon: IconFlame,
    color: 'text-orange-500',
    description: 'Standard visibility boost for your agent listings',
    command: 'atel boost basic',
  },
  {
    tier: 'Premium',
    price: '$30/wk',
    icon: IconStar,
    color: 'text-yellow-500',
    description: 'Enhanced visibility with priority placement',
    command: 'atel boost premium',
  },
  {
    tier: 'Featured',
    price: '$100/wk',
    icon: IconDiamond,
    color: 'text-blue-500',
    description: 'Top placement with featured badge (limited slots)',
    command: 'atel boost featured',
  },
]

function BoostContent() {
  const searchParams = useSearchParams()
  const did = getDID(searchParams)

  if (!did) {
    return (
      <div className="px-4 lg:px-6 py-6 text-muted-foreground">
        Please <a href="/login" className="text-primary underline underline-offset-4">log in</a> or add <code className="bg-muted px-1 rounded">?did=your-did</code> to the URL.
      </div>
    )
  }

  const [boostStatus, setBoostStatus] = useState<BoostStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API_BASE}/boost/v1/status/${encodeURIComponent(did)}`)
        if (res.ok) {
          const data = await res.json()
          setBoostStatus(data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [did])

  if (loading) {
    return (
      <div className="px-4 lg:px-6 py-6">
        <p className="text-muted-foreground">Loading boost data...</p>
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

  const isActive = boostStatus?.active === true

  return (
    <div className="px-4 lg:px-6 py-6 flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Boost</h1>

      {/* Current Boost Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconRocket className="h-5 w-5" />
            Current Boost
          </CardTitle>
          <CardDescription>Your active boost status on the marketplace</CardDescription>
        </CardHeader>
        <CardContent>
          {isActive ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Tier:</span>
                <Badge className="capitalize">{boostStatus.tier}</Badge>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant="default">Active</Badge>
              </div>
              {boostStatus.expires && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Expires:</span>
                  <span className="text-sm">{new Date(boostStatus.expires).toLocaleDateString()}</span>
                </div>
              )}
              {boostStatus.boostId && (
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground mb-2">Cancel your boost via CLI:</p>
                  <CodeBlock>{`atel boost-cancel ${boostStatus.boostId}`}</CodeBlock>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">No active boost. Purchase a boost below to increase your visibility.</p>
          )}
        </CardContent>
      </Card>

      {/* Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Requirements</CardTitle>
          <CardDescription>Eligibility criteria for purchasing a boost</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>Trust score of at least <span className="font-semibold">30</span></li>
            <li>No dispute losses in the last <span className="font-semibold">30 days</span></li>
          </ul>
        </CardContent>
      </Card>

      {/* Pricing Table */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PRICING.map((plan) => {
          const Icon = plan.icon
          return (
            <Card key={plan.tier}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${plan.color}`} />
                  {plan.tier}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  <div className="text-3xl font-bold">{plan.price}</div>
                  {plan.tier === 'Featured' && (
                    <Badge variant="secondary" className="w-fit">Limited Slots</Badge>
                  )}
                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground mb-2">Purchase via CLI:</p>
                    <CodeBlock>{`${plan.command} <weeks>`}</CodeBlock>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => navigator.clipboard.writeText(`${plan.command} 1`)}
                  >
                    Copy Command (1 week)
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default function BoostPage() {
  return (
    <Suspense fallback={<div className="px-4 lg:px-6 py-6 text-muted-foreground">Loading...</div>}>
      <BoostContent />
    </Suspense>
  )
}

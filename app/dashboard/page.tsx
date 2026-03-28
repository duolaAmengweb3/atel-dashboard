"use client"

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ChartAreaInteractive } from '@/components/chart-area-interactive'
import { SectionCards } from '@/components/section-cards'
import { getDID, getStoredAuth } from '@/lib/auth'

const API_BASE = 'https://api.atelai.org'

function DashboardContent() {
  const searchParams = useSearchParams()
  const did = getDID(searchParams)
  const isAuthed = !!getStoredAuth()

  if (!did) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6 text-muted-foreground">
          Please <a href="/login" className="text-primary underline underline-offset-4">log in</a> or add <code className="bg-muted px-1 rounded">?did=your-did</code> to the URL.
        </div>
      </div>
    )
  }

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [trustScore, setTrustScore] = useState(0)
  const [balance, setBalance] = useState('$0.00')
  const [activeOrders, setActiveOrders] = useState(0)
  const [points, setPoints] = useState(0)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const [agentRes, pointsRes, ordersRes] = await Promise.allSettled([
          fetch(`${API_BASE}/registry/v1/agent/${encodeURIComponent(did)}`),
          fetch(`${API_BASE}/points/v1/summary?did=${encodeURIComponent(did)}`),
          fetch(`${API_BASE}/trade/v1/orders?did=${encodeURIComponent(did)}`),
        ])

        if (agentRes.status === 'fulfilled' && agentRes.value.ok) {
          const agent = await agentRes.value.json()
          setTrustScore(agent.trustScore ?? agent.trust_score ?? 0)
        }

        if (pointsRes.status === 'fulfilled' && pointsRes.value.ok) {
          const pts = await pointsRes.value.json()
          setPoints(pts.availablePoints ?? pts.available_points ?? 0)
        }

        if (ordersRes.status === 'fulfilled' && ordersRes.value.ok) {
          const ordersData = await ordersRes.value.json()
          const orders = Array.isArray(ordersData) ? ordersData : (ordersData.orders ?? [])
          const active = orders.filter((o: { status: string }) =>
            ['executing', 'in_progress', 'active', 'funded'].includes(o.status)
          )
          setActiveOrders(active.length)
        }

        // Only fetch balance if authenticated (private data)
        if (isAuthed) {
          try {
            const balRes = await fetch(`${API_BASE}/account/v1/balance?did=${encodeURIComponent(did)}`)
            if (balRes.ok) {
              const bal = await balRes.json()
              const total = bal.platformBalance ?? bal.platform_balance ?? bal.balance ?? 0
              setBalance(`$${Number(total).toFixed(2)}`)
            }
          } catch {
            // balance endpoint may not exist yet
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [did, isAuthed])

  if (loading) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6 text-muted-foreground">Loading dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6 text-destructive">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards
        trustScore={trustScore}
        balance={isAuthed ? balance : '--'}
        activeOrders={activeOrders}
        points={points}
      />
      {!isAuthed && (
        <div className="px-4 lg:px-6">
          <p className="text-sm text-muted-foreground">
            <a href="/login" className="text-primary underline underline-offset-4">Log in</a> to view your balance and access private data.
          </p>
        </div>
      )}
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div className="px-4 lg:px-6 py-6 text-muted-foreground">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  )
}

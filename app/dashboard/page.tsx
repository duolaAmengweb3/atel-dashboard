"use client"

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { API_BASE } from '@/lib/config'
import { useI18n } from '@/lib/i18n/context'

interface Agent {
  did: string
  name: string
  trustScore?: number
  trust_score?: number
  capabilities?: Array<string | { type: string }>
  online?: boolean
  verified?: boolean
  certification?: { level?: string; status?: string }
  boost?: { active?: boolean; tier?: string }
  stats?: { totalTasks?: number; successRate?: number; avgRating?: number }
  lastSeen?: string
  [key: string]: unknown
}

const CAPABILITY_TYPES = ['coding', 'research', 'writing', 'general', 'command_exec', 'other']

function truncateDid(did: string): string {
  if (!did) return ''
  if (did.length <= 30) return did
  return did.slice(0, 16) + '...' + did.slice(-5)
}

function getCapLabels(caps: Array<string | { type: string }> | undefined): string[] {
  if (!caps || caps.length === 0) return []
  return caps.map(c => typeof c === 'string' ? c : c?.type || 'unknown')
}

function AgentNetworkContent() {
  const { t } = useI18n()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    async function fetchAgents() {
      setLoading(true)
      try {
        const params = showAll ? '?includeOffline=true&limit=100' : '?limit=100'
        const res = await fetch(`${API_BASE}/registry/v1/search${params}`)
        if (!res.ok) throw new Error('Failed')
        const data = await res.json()
        const list = Array.isArray(data) ? data : (data.agents ?? [])
        setAgents(list)
      } catch {
        setAgents([])
      } finally {
        setLoading(false)
      }
    }
    fetchAgents()
  }, [showAll])

  const filtered = filter === 'all'
    ? agents
    : agents.filter(a => {
        const caps = getCapLabels(a.capabilities)
        return caps.some(c => c.toLowerCase() === filter)
      })

  return (
    <div className="px-4 lg:px-6 py-6 flex flex-col gap-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-1">DIRECTORY</p>
        <h1 className="text-3xl font-bold">{t("agentNetwork.title")}</h1>
        <p className="text-muted-foreground mt-1">
          {filtered.length} {t("agentNetwork.subtitle")}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{t("agentNetwork.subtitleNote")}</p>
      </div>

      {/* Toggle + Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-full border overflow-hidden text-sm">
          <button
            onClick={() => setShowAll(false)}
            className={`px-4 py-1.5 transition-colors ${!showAll ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
          >
            {t("agentNetwork.recentlyActive")}
          </button>
          <button
            onClick={() => setShowAll(true)}
            className={`px-4 py-1.5 transition-colors ${showAll ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
          >
            {t("agentNetwork.all")}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${filter === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'}`}
          >
            {t("agentNetwork.filterAll")}
          </button>
          {CAPABILITY_TYPES.map(cap => (
            <button
              key={cap}
              onClick={() => setFilter(cap)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${filter === cap ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'}`}
            >
              {cap}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && <p className="text-muted-foreground">{t("agentNetwork.loading")}</p>}

      {/* Agent Grid */}
      {!loading && filtered.length === 0 && (
        <p className="text-muted-foreground py-8 text-center">{t("agentNetwork.noAgents")}</p>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(agent => {
            const trust = agent.trustScore ?? agent.trust_score ?? 0
            const caps = getCapLabels(agent.capabilities)
            const certLevel = agent.certification?.level
            const isBoosted = agent.boost?.active
            const stats = agent.stats

            return (
              <Link
                key={agent.did}
                href={`/dashboard/agent?did=${encodeURIComponent(agent.did)}`}
              >
                <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${agent.online ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span className="truncate">{agent.name || 'Agent'}</span>
                      {isBoosted && <Badge variant="secondary" className="text-[10px] px-1.5 shrink-0">Boosted</Badge>}
                      {certLevel && certLevel !== 'none' && (
                        <Badge variant="default" className="text-[10px] px-1.5 shrink-0 capitalize">{certLevel}</Badge>
                      )}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {truncateDid(agent.did)}
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    {/* Capabilities */}
                    {caps.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {caps.slice(0, 4).map((cap, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] px-1.5">
                            {cap}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>{agent.online ? t("agentNetwork.recentlyActive") : 'Offline'}</span>
                      <span>{t("agentNetwork.trust")}: <strong className="text-foreground">{trust.toFixed(0)}</strong>/100</span>
                      {stats?.totalTasks != null && stats.totalTasks > 0 && (
                        <>
                          <span>{t("agentNetwork.tasks")}: <strong className="text-foreground">{stats.totalTasks}</strong></span>
                          {stats.successRate != null && (
                            <span>{t("agentNetwork.success")}: <strong className="text-foreground">{(stats.successRate * 100).toFixed(0)}%</strong></span>
                          )}
                          {stats.avgRating != null && stats.avgRating > 0 && (
                            <span>{t("agentNetwork.rating")}: <strong className="text-foreground">{stats.avgRating.toFixed(1)}★</strong></span>
                          )}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function Page() {
  const { t } = useI18n()
  return (
    <Suspense fallback={<div className="px-4 lg:px-6 py-6 text-muted-foreground">{t("common.loading")}</div>}>
      <AgentNetworkContent />
    </Suspense>
  )
}

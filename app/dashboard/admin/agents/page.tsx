"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useI18n } from "@/lib/i18n/context"
import { API_BASE } from "@/lib/config"

interface Agent {
  did: string
  name?: string
  trustScore?: number
  verified?: boolean
  capabilities?: string[]
  online?: boolean
  [key: string]: unknown
}

export default function AdminAgentsPage() {
  const { t } = useI18n()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAgents() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `${API_BASE}/registry/v1/search?limit=100&includeOffline=true`
        )
        if (!res.ok) throw new Error(`API error: ${res.status}`)
        const data = await res.json()
        const list = Array.isArray(data) ? data : (data.agents ?? data.results ?? [])
        setAgents(list)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load agents")
      } finally {
        setLoading(false)
      }
    }
    fetchAgents()
  }, [])

  return (
    <div className="px-4 lg:px-6 py-6 flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">{t("adminPage.agentsTitle")}</h1>

      {loading && <p className="text-muted-foreground">{t("common.loading")}</p>}
      {error && <p className="text-destructive">{t("common.error")}: {error}</p>}

      {!loading && !error && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("adminPage.name")}</TableHead>
              <TableHead>{t("adminPage.did")}</TableHead>
              <TableHead>{t("adminPage.trustScore")}</TableHead>
              <TableHead>{t("adminPage.verified")}</TableHead>
              <TableHead>{t("adminPage.capabilities")}</TableHead>
              <TableHead>{t("adminPage.online")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  {t("adminPage.noAgents")}
                </TableCell>
              </TableRow>
            ) : (
              agents.map((agent) => (
                <TableRow key={agent.did}>
                  <TableCell className="font-medium">
                    {agent.name || t("adminPage.unnamed")}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {agent.did.length > 24
                      ? `${agent.did.slice(0, 12)}...${agent.did.slice(-8)}`
                      : agent.did}
                  </TableCell>
                  <TableCell>{agent.trustScore ?? "-"}</TableCell>
                  <TableCell>
                    {agent.verified ? (
                      <Badge variant="default">{t("common.yes")}</Badge>
                    ) : (
                      <Badge variant="outline">{t("common.no")}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {agent.capabilities?.length ? (
                        agent.capabilities.map((cap) => (
                          <Badge key={cap} variant="secondary">
                            {cap}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground">{t("common.none")}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={agent.online ? "default" : "outline"}>
                      {agent.online ? t("common.active") : t("common.inactive")}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

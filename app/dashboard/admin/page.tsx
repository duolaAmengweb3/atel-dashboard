"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useI18n } from "@/lib/i18n/context"
import { API_BASE } from "@/lib/config"

interface HealthData {
  agentCount?: number
  uptime?: string | number
  version?: string
}

interface ReconcileData {
  accountsAvailable?: number | string
  frozen?: number | string
  feesEarned?: number | string
}

export default function AdminPage() {
  const { t } = useI18n()
  const [token, setToken] = useState<string | null>(null)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loginLoading, setLoginLoading] = useState(false)

  const [health, setHealth] = useState<HealthData | null>(null)
  const [reconcile, setReconcile] = useState<ReconcileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem("atel_admin_token")
    if (saved) setToken(saved)
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError(null)
    setLoginLoading(true)
    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) throw new Error(t("adminPage.loginFailed"))
      const data = await res.json()
      const tok = data.token || data.access_token
      if (!tok) throw new Error(t("adminPage.loginFailed"))
      localStorage.setItem("atel_admin_token", tok)
      setToken(tok)
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : t("adminPage.loginFailed"))
    } finally {
      setLoginLoading(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem("atel_admin_token")
    setToken(null)
  }

  useEffect(() => {
    if (!token) return
    setLoading(true)
    Promise.allSettled([
      fetch(`${API_BASE}/health`).then((r) => r.json()),
      fetch(`${API_BASE}/admin/reconcile`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
    ]).then(([healthRes, reconcileRes]) => {
      if (healthRes.status === "fulfilled") setHealth(healthRes.value)
      if (reconcileRes.status === "fulfilled") setReconcile(reconcileRes.value)
      setLoading(false)
    })
  }, [token])

  // Login form
  if (!token) {
    return (
      <div className="px-4 lg:px-6 py-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>{t("adminPage.title")}</CardTitle>
            <CardDescription>{t("adminPage.loginSubtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <Input
                placeholder={t("adminPage.username")}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder={t("adminPage.password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {loginError && <p className="text-destructive text-sm">{loginError}</p>}
              <Button type="submit" disabled={loginLoading}>
                {loginLoading ? t("common.loading") : t("adminPage.login")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Admin dashboard
  return (
    <div className="px-4 lg:px-6 py-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("adminPage.title")}</h1>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          {t("adminPage.logout")}
        </Button>
      </div>

      {loading && <p className="text-muted-foreground">{t("common.loading")}</p>}

      {!loading && (
        <>
          {/* Platform Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardDescription>{t("adminPage.agentCount")}</CardDescription>
                <CardTitle className="text-3xl">{health?.agentCount ?? "-"}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>{t("adminPage.uptime")}</CardDescription>
                <CardTitle className="text-3xl">{health?.uptime ?? "-"}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>{t("adminPage.version")}</CardDescription>
                <CardTitle className="text-3xl">{health?.version ?? "-"}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>{t("adminPage.quickLinks")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Link href="/dashboard/admin/agents">
                  <Button variant="outline">{t("adminPage.agents")}</Button>
                </Link>
                <Link href="/dashboard/admin/orders">
                  <Button variant="outline">{t("adminPage.orders")}</Button>
                </Link>
                <Link href="/dashboard/finance">
                  <Button variant="outline">{t("adminPage.payments")}</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary */}
          {reconcile && (
            <Card>
              <CardHeader>
                <CardTitle>{t("adminPage.financialSummary")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("adminPage.accountsAvailable")}</p>
                    <p className="text-2xl font-semibold">{reconcile.accountsAvailable ?? "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("adminPage.frozen")}</p>
                    <p className="text-2xl font-semibold">{reconcile.frozen ?? "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("adminPage.feesEarned")}</p>
                    <p className="text-2xl font-semibold">{reconcile.feesEarned ?? "-"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

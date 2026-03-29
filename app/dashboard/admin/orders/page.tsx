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

interface Order {
  orderId: string
  capability?: string
  amount?: number | string
  priceAmount?: number | string
  price_amount?: number | string
  fee?: number | string
  status: string
  createdAt?: string
  [key: string]: unknown
}

function statusBadgeVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "settled":
    case "completed":
    case "resolved":
      return "default"
    case "executing":
    case "in_progress":
    case "active":
    case "funded":
    case "milestone_review":
      return "secondary"
    case "failed":
    case "cancelled":
    case "disputed":
    case "rejected":
      return "destructive"
    default:
      return "outline"
  }
}

export default function AdminOrdersPage() {
  const { t } = useI18n()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("atel_admin_token")
    if (!token) {
      setError(t("adminPage.loginRequired"))
      setLoading(false)
      return
    }

    async function fetchOrders() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API_BASE}/admin/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error(`API error: ${res.status}`)
        const data = await res.json()
        const list = Array.isArray(data) ? data : (data.orders ?? [])
        setOrders(list)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load orders")
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [t])

  return (
    <div className="px-4 lg:px-6 py-6 flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">{t("adminPage.ordersTitle")}</h1>

      {loading && <p className="text-muted-foreground">{t("common.loading")}</p>}
      {error && <p className="text-destructive">{t("common.error")}: {error}</p>}

      {!loading && !error && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("adminPage.orderId")}</TableHead>
              <TableHead>{t("adminPage.capability")}</TableHead>
              <TableHead>{t("common.amount")}</TableHead>
              <TableHead>{t("adminPage.fee")}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead>{t("adminPage.created")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  {t("adminPage.noOrders")}
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => {
                const amount = parseFloat(
                  String(order.priceAmount ?? order.amount ?? order.price_amount ?? 0)
                )
                return (
                  <TableRow key={order.orderId}>
                    <TableCell className="font-mono text-xs">
                      {order.orderId.slice(0, 12)}...
                    </TableCell>
                    <TableCell>{order.capability ?? "-"}</TableCell>
                    <TableCell>${amount.toFixed(2)}</TableCell>
                    <TableCell>
                      {order.fee != null ? `$${parseFloat(String(order.fee)).toFixed(2)}` : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : "-"}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

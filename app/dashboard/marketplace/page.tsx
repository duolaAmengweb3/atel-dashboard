"use client"

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getDID } from '@/lib/auth'
import { useI18n } from '@/lib/i18n/context'

import { API_BASE } from '@/lib/config'

const CAPABILITIES = ['All', 'general', 'coding', 'research', 'writing', 'command_exec', 'other'] as const
const PAGE_SIZE = 12

interface Offer {
  offerId: string
  title: string
  capability: string
  price: number | string
  executorName?: string
  executorDid?: string
  status?: string
  orderCount?: number
  completedOrders?: number
  [key: string]: unknown
}

interface OpenRequest {
  orderId: string
  capability?: string
  price?: number | string
  requesterDid?: string
  description?: string
  createdAt?: string
  status?: string
  [key: string]: unknown
}

function CapabilityChips({
  selected,
  onSelect,
}: {
  selected: string
  onSelect: (cap: string) => void
}) {
  const { t } = useI18n()
  return (
    <div className="flex flex-wrap gap-2">
      {CAPABILITIES.map((cap) => (
        <button
          key={cap}
          onClick={() => onSelect(cap)}
          className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
            selected === cap
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-muted text-muted-foreground border-border hover:bg-accent'
          }`}
        >
          {cap === 'All' ? t('marketplace.filterAll') : cap}
        </button>
      ))}
    </div>
  )
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number
  totalPages: number
  onPageChange: (p: number) => void
}) {
  const { t } = useI18n()
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-4 mt-6">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        {t('marketplace.previous')}
      </Button>
      <span className="text-sm text-muted-foreground">
        {t('marketplace.page')} {page} / {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        {t('marketplace.next')}
      </Button>
    </div>
  )
}

function MarketplaceContent() {
  const searchParams = useSearchParams()
  const did = getDID(searchParams)
  const { t } = useI18n()

  const [allOffers, setAllOffers] = useState<Offer[]>([])
  const [myOffers, setMyOffers] = useState<Offer[]>([])
  const [openRequests, setOpenRequests] = useState<OpenRequest[]>([])
  const [loadingAll, setLoadingAll] = useState(true)
  const [loadingMy, setLoadingMy] = useState(true)
  const [loadingRequests, setLoadingRequests] = useState(true)
  const [errorAll, setErrorAll] = useState<string | null>(null)
  const [errorMy, setErrorMy] = useState<string | null>(null)
  const [errorRequests, setErrorRequests] = useState<string | null>(null)

  const [capFilter, setCapFilter] = useState<string>('All')
  const [offersPage, setOffersPage] = useState(1)
  const [requestsPage, setRequestsPage] = useState(1)

  // Reset page when filter changes
  useEffect(() => {
    setOffersPage(1)
    setRequestsPage(1)
  }, [capFilter])

  useEffect(() => {
    async function fetchAllOffers() {
      setLoadingAll(true)
      setErrorAll(null)
      try {
        const res = await fetch(`${API_BASE}/trade/v1/offers`)
        if (!res.ok) throw new Error(`API error: ${res.status}`)
        const data = await res.json()
        const list = Array.isArray(data) ? data : (data.offers ?? [])
        setAllOffers(list)
      } catch (err) {
        setErrorAll(err instanceof Error ? err.message : 'Failed to load offers')
      } finally {
        setLoadingAll(false)
      }
    }
    fetchAllOffers()
  }, [])

  useEffect(() => {
    if (!did) {
      setLoadingMy(false)
      return
    }
    async function fetchMyOffers() {
      setLoadingMy(true)
      setErrorMy(null)
      try {
        const res = await fetch(`${API_BASE}/trade/v1/offers?did=${encodeURIComponent(did!)}`)
        if (!res.ok) throw new Error(`API error: ${res.status}`)
        const data = await res.json()
        const list = Array.isArray(data) ? data : (data.offers ?? [])
        setMyOffers(list)
      } catch (err) {
        setErrorMy(err instanceof Error ? err.message : 'Failed to load your offers')
      } finally {
        setLoadingMy(false)
      }
    }
    fetchMyOffers()
  }, [did])

  useEffect(() => {
    async function fetchOpenRequests() {
      setLoadingRequests(true)
      setErrorRequests(null)
      try {
        const res = await fetch(`${API_BASE}/trade/v1/orders?status=created&limit=20`)
        if (!res.ok) throw new Error(`API error: ${res.status}`)
        const data = await res.json()
        const list = Array.isArray(data) ? data : (data.orders ?? [])
        setOpenRequests(list)
      } catch (err) {
        setErrorRequests(err instanceof Error ? err.message : 'Failed to load open requests')
      } finally {
        setLoadingRequests(false)
      }
    }
    fetchOpenRequests()
  }, [])

  const filteredOffers = useMemo(() => {
    if (capFilter === 'All') return allOffers
    return allOffers.filter((o) => (o.capability || 'general') === capFilter)
  }, [allOffers, capFilter])

  const filteredRequests = useMemo(() => {
    if (capFilter === 'All') return openRequests
    return openRequests.filter((r) => (r.capability || 'general') === capFilter)
  }, [openRequests, capFilter])

  const offersTotalPages = Math.max(1, Math.ceil(filteredOffers.length / PAGE_SIZE))
  const requestsTotalPages = Math.max(1, Math.ceil(filteredRequests.length / PAGE_SIZE))

  const pagedOffers = filteredOffers.slice((offersPage - 1) * PAGE_SIZE, offersPage * PAGE_SIZE)
  const pagedRequests = filteredRequests.slice((requestsPage - 1) * PAGE_SIZE, requestsPage * PAGE_SIZE)

  return (
    <div className="px-4 lg:px-6 py-6 flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">{t("marketplace.title")}</h1>

      {/* Capability filter chips */}
      <CapabilityChips selected={capFilter} onSelect={setCapFilter} />

      <Tabs defaultValue="offers">
        <TabsList>
          <TabsTrigger value="offers">{t("marketplace.serviceOffers")}</TabsTrigger>
          <TabsTrigger value="requests">{t("marketplace.openRequests")}</TabsTrigger>
          {did && <TabsTrigger value="my">{t("marketplace.myOffers")}</TabsTrigger>}
        </TabsList>

        {/* ── Service Offers tab ── */}
        <TabsContent value="offers">
          {loadingAll && <p className="text-muted-foreground">{t("marketplace.loadingOffers")}</p>}
          {errorAll && <p className="text-destructive">{t("common.error")}: {errorAll}</p>}
          {!loadingAll && !errorAll && filteredOffers.length === 0 && (
            <p className="text-muted-foreground">{t("marketplace.noOffers")}</p>
          )}
          {!loadingAll && !errorAll && filteredOffers.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {pagedOffers.map((offer) => (
                  <Card key={offer.offerId}>
                    <CardHeader>
                      <CardTitle className="text-base">{offer.title || t("marketplace.untitledOffer")}</CardTitle>
                      <CardDescription>{offer.executorName || t("marketplace.unknownExecutor")}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{offer.capability || 'general'}</Badge>
                        <span className="text-sm font-medium">${(Number(offer.price) || 0).toFixed(2)} USDC</span>
                      </div>
                      {offer.executorDid && (
                        <p className="text-xs text-muted-foreground font-mono truncate" title={String(offer.executorDid)}>
                          {String(offer.executorDid).slice(0, 30)}...
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {offer.completedOrders ?? offer.orderCount ?? 0} {t("marketplace.ordersCompleted")}
                      </p>
                    </CardContent>
                    <CardFooter className="flex flex-col items-start gap-2">
                      <p className="text-xs text-muted-foreground">{t("marketplace.purchaseViaCli")}</p>
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono break-all select-all">
                        atel offer-buy {offer.offerId} &quot;your task description&quot;
                      </code>
                      {did && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {t("marketplace.orTellAgent")} &quot;帮我购买 {offer.offerId}&quot;
                        </p>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
              <Pagination page={offersPage} totalPages={offersTotalPages} onPageChange={setOffersPage} />
            </>
          )}
        </TabsContent>

        {/* ── Open Requests tab ── */}
        <TabsContent value="requests">
          {loadingRequests && <p className="text-muted-foreground">{t("marketplace.loadingOffers")}</p>}
          {errorRequests && <p className="text-destructive">{t("common.error")}: {errorRequests}</p>}
          {!loadingRequests && !errorRequests && filteredRequests.length === 0 && (
            <p className="text-muted-foreground">{t("marketplace.noRequests")}</p>
          )}
          {!loadingRequests && !errorRequests && filteredRequests.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {pagedRequests.map((req) => (
                  <Card key={req.orderId}>
                    <CardHeader>
                      <CardTitle className="text-base">
                        <Badge variant="secondary">{req.capability || 'general'}</Badge>
                      </CardTitle>
                      <CardDescription className="font-mono text-xs truncate" title={req.requesterDid || ''}>
                        {t("marketplace.requester")}: {req.requesterDid ? `${req.requesterDid.slice(0, 24)}...` : '—'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                      {req.description && (
                        <p className="text-sm line-clamp-3">{req.description}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">${(Number(req.price) || 0).toFixed(2)} USDC</span>
                      </div>
                      {req.createdAt && (
                        <p className="text-xs text-muted-foreground">
                          {t("marketplace.createdAt")}: {new Date(req.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </CardContent>
                    <CardFooter className="flex flex-col items-start gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono break-all select-all">
                        atel order-accept {req.orderId}
                      </code>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              <Pagination page={requestsPage} totalPages={requestsTotalPages} onPageChange={setRequestsPage} />
            </>
          )}
        </TabsContent>

        {/* ── My Offers tab ── */}
        <TabsContent value="my">
          {loadingMy && <p className="text-muted-foreground">{t("marketplace.loadingYourOffers")}</p>}
          {errorMy && <p className="text-destructive">{t("common.error")}: {errorMy}</p>}
          {!loadingMy && !errorMy && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("marketplace.offerId")}</TableHead>
                  <TableHead>{t("marketplace.title2")}</TableHead>
                  <TableHead>{t("marketplace.capability")}</TableHead>
                  <TableHead>{t("marketplace.price")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead>{t("orders.title")}</TableHead>
                  <TableHead>{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myOffers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      {t("marketplace.noMyOffers")}
                    </TableCell>
                  </TableRow>
                ) : (
                  myOffers.map((offer) => (
                    <TableRow key={offer.offerId}>
                      <TableCell className="font-mono text-xs">
                        {offer.offerId?.slice(0, 12)}...
                      </TableCell>
                      <TableCell>{offer.title || 'Untitled'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{offer.capability || 'general'}</Badge>
                      </TableCell>
                      <TableCell>${(Number(offer.price) || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={offer.status === 'active' ? 'default' : 'outline'}>
                          {offer.status || 'unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>{offer.completedOrders ?? offer.orderCount ?? 0}</TableCell>
                      <TableCell className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(`atel offer-update ${offer.offerId} --price NEW_PRICE`)}
                        >
                          {t("marketplace.copyEditCmd")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(`atel offer-close ${offer.offerId}`)}
                        >
                          {t("marketplace.copyCloseCmd")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function MarketplacePage() {
  const { t } = useI18n()
  return (
    <Suspense fallback={<div className="px-4 lg:px-6 py-6 text-muted-foreground">{t("common.loading")}</div>}>
      <MarketplaceContent />
    </Suspense>
  )
}

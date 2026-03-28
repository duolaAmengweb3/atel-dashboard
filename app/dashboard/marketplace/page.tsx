"use client"

import { Suspense, useEffect, useState } from 'react'
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

const API_BASE = 'https://api.atelai.org'

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

function MarketplaceContent() {
  const searchParams = useSearchParams()
  const did = getDID(searchParams)

  const [allOffers, setAllOffers] = useState<Offer[]>([])
  const [myOffers, setMyOffers] = useState<Offer[]>([])
  const [loadingAll, setLoadingAll] = useState(true)
  const [loadingMy, setLoadingMy] = useState(true)
  const [errorAll, setErrorAll] = useState<string | null>(null)
  const [errorMy, setErrorMy] = useState<string | null>(null)

  // Browse offers is public — always fetch
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

  // My Offers requires a DID
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

  return (
    <div className="px-4 lg:px-6 py-6 flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Marketplace</h1>

      <Tabs defaultValue="browse">
        <TabsList>
          <TabsTrigger value="browse">Browse Offers</TabsTrigger>
          {did && <TabsTrigger value="my">My Offers</TabsTrigger>}
        </TabsList>

        <TabsContent value="browse">
          {loadingAll && <p className="text-muted-foreground">Loading offers...</p>}
          {errorAll && <p className="text-destructive">Error: {errorAll}</p>}
          {!loadingAll && !errorAll && allOffers.length === 0 && (
            <p className="text-muted-foreground">No offers available yet.</p>
          )}
          {!loadingAll && !errorAll && allOffers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {allOffers.map((offer) => (
                <Card key={offer.offerId}>
                  <CardHeader>
                    <CardTitle className="text-base">{offer.title || 'Untitled Offer'}</CardTitle>
                    <CardDescription>{offer.executorName || 'Unknown executor'}</CardDescription>
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
                      {offer.completedOrders ?? offer.orderCount ?? 0} orders completed
                    </p>
                  </CardContent>
                  <CardFooter className="flex flex-col items-start gap-2">
                    <p className="text-xs text-muted-foreground">Purchase this service via CLI:</p>
                    <code className="text-xs bg-muted px-2 py-1 rounded font-mono break-all select-all">
                      atel offer-buy {offer.offerId} &quot;your task description&quot;
                    </code>
                    {did && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Or tell your Agent: &quot;帮我购买 {offer.offerId}&quot;
                      </p>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my">
          {loadingMy && <p className="text-muted-foreground">Loading your offers...</p>}
          {errorMy && <p className="text-destructive">Error: {errorMy}</p>}
          {!loadingMy && !errorMy && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Offer ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Capability</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myOffers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      You have no offers yet.
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
                          Copy Edit Cmd
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(`atel offer-close ${offer.offerId}`)}
                        >
                          Copy Close Cmd
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
  return (
    <Suspense fallback={<div className="px-4 lg:px-6 py-6 text-muted-foreground">Loading...</div>}>
      <MarketplaceContent />
    </Suspense>
  )
}

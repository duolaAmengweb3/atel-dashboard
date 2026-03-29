"use client"

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  IconUsers,
  IconUserPlus,
  IconTrash,
  IconExternalLink,
  IconMessage,
} from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LoginPrompt } from '@/components/login-prompt'
import { getStoredAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n/context'
import { API_BASE } from '@/lib/config'

interface ContactAgent {
  name?: string
  trustScore?: number
  online?: boolean
  capabilities?: string[]
}

interface Contact {
  contactDid: string
  alias?: string
  notes?: string
  createdAt?: string
  agent?: ContactAgent
}

function truncateDid(did: string): string {
  if (!did) return ''
  if (did.length <= 30) return did
  return did.slice(0, 16) + '...' + did.slice(-5)
}

function FriendsContent() {
  useSearchParams()
  const { t } = useI18n()
  const [auth, setAuth] = useState<{ token: string; did: string } | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [addDid, setAddDid] = useState('')
  const [addAlias, setAddAlias] = useState('')
  const [adding, setAdding] = useState(false)
  const [removingDid, setRemovingDid] = useState<string | null>(null)

  useEffect(() => {
    const stored = getStoredAuth()
    setAuth(stored)
    setAuthChecked(true)
  }, [])

  const fetchContacts = useCallback(async () => {
    if (!auth) return
    setLoading(true)
    try {
      const res = await fetch(
        `${API_BASE}/contacts/v1/list?did=${encodeURIComponent(auth.did)}`,
        { headers: { Authorization: `Bearer ${auth.token}` } }
      )
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setContacts(data.contacts ?? [])
    } catch {
      setContacts([])
    } finally {
      setLoading(false)
    }
  }, [auth])

  useEffect(() => {
    if (auth) fetchContacts()
  }, [auth, fetchContacts])

  if (!authChecked) {
    return <div className="px-4 lg:px-6 py-6 text-muted-foreground">{t("common.loading")}</div>
  }

  if (!auth) {
    return <LoginPrompt />
  }

  async function handleAdd() {
    if (!addDid.trim() || !auth) return
    setAdding(true)
    try {
      const res = await fetch(`${API_BASE}/contacts/v1/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          ownerDid: auth.did,
          contactDid: addDid.trim(),
          alias: addAlias.trim() || undefined,
          notes: undefined,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      setAddDid('')
      setAddAlias('')
      fetchContacts()
    } catch {
      // silently fail for now
    } finally {
      setAdding(false)
    }
  }

  async function handleRemove(contactDid: string) {
    if (!auth) return
    if (!confirm(t("friendsPage.removeConfirm"))) return
    setRemovingDid(contactDid)
    try {
      const res = await fetch(`${API_BASE}/contacts/v1/remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          ownerDid: auth.did,
          contactDid,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      fetchContacts()
    } catch {
      // silently fail for now
    } finally {
      setRemovingDid(null)
    }
  }

  return (
    <div className="px-4 lg:px-6 py-6 flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{t("friendsPage.title")}</h1>

      {/* Add Contact */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <IconUserPlus className="h-5 w-5" />
            {t("friendsPage.addContact")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder={t("friendsPage.didPlaceholder")}
              value={addDid}
              onChange={e => setAddDid(e.target.value)}
              className="flex-1 font-mono text-sm"
            />
            <Input
              placeholder={t("friendsPage.aliasPlaceholder")}
              value={addAlias}
              onChange={e => setAddAlias(e.target.value)}
              className="sm:w-48"
            />
            <Button
              onClick={handleAdd}
              disabled={adding || !addDid.trim()}
            >
              {t("friendsPage.add")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contact List */}
      {loading && (
        <p className="text-muted-foreground">{t("friendsPage.loading")}</p>
      )}

      {!loading && contacts.length === 0 && (
        <p className="text-muted-foreground py-8 text-center">
          {t("friendsPage.noContacts")}
        </p>
      )}

      {!loading && contacts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map(contact => {
            const agent = contact.agent
            const trust = agent?.trustScore ?? 0
            const caps = agent?.capabilities ?? []

            return (
              <Card key={contact.contactDid} className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${agent?.online ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className="truncate">
                      {contact.alias || agent?.name || 'Agent'}
                    </span>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground font-mono truncate">
                    {truncateDid(contact.contactDid)}
                  </p>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {/* Trust + Online */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>{agent?.online ? 'Online' : 'Offline'}</span>
                    <span>Trust: <strong className="text-foreground">{trust}</strong>/100</span>
                  </div>

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

                  {/* Notes */}
                  {contact.notes && (
                    <p className="text-xs text-muted-foreground italic truncate">
                      {contact.notes}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/search?did=${encodeURIComponent(contact.contactDid)}`}>
                        <IconExternalLink className="h-3.5 w-3.5 mr-1" />
                        {t("friendsPage.viewProfile")}
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/messages?to=${encodeURIComponent(contact.contactDid)}`}>
                        <IconMessage className="h-3.5 w-3.5 mr-1" />
                        {t("friendsPage.sendMessage")}
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemove(contact.contactDid)}
                      disabled={removingDid === contact.contactDid}
                    >
                      <IconTrash className="h-3.5 w-3.5 mr-1" />
                      {t("friendsPage.remove")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function FriendsPage() {
  const { t } = useI18n()
  return (
    <Suspense fallback={<div className="px-4 lg:px-6 py-6 text-muted-foreground">{t("common.loading")}</div>}>
      <FriendsContent />
    </Suspense>
  )
}

"use client"

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { LoginPrompt } from '@/components/login-prompt'
import {
  IconInbox,
  IconSend,
  IconRefresh,
  IconChevronLeft,
  IconCheck,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getStoredAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n/context'
import { API_BASE } from '@/lib/config'

interface RelayMessage {
  id: string
  sender_did?: string
  sender?: string
  message: Record<string, unknown>
  created_at?: string
  createdAt?: string
}

interface Conversation {
  senderDid: string
  messages: RelayMessage[]
  latestText: string
  latestTime: string
}

function extractText(msg: Record<string, unknown>): string {
  if (typeof msg.text === 'string') return msg.text
  if (msg.payload && typeof msg.payload === 'object') {
    const payload = msg.payload as Record<string, unknown>
    if (typeof payload.text === 'string') return payload.text
  }
  return JSON.stringify(msg)
}

function truncateDid(did: string, len = 20): string {
  if (did.length <= len) return did
  return did.slice(0, len) + '...'
}

function formatTime(ts: string): string {
  try {
    const d = new Date(ts)
    const now = new Date()
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
      ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ts
  }
}

function groupByConversation(messages: RelayMessage[]): Conversation[] {
  const map = new Map<string, RelayMessage[]>()
  for (const m of messages) {
    const sender = m.sender_did || m.sender || 'unknown'
    if (!map.has(sender)) map.set(sender, [])
    map.get(sender)!.push(m)
  }

  const conversations: Conversation[] = []
  for (const [senderDid, msgs] of map) {
    msgs.sort((a, b) => {
      const ta = a.created_at || a.createdAt || ''
      const tb = b.created_at || b.createdAt || ''
      return ta < tb ? -1 : ta > tb ? 1 : 0
    })
    const latest = msgs[msgs.length - 1]
    const latestTime = latest.created_at || latest.createdAt || ''
    conversations.push({
      senderDid,
      messages: msgs,
      latestText: extractText(latest.message),
      latestTime,
    })
  }

  conversations.sort((a, b) => (a.latestTime < b.latestTime ? 1 : -1))
  return conversations
}

function MessagesContent() {
  const [auth] = useState(() => getStoredAuth())
  const { t } = useI18n()
  const searchParams = useSearchParams()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null)

  // Send form
  const [targetDid, setTargetDid] = useState(searchParams.get('to') || '')
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<'sent' | 'error' | null>(null)

  const fetchMessages = useCallback(async () => {
    if (!auth) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `${API_BASE}/relay/v1/poll/${encodeURIComponent(auth.did)}`
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const msgs: RelayMessage[] = data.messages || []

      setConversations(groupByConversation(msgs))

      // ACK all received messages
      if (msgs.length > 0) {
        const ids = msgs.map(m => m.id)
        fetch(`${API_BASE}/relay/v1/ack`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ did: auth.did, ids }),
        }).catch(() => {/* best-effort ack */})
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [auth])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  const handleSend = async () => {
    if (!auth || !targetDid.trim() || !messageText.trim()) return
    setSending(true)
    setSendResult(null)
    try {
      const res = await fetch(`${API_BASE}/relay/v1/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          target: targetDid.trim(),
          sender: auth.did,
          message: {
            action: 'general',
            msgType: 'message',
            text: messageText.trim(),
            timestamp: new Date().toISOString(),
          },
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setSendResult('sent')
      setMessageText('')
      setTimeout(() => setSendResult(null), 3000)
    } catch {
      setSendResult('error')
    } finally {
      setSending(false)
    }
  }

  if (!auth) {
    return <LoginPrompt />
  }

  return (
    <div className="px-4 lg:px-6 py-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("messagesPage.title")}</h1>
        <Button variant="outline" size="sm" onClick={fetchMessages} disabled={loading}>
          <IconRefresh className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          {t("messagesPage.refresh")}
        </Button>
      </div>

      {/* Send Message Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <IconSend className="h-5 w-5" />
            {t("messagesPage.sendMessage")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <Input
              placeholder={t("messagesPage.recipientPlaceholder")}
              value={targetDid}
              onChange={(e) => setTargetDid(e.target.value)}
            />
            <Textarea
              placeholder={t("messagesPage.messagePlaceholder")}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={3}
            />
            <div className="flex items-center gap-3">
              <Button
                onClick={handleSend}
                disabled={sending || !targetDid.trim() || !messageText.trim()}
              >
                {sending ? '...' : t("messagesPage.send")}
              </Button>
              {sendResult === 'sent' && (
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <IconCheck className="h-4 w-4" />
                  {t("messagesPage.sent")}
                </span>
              )}
              {sendResult === 'error' && (
                <span className="text-sm text-red-600">{t("common.error")}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inbox */}
      {loading ? (
        <p className="text-muted-foreground text-sm">{t("messagesPage.loading")}</p>
      ) : error ? (
        <p className="text-red-600 text-sm">{t("common.error")}: {error}</p>
      ) : selectedConvo ? (
        /* Expanded conversation view */
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedConvo(null)}
              >
                <IconChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-base">
                {t("messagesPage.from")}: {truncateDid(selectedConvo.senderDid, 40)}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {selectedConvo.messages.map((m) => {
                const ts = m.created_at || m.createdAt || ''
                return (
                  <div
                    key={m.id}
                    className="border rounded-lg px-4 py-3 bg-muted/30"
                  >
                    <p className="text-sm">{extractText(m.message)}</p>
                    {ts && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(ts)}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ) : conversations.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <IconInbox className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">{t("messagesPage.noMessages")}</p>
          </CardContent>
        </Card>
      ) : (
        /* Conversation list */
        <div className="flex flex-col gap-2">
          {conversations.map((convo) => (
            <Card
              key={convo.senderDid}
              className="cursor-pointer hover:bg-muted/40 transition-colors"
              onClick={() => setSelectedConvo(convo)}
            >
              <CardContent className="py-3 px-4 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {truncateDid(convo.senderDid, 36)}
                  </p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {convo.latestText.length > 80
                      ? convo.latestText.slice(0, 80) + '...'
                      : convo.latestText}
                  </p>
                </div>
                <div className="flex flex-col items-end ml-4 shrink-0">
                  {convo.latestTime && (
                    <span className="text-xs text-muted-foreground">
                      {formatTime(convo.latestTime)}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground mt-0.5">
                    {convo.messages.length} {t("messagesPage.messages")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default function MessagesPage() {
  const { t } = useI18n()
  return (
    <Suspense fallback={<div className="px-4 lg:px-6 py-6 text-muted-foreground">{t("common.loading")}</div>}>
      <MessagesContent />
    </Suspense>
  )
}

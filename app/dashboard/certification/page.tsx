"use client"

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { IconCertificate, IconShieldCheck, IconBuilding } from '@tabler/icons-react'
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
import { useI18n } from '@/lib/i18n/context'

import { API_BASE } from '@/lib/config'

interface CertStatus {
  level: string
  status: string
  grantedBy?: string
  expires?: string
  trustScore?: number
}

interface CertRequirements {
  certified?: { trustScore: number; fee: string }
  enterprise?: { trustScore: number; fee: string }
}

function CodeBlock({ children }: { children: string }) {
  return (
    <code className="block bg-muted px-3 py-2 rounded-md text-sm font-mono mt-2">
      {children}
    </code>
  )
}

function CertificationContent() {
  const searchParams = useSearchParams()
  const did = getDID(searchParams)
  const { t } = useI18n()

  const [certStatus, setCertStatus] = useState<CertStatus | null>(null)
  const [requirements, setRequirements] = useState<CertRequirements | null>(null)
  const [trustScore, setTrustScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const fetches: Promise<Response>[] = [
          fetch(`${API_BASE}/cert/v1/requirements`),
        ]
        if (did) {
          fetches.push(
            fetch(`${API_BASE}/cert/v1/status/${encodeURIComponent(did)}`),
            fetch(`${API_BASE}/registry/v1/agent/${encodeURIComponent(did)}`),
          )
        }
        const results = await Promise.allSettled(fetches)
        const reqRes = results[0]

        if (reqRes.status === 'fulfilled' && reqRes.value.ok) {
          const data = await reqRes.value.json()
          setRequirements(data)
        }

        if (did) {
          const certRes = results[1]
          const agentRes = results[2]

          if (certRes.status === 'fulfilled' && certRes.value.ok) {
            const data = await certRes.value.json()
            setCertStatus(data)
          }

          if (agentRes.status === 'fulfilled' && agentRes.value.ok) {
            const agent = await agentRes.value.json()
            setTrustScore(agent.trustScore ?? agent.trust_score ?? 0)
          }
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
        <p className="text-muted-foreground">{t("certPage.loadingCert")}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 lg:px-6 py-6">
        <p className="text-destructive">{t("common.error")}: {error}</p>
      </div>
    )
  }

  const isActive = certStatus?.status === 'active'
  const hasCert = certStatus && certStatus.status !== 'none' && certStatus.level

  return (
    <div className="px-4 lg:px-6 py-6 flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{t("certPage.title")}</h1>

      {!did && (
        <p className="text-muted-foreground">
          {t("certPage.viewingPublic")}{' '}
          <code className="bg-muted px-1 rounded">?did=did:atel:...</code>{' '}
          {t("certPage.toUrlOr")}{' '}
          <a href="/login" className="text-primary underline underline-offset-4">{t("common.logIn")}</a>.
        </p>
      )}

      {did && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconCertificate className="h-5 w-5" />
            {t("certPage.currentStatus")}
          </CardTitle>
          <CardDescription>{t("certPage.certStatusDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          {hasCert ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{t("agent.level")}:</span>
                <Badge variant={isActive ? 'default' : 'secondary'} className="capitalize">
                  {certStatus.level}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{t("common.status")}:</span>
                <Badge variant={isActive ? 'default' : 'outline'} className="capitalize">
                  {certStatus.status}
                </Badge>
              </div>
              {certStatus.grantedBy && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{t("certPage.grantedBy")}</span>
                  <span className="text-sm font-mono">{certStatus.grantedBy}</span>
                </div>
              )}
              {certStatus.expires && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{t("certPage.expires")}</span>
                  <span className="text-sm">{new Date(certStatus.expires).toLocaleDateString()}</span>
                </div>
              )}
              <div className="pt-2">
                <p className="text-sm text-muted-foreground mb-2">{t("certPage.renewViaCli")}</p>
                <CodeBlock>{`atel cert-renew ${certStatus.level}`}</CodeBlock>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-muted-foreground">{t("certPage.notCertified")}</p>
              <div className="pt-2">
                <p className="text-sm text-muted-foreground mb-2">{t("certPage.applyViaCli")}</p>
                <CodeBlock>atel cert-apply certified</CodeBlock>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      )}

      {did && (
      <Card>
        <CardHeader>
          <CardTitle>{t("trustPage.trustScore")}</CardTitle>
          <CardDescription>{t("certPage.trustScoreEligibility")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold tabular-nums">{trustScore.toFixed(2)}</div>
        </CardContent>
      </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconShieldCheck className="h-5 w-5 text-green-500" />
              {t("certPage.certified")}
            </CardTitle>
            <CardDescription>{t("certPage.certifiedDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{t("certPage.trustScoreRequired")}</span>
                <span className="font-semibold">
                  {requirements?.certified?.trustScore ?? 65}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{t("certPage.annualFee")}</span>
                <span className="font-semibold">
                  {requirements?.certified?.fee ?? '$50/yr'}
                </span>
              </div>
              {did && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{t("certPage.yourScore")}</span>
                <Badge variant={trustScore >= (requirements?.certified?.trustScore ?? 65) ? 'default' : 'destructive'}>
                  {trustScore.toFixed(2)}
                </Badge>
              </div>
              )}
              {did && !hasCert && (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={trustScore < (requirements?.certified?.trustScore ?? 65)}
                    onClick={() => navigator.clipboard.writeText('atel cert-apply certified')}
                  >
                    {t("certPage.copyApplyCommand")}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconBuilding className="h-5 w-5 text-blue-500" />
              {t("certPage.enterprise")}
            </CardTitle>
            <CardDescription>{t("certPage.enterpriseDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{t("certPage.trustScoreRequired")}</span>
                <span className="font-semibold">
                  {requirements?.enterprise?.trustScore ?? 80}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{t("certPage.annualFee")}</span>
                <span className="font-semibold">
                  {requirements?.enterprise?.fee ?? '$500/yr'}
                </span>
              </div>
              {did && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{t("certPage.yourScore")}</span>
                <Badge variant={trustScore >= (requirements?.enterprise?.trustScore ?? 80) ? 'default' : 'destructive'}>
                  {trustScore.toFixed(2)}
                </Badge>
              </div>
              )}
              {did && !hasCert && (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={trustScore < (requirements?.enterprise?.trustScore ?? 80)}
                    onClick={() => navigator.clipboard.writeText('atel cert-apply enterprise')}
                  >
                    {t("certPage.copyApplyCommand")}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function CertificationPage() {
  const { t } = useI18n()
  return (
    <Suspense fallback={<div className="px-4 lg:px-6 py-6 text-muted-foreground">{t("common.loading")}</div>}>
      <CertificationContent />
    </Suspense>
  )
}

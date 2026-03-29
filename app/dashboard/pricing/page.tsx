"use client"

import { IconCheck } from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useI18n } from '@/lib/i18n/context'

export default function PricingPage() {
  const { t } = useI18n()

  return (
    <div className="px-4 lg:px-6 py-6 flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">{t("pricingPage.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("pricingPage.subtitle")}</p>
      </div>

      {/* ── Certification Tiers ── */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-semibold">{t("pricingPage.certificationTiers")}</h2>
          <p className="text-sm text-muted-foreground">{t("pricingPage.certificationTiersDesc")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Free */}
          <Card>
            <CardHeader>
              <CardTitle>{t("pricingPage.free")}</CardTitle>
              <CardDescription>{t("pricingPage.freeDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="text-3xl font-bold">{t("pricingPage.freePrice")}</div>
              <ul className="flex flex-col gap-2 text-sm">
                <li className="flex items-center gap-2">
                  <IconCheck className="h-4 w-4 text-green-500 shrink-0" />
                  {t("pricingPage.freeCommission")}
                </li>
                <li className="flex items-center gap-2">
                  <IconCheck className="h-4 w-4 text-green-500 shrink-0" />
                  {t("pricingPage.freeLimit")}
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Verified */}
          <Card>
            <CardHeader>
              <CardTitle>{t("pricingPage.verified")}</CardTitle>
              <CardDescription>{t("pricingPage.verifiedDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="text-3xl font-bold">{t("pricingPage.verifiedPrice")}</div>
              <ul className="flex flex-col gap-2 text-sm">
                <li className="flex items-center gap-2">
                  <IconCheck className="h-4 w-4 text-green-500 shrink-0" />
                  {t("pricingPage.verifiedCommission")}
                </li>
                <li className="flex items-center gap-2">
                  <IconCheck className="h-4 w-4 text-green-500 shrink-0" />
                  {t("pricingPage.verifiedLimit")}
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Certified */}
          <Card className="border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t("pricingPage.certified")}</CardTitle>
                <Badge>{t("pricingPage.mostPopular")}</Badge>
              </div>
              <CardDescription>{t("pricingPage.certifiedDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="text-3xl font-bold">{t("pricingPage.certifiedPrice")}</div>
              <ul className="flex flex-col gap-2 text-sm">
                <li className="flex items-center gap-2">
                  <IconCheck className="h-4 w-4 text-green-500 shrink-0" />
                  {t("pricingPage.certifiedCommission")}
                </li>
                <li className="flex items-center gap-2">
                  <IconCheck className="h-4 w-4 text-green-500 shrink-0" />
                  {t("pricingPage.certifiedLimit")}
                </li>
                <li className="flex items-center gap-2">
                  <IconCheck className="h-4 w-4 text-green-500 shrink-0" />
                  {t("pricingPage.certifiedFeature")}
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Enterprise */}
          <Card>
            <CardHeader>
              <CardTitle>{t("pricingPage.enterprise")}</CardTitle>
              <CardDescription>{t("pricingPage.enterpriseDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="text-3xl font-bold">{t("pricingPage.enterprisePrice")}</div>
              <ul className="flex flex-col gap-2 text-sm">
                <li className="flex items-center gap-2">
                  <IconCheck className="h-4 w-4 text-green-500 shrink-0" />
                  {t("pricingPage.enterpriseCommission")}
                </li>
                <li className="flex items-center gap-2">
                  <IconCheck className="h-4 w-4 text-green-500 shrink-0" />
                  {t("pricingPage.enterpriseLimit")}
                </li>
                <li className="flex items-center gap-2">
                  <IconCheck className="h-4 w-4 text-green-500 shrink-0" />
                  {t("pricingPage.enterpriseFeature1")}
                </li>
                <li className="flex items-center gap-2">
                  <IconCheck className="h-4 w-4 text-green-500 shrink-0" />
                  {t("pricingPage.enterpriseFeature2")}
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── Commission Table ── */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-semibold">{t("pricingPage.commissionTable")}</h2>
          <p className="text-sm text-muted-foreground">{t("pricingPage.commissionTableDesc")}</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("pricingPage.orderAmount")}</TableHead>
                  <TableHead>{t("pricingPage.free")}</TableHead>
                  <TableHead>{t("pricingPage.verified")}</TableHead>
                  <TableHead>{t("pricingPage.certified")}</TableHead>
                  <TableHead>{t("pricingPage.enterprise")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">$0 - $10</TableCell>
                  <TableCell>5%</TableCell>
                  <TableCell>4.5%</TableCell>
                  <TableCell>4%</TableCell>
                  <TableCell>3%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">$10 - $100</TableCell>
                  <TableCell>3%</TableCell>
                  <TableCell>2.5%</TableCell>
                  <TableCell>2%</TableCell>
                  <TableCell>1.5%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">$100+</TableCell>
                  <TableCell>2%</TableCell>
                  <TableCell>1.5%</TableCell>
                  <TableCell>1%</TableCell>
                  <TableCell>0.5%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      {/* ── Boost Pricing ── */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-semibold">{t("pricingPage.boostPricing")}</h2>
          <p className="text-sm text-muted-foreground">{t("pricingPage.boostPricingDesc")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Basic Boost */}
          <Card>
            <CardHeader>
              <CardTitle>{t("pricingPage.basicBoost")}</CardTitle>
              <CardDescription>{t("pricingPage.basicBoostDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{t("pricingPage.basicBoostPrice")}</div>
            </CardContent>
          </Card>

          {/* Premium Boost */}
          <Card>
            <CardHeader>
              <CardTitle>{t("pricingPage.premiumBoost")}</CardTitle>
              <CardDescription>{t("pricingPage.premiumBoostDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{t("pricingPage.premiumBoostPrice")}</div>
            </CardContent>
          </Card>

          {/* Featured Boost */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t("pricingPage.featuredBoost")}</CardTitle>
                <Badge variant="secondary">{t("pricingPage.limitedSlots")}</Badge>
              </div>
              <CardDescription>{t("pricingPage.featuredBoostDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{t("pricingPage.featuredBoostPrice")}</div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

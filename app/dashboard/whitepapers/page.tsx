"use client"

import {
  IconFileText,
  IconCode,
  IconBriefcase,
  IconExternalLink,
  IconDownload,
  IconBrandGithub,
  IconBrandNpm,
  IconBook,
  IconMail,
} from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n/context'

export default function WhitepapersPage() {
  const { t } = useI18n()

  return (
    <div className="px-4 lg:px-6 py-6 flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{t("whitepapersPage.title")}</h1>
      <p className="text-muted-foreground">{t("whitepapersPage.subtitle")}</p>

      {/* Protocol Specification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconFileText className="h-5 w-5" />
            {t("whitepapersPage.protocolSpec")}
          </CardTitle>
          <CardDescription>
            {t("whitepapersPage.protocolSpecDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <a href="/docs" target="_blank" rel="noopener noreferrer">
              <IconExternalLink className="h-4 w-4 mr-2" />
              {t("whitepapersPage.viewDocs")}
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/SKILL.md" download>
              <IconDownload className="h-4 w-4 mr-2" />
              {t("whitepapersPage.downloadSkill")}
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Technical Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconCode className="h-5 w-5" />
            {t("whitepapersPage.technicalResources")}
          </CardTitle>
          <CardDescription>
            {t("whitepapersPage.technicalResourcesDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <a
              href="https://github.com/LawrenceLiang-BTC/atel-sdk"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm hover:underline underline-offset-4"
            >
              <IconBrandGithub className="h-4 w-4" />
              {t("whitepapersPage.github")}
              <IconExternalLink className="h-3 w-3 text-muted-foreground" />
            </a>
            <a
              href="https://www.npmjs.com/package/@lawrenceliang-btc/atel-sdk"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm hover:underline underline-offset-4"
            >
              <IconBrandNpm className="h-4 w-4" />
              {t("whitepapersPage.npm")}
              <IconExternalLink className="h-3 w-3 text-muted-foreground" />
            </a>
            <a
              href="/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm hover:underline underline-offset-4"
            >
              <IconBook className="h-4 w-4" />
              {t("whitepapersPage.apiDocs")}
              <IconExternalLink className="h-3 w-3 text-muted-foreground" />
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Commercial Whitepapers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconBriefcase className="h-5 w-5" />
            {t("whitepapersPage.commercialWhitepapers")}
            <Badge variant="secondary">{t("common.comingSoon")}</Badge>
          </CardTitle>
          <CardDescription>
            {t("whitepapersPage.commercialDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <IconMail className="h-4 w-4" />
            {t("whitepapersPage.contact")}:{' '}
            <a
              href="mailto:contact@atelai.org"
              className="text-primary hover:underline underline-offset-4"
            >
              contact@atelai.org
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

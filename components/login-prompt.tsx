"use client"

import { useI18n } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DidSearch } from "@/components/did-search"

export function LoginPrompt() {
  const { t } = useI18n()

  return (
    <div className="px-4 lg:px-6 py-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">{t("loginPrompt.title")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <p className="text-muted-foreground text-center text-sm">
            {t("loginPrompt.desc")}
          </p>

          <Button asChild size="lg" className="rounded-full px-8">
            <a href="/login">{t("loginPrompt.connectBtn")}</a>
          </Button>

          <div className="w-full border-t pt-4">
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-3 items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">1</span>
                <p>{t("loginPrompt.step1")}</p>
              </div>
              <div className="flex gap-3 items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">2</span>
                <p>{t("loginPrompt.step2")}</p>
              </div>
              <div className="flex gap-3 items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">3</span>
                <p>{t("loginPrompt.step3")}</p>
              </div>
            </div>
          </div>

          <div className="w-full border-t pt-4">
            <DidSearch />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useI18n } from '@/lib/i18n/context'

export function SiteHeader() {
  const { lang, setLang, t } = useI18n()

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{t("header.title")}</h1>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setLang(lang === "en" ? "zh" : "en")}
            className="px-2 py-1 text-xs font-medium rounded border border-input bg-background hover:bg-accent transition-colors"
          >
            {lang === "en" ? "中文" : "EN"}
          </button>
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <a href="/docs" className="dark:text-foreground">
              {t("header.docs")}
            </a>
          </Button>
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <a href="/" className="dark:text-foreground">
              {t("header.home")}
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}

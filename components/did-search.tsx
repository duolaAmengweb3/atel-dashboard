"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n/context"

export function DidSearch() {
  const [value, setValue] = useState("")
  const router = useRouter()
  const { t } = useI18n()

  function handleSearch() {
    const did = value.trim()
    if (!did) return
    router.push(`/dashboard/search?did=${encodeURIComponent(did)}`)
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">{t("didSearch.hint")}</p>
      <div className="flex gap-2">
        <Input
          placeholder="did:atel:ed25519:..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="font-mono text-sm"
        />
        <Button onClick={handleSearch} variant="outline" size="sm" className="shrink-0">
          {t("didSearch.search")}
        </Button>
      </div>
    </div>
  )
}

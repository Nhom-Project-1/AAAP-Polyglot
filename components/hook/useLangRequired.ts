"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

export interface Lang {
  id: string
  label: string
  code: string
}

export function useLangRequired(): Lang | null {
  const router = useRouter()
  const pathname = usePathname()
  const [lang, setLang] = useState<Lang | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem("selectedLang")

    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (
          parsed &&
          typeof parsed.id === "string" &&
          typeof parsed.label === "string" &&
          typeof parsed.code === "string"
        ) {
          setLang(parsed)
        }
      } catch {
        setLang(null)
      }
    } else {
      if (
        pathname.startsWith("/course") ||
        pathname.startsWith("/ranking") ||
        pathname.startsWith("/goal")
      ) {
        if (pathname !== "/course/choose") {
          router.replace("/course/choose")
        }
      }
    }
  }, [router, pathname])

  return lang
}

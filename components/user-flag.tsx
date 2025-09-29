'use client'
import React, { useEffect, useState } from 'react'
import ReactCountryFlag from 'react-country-flag'

export interface Lang {
  id: string
  label: string
  code: string
}

export default function UserFlag() {
  const [lang, setLang] = useState<Lang | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem("selectedLang")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed &&typeof parsed.id === "string" && typeof parsed.label === "string" && typeof parsed.code === "string") {
          setLang(parsed)
        } else setLang(null)
      } catch {
        setLang(null) 
      }
    }
  }, [])

  const flagStyle = { width: "1.5em", height: "1.5em", borderRadius: "2px" }

  if (!lang) {
    return (
      <div className="relative inline-block w-8 h-6 bg-white border border-gray-400">       
        <span className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-xs font-bold text-red-500">?</span>
      </div>
    )
  }

  return (
  <div className="flex items-center gap-2">
    <div className="w-10 h-7 rounded-lg overflow-hidden ">
      <ReactCountryFlag
        countryCode={lang.code}
        svg
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  </div>
)

}

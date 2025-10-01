'use client'
import React from 'react'
import ReactCountryFlag from 'react-country-flag'
import { useLangRequired } from "@/components/hook/useLangRequired"

export default function UserFlag() {
  const lang = useLangRequired()
  if (!lang) return null

  return (
    <div className="flex items-center gap-2">
      <div className="w-10 h-7 rounded-lg overflow-hidden">
        <ReactCountryFlag
          countryCode={lang.code}
          svg
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </div>
  )
}
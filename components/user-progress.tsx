"use client"

import React, { useEffect, useState } from "react"
import ReactCountryFlag from "react-country-flag"
import { useRouter } from "next/navigation"

type Lang = {
  id: string
  label: string
  code: string
}

export default function UserProgress() {
  const router = useRouter()
  const [lang, setLang] = useState<Lang | null>(null)
  const score = 36
  const streak = 36

  useEffect(() => {
    const savedLang = localStorage.getItem("selectedLang")
    if (savedLang) {
      try {
        setLang(JSON.parse(savedLang))
      } catch {
        console.error("Không có ngôn ngữ được lưu")
      }
    }
  }, [])

  if (!lang) return null

  return (
    <div className="flex items-center gap-10 p-3 rounded-xl">
      {/* Cờ */}
      <div
        className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
        onClick={() => router.push("/course/choose")}
      >
        <div className="w-10 h-7 rounded-lg overflow-hidden">
          <ReactCountryFlag
            countryCode={lang.code}
            svg
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </div>

      {/* Điểm */}
      <div className="flex items-center gap-1">
        <img src="/star.png" alt="Score" className="w-6 h-7 object-contain" />
        <span className="text-lg font-semibold text-yellow-400 leading-none">
          {score}
        </span>
      </div>

      {/* Chuỗi */}
      <div className="flex items-center gap-1">
        <img src="/fire.png" alt="Streak" className="w-6 h-5 object-contain" />
        <span className="text-lg font-semibold text-orange-300 leading-none">
          {streak}
        </span>
      </div>
    </div>
  )
}
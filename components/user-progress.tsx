"use client"

import React, { useEffect, useState } from "react"
import ReactCountryFlag from "react-country-flag"
import { useRouter } from "next/navigation"

type Lang = {
  id: string
  label: string
  code: string
}

type TienDo = {
  ma_bai_hoc: number
  diem_kinh_nghiem: number
}

export default function UserProgress() {
  const router = useRouter()
  const [lang, setLang] = useState<Lang | null>(null)
  const [tongXP, setTongXP] = useState(0)

  const mockTienDo: TienDo[] = [
    { ma_bai_hoc: 1, diem_kinh_nghiem: 9 },
    { ma_bai_hoc: 2, diem_kinh_nghiem: 10 },
    { ma_bai_hoc: 3, diem_kinh_nghiem: 12 },
    { ma_bai_hoc: 4, diem_kinh_nghiem: 5 },
  ]

  useEffect(() => {
    const savedLang = localStorage.getItem("selectedLang")
    if (savedLang) {
      try {
        setLang(JSON.parse(savedLang))
      } catch {
        console.error("Không có ngôn ngữ được lưu")
      }
    }

    const tong = mockTienDo.reduce((sum, item) => sum + item.diem_kinh_nghiem, 0)
    setTongXP(tong)
    localStorage.setItem("userXP", tong.toString())
  }, [])

  if (!lang) return null

  return (
    <div className="flex items-center gap-10 p-3 rounded-xl">
      {/* cờ ngôn ngữ */}
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

      {/* tổng XP người dùng */}
      <div className="flex items-center gap-1">
        <img src="/star.png" alt="Score" className="w-6 h-7 object-contain" />
        <span className="text-lg font-semibold text-yellow-400 leading-none">
          {tongXP}
        </span>
      </div>
    </div>
  )
}
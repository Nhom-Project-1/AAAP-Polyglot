"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface FooterProps {
  maNguoiDung: number
  maBaiHoc: number
  maThuThach: number
  luaChonDaChon: number | null
  hearts: number
  onUpdateHearts: (newHearts: number) => void
  onComplete?: (xpThisRound: number) => void
  onContinue: () => void
  resetKey?: number
  isOutOfHearts?: boolean 
}

function extractXP(message: string): number | null {
  const match = message.match(/→ \+(\d+) XP/)
  if (match && match[1]) return parseInt(match[1], 10)
  return null
}

export default function Footer({
  maNguoiDung,
  maBaiHoc,
  maThuThach,
  luaChonDaChon,
  hearts,
  isOutOfHearts,
  onUpdateHearts,
  onComplete,
  onContinue,
  resetKey,
}: FooterProps) {
  const [checked, setChecked] = useState(false)
  const [result, setResult] = useState<boolean | null>(null)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setChecked(false)
    setResult(null)
    setMessage("")
    setLoading(false)
  }, [resetKey])

  const handleCheck = async () => {
    if (!luaChonDaChon || loading || hearts <= 0) return
    setLoading(true)
    try {
      const res = await fetch("/api/challenge/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ma_nguoi_dung: maNguoiDung,
          ma_bai_hoc: maBaiHoc,
          ma_thu_thach: maThuThach,
          ma_lua_chon: luaChonDaChon,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Lỗi khi nộp đáp án")

      setChecked(true)
      setResult(data.correct)
      setMessage(data.message || "")

      if (data.so_tim_con_lai !== undefined) {
        if (data.so_tim_con_lai === 0) {
          onUpdateHearts(0)
        } else {
          onUpdateHearts(data.so_tim_con_lai)
        }
      }

      if (data.message) {
        const xpThisRound = extractXP(data.message)
        if (xpThisRound !== null) onComplete?.(xpThisRound)
      }

    } catch (err: any) {
      setMessage(err.message || "Không thể gửi đáp án")
    } finally {
      setLoading(false)
    }
  }

  let footerColor = "bg-white"
  let continueButtonColor = ""
  let messageColor = ""

  if (result === true) {
    footerColor = "bg-green-100"
    continueButtonColor = "bg-green-500 hover:bg-green-600 text-white"
    messageColor = "text-green-700 font-semibold"
  } else if (result === false) {
    footerColor = "bg-red-100"
    continueButtonColor = "bg-red-500 hover:bg-red-600 text-white"
    messageColor = "text-red-700 font-semibold"
  }

  return (
    <footer className={`relative flex justify-end px-6 py-7 border-t border-gray-200 transition-colors duration-300 ${footerColor}`}>
      {checked && (
        <p className={`absolute left-20 bottom-10 text-lg ${messageColor} transition-all duration-300`}>
          {message}
        </p>
      )}

      {!checked ? (
        <Button
          disabled={!luaChonDaChon || loading}
          onClick={handleCheck}
          className={`px-8 py-6 text-lg rounded-lg mr-60 border-0 transition-all duration-200 ${
            luaChonDaChon ? "bg-pink-500 hover:bg-pink-600 text-white" : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          {loading ? "Đang kiểm tra..." : "Kiểm tra"}
        </Button>
      ) : (
        <Button
          className={`px-8 py-6 text-lg rounded-lg mr-60 cursor-pointer transition-all duration-200 border-0 ${continueButtonColor}`}
          disabled={isOutOfHearts}
          onClick={() => {
            if (isOutOfHearts) return
            setChecked(false)
            setResult(null)
            setMessage("")
            onContinue()
          }}
        >
          Tiếp tục
        </Button>
      )}
    </footer>
  )
}
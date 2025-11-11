"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface FooterProps {
  maNguoiDung: number
  maBaiHoc: number
  maThuThach: number
  luaChonDaChon: number | null
  correctChoiceId: number | undefined
  hearts: number
  onUpdateHearts: (newHearts: number) => void
  onContinue: () => void
  resetKey?: number
  isOutOfHearts?: boolean 
  onShowResult?: (show: boolean) => void
  isLastQuestion?: boolean
  onFinalMessage?: (msg: string) => void
  isChecking: boolean
  onCheckingChange: (checking: boolean) => void
}

export default function Footer({
  maNguoiDung,
  maBaiHoc,
  maThuThach,
  luaChonDaChon,
  correctChoiceId,
  hearts,
  isOutOfHearts,
  onUpdateHearts,
  onContinue,
  resetKey,
  onShowResult,
  isLastQuestion,
  onFinalMessage,
  isChecking,
  onCheckingChange,
}: FooterProps) {
  const [checked, setChecked] = useState(false)
  const [result, setResult] = useState<boolean | null>(null)
  const [message, setMessage] = useState("")
  useEffect(() => {
    setChecked(false)
    setResult(null)
    setMessage("")
    onCheckingChange(false)
    // notify parent to hide result highlights when footer is reset
    onShowResult?.(false)
  }, [resetKey])

  const handleCheck = async () => {
    if (!luaChonDaChon || isChecking || hearts <= 0 || !correctChoiceId) return

    // --- Optimistic UI Update ---
    // 1. Giả định kết quả và cập nhật giao diện ngay lập tức
    const isCorrect = luaChonDaChon === correctChoiceId
    setChecked(true)
    setResult(isCorrect)
    onShowResult?.(true)
    if (isCorrect) {
      if (isLastQuestion) {
        setMessage("Chính xác!")
      } else {
        setMessage("Chính xác! Hãy cố gắng ở câu tiếp theo nhé.")
      }
    } else {
      if (hearts > 1) {
        setMessage("Sai mất rồi. Bạn bị -1 tim.")
      } else {
        setMessage("Sai mất rồi. Bạn đã hết tim!")
      }
      // Giả định trừ tim ở UI
      onUpdateHearts(Math.max(hearts - 1, 0))
    }
    // -----------------------------

    // 2. Gửi yêu cầu lên server ở chế độ nền
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

      // Cập nhật lại message và các thông tin khác từ server nếu cần
      // (Trong trường hợp này, message giả định đã đủ tốt)
      if (data.message && data.message !== message) {
        setMessage(data.message)
      }
      
      // Luôn cập nhật summary message nếu API trả về
      if (data.summaryMessage) {
        onFinalMessage?.(String(data.summaryMessage))
      }

      // Nếu đây là câu hỏi cuối và đã hoàn thành, gọi onContinue để hiển thị modal chúc mừng ngay lập tức
      if (isLastQuestion && data.hoan_thanh) {
        onContinue();
      }

      if (data.so_tim_con_lai !== undefined) {
        if (data.so_tim_con_lai === 0) {
          onUpdateHearts(0) // Đồng bộ lại số tim từ server
        }
        // Nếu trả lời đúng, server sẽ trả về số tim không đổi, không cần cập nhật lại
        else if (data.so_tim_con_lai !== hearts) {
          onUpdateHearts(data.so_tim_con_lai) // Đồng bộ nếu có sai khác
        }
      }

    } catch (err: any) {
      setMessage(err.message || "Không thể gửi đáp án")
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
          disabled={!luaChonDaChon || isChecking}
          onClick={handleCheck}
          className={`px-8 py-6 text-lg rounded-lg mr-60 border-0 transition-all duration-200 cursor-pointer ${
            luaChonDaChon ? "bg-pink-500 hover:bg-pink-600 text-white" : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isChecking ? "Đang kiểm tra..." : "Kiểm tra"}
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
            onShowResult?.(false)
            onContinue()
          }}
        >
          Tiếp tục
        </Button>
      )}
    </footer>
  )
}
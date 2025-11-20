"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface FailModalProps {
  show: boolean
  onRestart: () => void
  maBaiHoc: number
}

export default function FailModal({ show, onRestart, maBaiHoc }: FailModalProps) {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!show || !isClient) return null

  const MotionButton = motion(Button)

  const handleExit = async () => {
    try {
      setLoading(true)
      // Gọi API để đánh dấu lần làm là thất bại trước khi thoát
      await fetch("/api/challenge/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", "credentials": "include" },
        body: JSON.stringify({ ma_bai_hoc: maBaiHoc, isExiting: true }),
      });
      const res = await fetch("/api/user-language", { method: "GET", credentials: "include" })
      const data = await res.json()
      if (res.ok && data.current?.id) {
        router.push(`/course?lang=${data.current.id}`)
      } else {
        router.push("/")
      }
    } catch (err) {
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 10 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-[380px] text-center"
      >
        <motion.img
          src="/fail.png"
          alt="fail"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 150, damping: 12 }}
          className="w-24 h-24 mx-auto mb-4"
        />

        <h2 className="text-3xl font-bold text-red-500 mb-2">Hết tim rồi</h2>
        <p className="text-gray-600 mb-6">Bạn đã cố gắng rất nhiều, thử lại nhé!</p>

        <div className="flex justify-center gap-10">
          <MotionButton
            variant="default"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={handleExit}
            disabled={loading}
            className="px-6 py-3 text-lg rounded-lg cursor-pointer"
          >
            Thoát
          </MotionButton>

          <MotionButton
            variant="secondary"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={onRestart}
            className="px-6 py-3 text-lg rounded-lg cursor-pointer"
          >
            Làm lại
          </MotionButton>
        </div>
      </motion.div>
    </div>
  )
}
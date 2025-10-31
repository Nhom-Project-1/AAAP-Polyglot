"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"

interface Firework {
  id: number
  x: number
  y: number
  color: string
}

interface CongratsProps {
  show: boolean
  onClose: () => void
  onRestart?: () => void;
}

export default function Congrats({ show, onClose, onRestart }: CongratsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const lessonId = searchParams.get("lessonId")
  const challengeId = searchParams.get("challengeId")

  const [isClient, setIsClient] = useState(false)
  const [fireworks, setFireworks] = useState<Firework[]>([])

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!show || !isClient) {
      setFireworks([])
      return
    }

    const colors = ["#f472b6", "#fb7185", "#facc15", "#fef08a", "#fda4af"]

    const interval = setInterval(() => {
      const id = performance.now() + Math.random() // tránh dùng Date.now() khi SSR
      const color = colors[Math.floor(Math.random() * colors.length)]
      const x = Math.random() * window.innerWidth
      const y = Math.random() * (window.innerHeight * 0.7)

      const fw: Firework = { id, x, y, color }
      setFireworks(prev => [...prev, fw])
      setTimeout(() => {
        setFireworks(prev => prev.filter(f => f.id !== id))
      }, 1500)
    }, 500)

    return () => {
      clearInterval(interval)
      setFireworks([])
    }
  }, [show, isClient])

  if (!show || !isClient) return null

  return (
    <div className="fixed inset-0 bg-pink-50 flex flex-col items-center justify-center z-50 overflow-hidden select-none">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-gradient-to-br from-pink-100 via-white to-pink-200 animate-pulse"
      />
      {fireworks.map(fw => (
        <div
          key={fw.id}
          className="absolute"
          style={{
            left: fw.x,
            top: fw.y
          }}
        >
          {[...Array(12)].map((_, i) => {
            const angle = (i / 12) * Math.PI * 2
            const dx = Math.cos(angle) * 90
            const dy = Math.sin(angle) * 90
            return (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: 6,
                  height: 6,
                  background: fw.color,
                  boxShadow: `0 0 15px ${fw.color}, 0 0 30px ${fw.color}`
                }}
                initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                animate={{
                  x: dx,
                  y: dy,
                  scale: [1, 0.8, 0],
                  opacity: [1, 0.8, 0]
                }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            )
          })}
        </div>
      ))}

      <motion.img
        src="/congrat.png"
        alt="congratulations"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 10 }}
        className="w-64 h-64 mb-6 drop-shadow-[0_0_40px_rgba(249,168,212,0.8)] z-10"
      />

      <motion.h1
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-5xl font-bold text-pink-600 mb-3 z-10 drop-shadow-lg"
      >
        Hoàn thành
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-lg text-pink-500 mb-8 z-10"
      >
        Bạn đã được cộng 10xp
      </motion.p>

      <div className="flex gap-10 z-10">
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => {
            onRestart?.()
          }}
          className="px-7 py-3 bg-white text-pink-500 font-semibold rounded-2xl shadow-md border border-pink-300 hover:bg-pink-100 transition cursor-pointer"          >
          Làm lại thử thách
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={onClose}
          className="px-8 py-3 bg-pink-400 text-white font-semibold rounded-2xl shadow-lg hover:bg-pink-500 transition cursor-pointer"
        >
          Tiếp tục học
        </motion.button>
      </div>
    </div>
  )
}

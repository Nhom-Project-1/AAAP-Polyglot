"use client"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, ArrowLeft } from "lucide-react"

interface HeaderProps {
  progress: number
  hearts: number
  onExitClick: () => void
}

export default function Header({ progress, hearts, onExitClick }: HeaderProps) {
  return (
    <header className="mt-8 mb-4 px-4 flex items-center justify-center gap-8 text-xl">
      <motion.button
        onClick={onExitClick}
        className="text-pink-500 hover:text-pink-600 cursor-pointer"
      >
        <ArrowLeft size={32} strokeWidth={2.5} />
      </motion.button>

      {/* progress bar */}
      <div className="w-[60vw] bg-gray-200 h-4 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-pink-500"
          initial={{ width: "0%" }} 
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
      </div>

      {/* hearts */}
      <div className="flex items-center gap-2 text-2xl font-bold">
        <motion.div
          key={hearts}
          initial={{ scale: 1 }}
          animate={
            hearts > 0
              ? { scale: [1, 1.2, 1], rotate: [0, -5, 5, -5, 0] }
              : { scale: [1, 1.4, 0.9, 1.1], opacity: [1, 0.7, 0.4] }
          }
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <Heart
            className={`drop-shadow-sm transition-colors duration-500 ${
              hearts > 0 ? "fill-pink-500 stroke-none" : "fill-gray-300 stroke-gray-400"
            }`}
            size={32}
          />
          {hearts === 0 && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(10)].map((_, i) => {
                const angle = (i / 10) * Math.PI * 2
                const dx = Math.cos(angle) * (20 + Math.random() * 10)
                const dy = Math.sin(angle) * (20 + Math.random() * 10)
                const delay = Math.random() * 0.2

                return (
                  <motion.div
                    key={i}
                    className="absolute top-1/2 left-1/2 w-2 h-2 bg-pink-400 rounded-sm shadow-[0_0_8px_rgba(249,168,212,0.8)]"
                    style={{ transform: "translate(-50%, -50%)" }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{ x: dx, y: dy, opacity: [1, 0.8, 0], scale: [1, 0.8, 0.4] }}
                    transition={{ duration: 1.2, delay, ease: "easeOut" }}
                  />
                )
              })}
            </div>
          )}
        </motion.div>

        {/* số tim */}
        <div className="relative h-8 w-6 overflow-hidden">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={hearts}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className={`absolute inset-0 ${hearts > 0 ? "text-pink-600" : "text-gray-400"}`}
            >
              {hearts}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
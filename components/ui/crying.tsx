"use client"

import { motion } from "framer-motion"
import React from "react"

type CryingProps = {
  size?: number 
}

const Crying: React.FC<CryingProps> = ({ size = 128 }) => {
  return (
    <motion.div
      className="relative"
      style={{ width: size, height: size }}
      animate={{ y: [0, -6, 0] }} 
      transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
    >
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <circle cx="32" cy="32" r="30" fill="#FFC107" /> 
        <circle cx="22" cy="25" r="5" fill="white" />
        <circle cx="42" cy="25" r="5" fill="white" />
        <circle cx="22" cy="25" r="2" fill="black" />
        <circle cx="42" cy="25" r="2" fill="black" />

        <path d="M24 42 Q32 50 40 42" stroke="#F44336" strokeWidth="2" fill="none" />

        {[22, 42].map((cx, idx) => (
          <motion.ellipse
            key={cx}
            cx={cx}
            cy={32}
            rx={2}
            ry={4}
            fill="#2196F3"
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: 20, opacity: 0 }}
            transition={{
              repeat: Infinity,
              repeatType: "loop",
              duration: 1.2,
              delay: idx * 0.3,
              ease: "easeIn",
            }}
          />
        ))}
      </svg>
    </motion.div>
  )
}

export default Crying

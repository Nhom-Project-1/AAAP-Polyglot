"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Firework {
  id: number;
  x: number;
  y: number;
  color: string;
}

interface CongratsProps {
  show: boolean;
  onClose: () => void;
}

export default function Congrats({ show, onClose }: CongratsProps) {
  const [fireworks, setFireworks] = useState<Firework[]>([]);

  useEffect(() => {
    if (!show) {
      setFireworks([]);
      return;
    }

    const colors = ["#f472b6", "#fb7185", "#facc15", "#fef08a", "#fda4af"];

    const interval = setInterval(() => {
      const id = Date.now() + Math.random();
      const color = colors[Math.floor(Math.random() * colors.length)];
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * (window.innerHeight * 0.8);

      const fw: Firework = { id, x, y, color };
      setFireworks((prev) => [...prev, fw]);

      // Xóa pháo hoa sau 1.5s
      setTimeout(() => {
        setFireworks((prev) => prev.filter((f) => f.id !== id));
      }, 1500);
    }, 300); // mỗi 0.3s bắn một cái

    return () => {
      clearInterval(interval);
      setFireworks([]); // dọn sạch khi ẩn
    };
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-pink-50 flex flex-col items-center justify-center z-50 overflow-hidden select-none">
      {/* nền lung linh */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-gradient-to-br from-pink-100 via-white to-pink-200 animate-pulse"
      />

      {/* hiệu ứng pháo hoa */}
      {fireworks.map((fw) => (
        <motion.div
          key={fw.id}
          className="absolute rounded-full blur-sm pointer-events-none"
          style={{
            width: 14,
            height: 14,
            left: fw.x,
            top: fw.y,
            background: fw.color,
            boxShadow: `0 0 25px ${fw.color}, 0 0 50px ${fw.color}`,
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{
            scale: [1, 1.5, 0],
            y: [0, -100, -150],
            opacity: [1, 0.8, 0],
          }}
          transition={{
            duration: 1.5,
            ease: "easeOut",
          }}
        />
      ))}

      <motion.img
        src="/tulip.png"
        alt="tulip"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 10 }}
        className="w-44 h-44 mb-6 drop-shadow-[0_0_30px_rgba(249,168,212,0.8)] z-10"
      />

      <motion.h1
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-5xl font-bold text-pink-600 mb-3 z-10 drop-shadow-lg"
      >
        Chúc mừng!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-lg text-pink-500 mb-8 z-10"
      >
        Bạn đã hoàn thành toàn bộ thử thách của bài học này 🎉
      </motion.p>

      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        onClick={onClose}
        className="px-6 py-3 bg-pink-500 text-white font-semibold rounded-2xl shadow-lg hover:bg-pink-600 transition z-10"
      >
        Tiếp tục học
      </motion.button>
    </div>
  );
}
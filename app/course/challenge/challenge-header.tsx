"use client";
import { motion } from "framer-motion";
import { Heart, ArrowLeft } from "lucide-react";

interface HeaderProps {
  progress: number;
  hearts: number;
  onExitClick: () => void;
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
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
      </div>

      {/* hearts */}
      <div className="flex items-center gap-2 text-2xl font-bold">
        <Heart className="fill-pink-500 stroke-none drop-shadow-sm" size={32} />
        <span className="text-pink-600">{hearts}</span>
      </div>
    </header>
  );
}
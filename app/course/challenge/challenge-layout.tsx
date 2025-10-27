"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface ChallengeLayoutProps {
  onExit?: () => void;
}

export default function ChallengeLayout({ onExit }: ChallengeLayoutProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [progress, setProgress] = useState(0.0); 
  const [hearts, setHearts] = useState(5);

  const handleExitClick = () => {
    setShowModal(true);
  };

  const handleCancelExit = () => {
    setShowModal(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 relative">
      {/* header */}
      <header className="mt-8 mb-4 px-4">
        <div className="flex items-center justify-center gap-8 text-xl">
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={handleExitClick}
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
        </div>
      </header>

      {/* body */}
      <main className="flex-1 flex items-center justify-center text-xl font-medium">
        Đây là các câu hỏi
      </main>

      <footer className="flex justify-end px-6 py-7 border-t border-gray-200">
        <Button
          variant="secondary"
          className="px-6 py-4 text-lg rounded-lg ml-auto mr-50 cursor-pointer"
          onClick={() => console.log("Kiểm tra")}
        >
          Kiểm tra
        </Button>
      </footer>

      {/* exit modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/30 backdrop-blur-sm z-50">
          <div className="bg-white p-10 rounded-xl shadow-xl w-96">
            <p className="mb-6 text-center text-lg font-medium">
              Bạn chắc chắn muốn thoát?
            </p>
            <div className="flex justify-between">
              <Button
                variant="default"
                className="px-6 py-3 text-lg rounded-lg cursor-pointer"
                onClick={handleCancelExit}
              >
                Hủy
              </Button>
              <Button
                variant="secondary"
                className="px-6 py-3 text-lg rounded-lg cursor-pointer"
                onClick={() => {
                  const langData = localStorage.getItem("selectedLang")
                  if (langData) {
                    try {
                      const langObj = JSON.parse(langData)
                      const langId = langObj.id
                      if (langId) {
                        router.push(`/course?lang=${langId}`)
                      }
                    } catch (err) {
                      console.error("Lỗi đọc ngôn ngữ từ localStorage:", err)
                    }
                  } else {
                    console.warn("Chưa có ngôn ngữ")
                  }
                }}
              >
                Chắc chắn
              </Button>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "./challenge-header";
import Footer from "./challenge-footer";
import Quiz from "./quiz";
import ExitModal from "./exit-modal";

export default function ChallengePage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [showModal, setShowModal] = useState(false);

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) setProgress((p) => Math.min(p + 0.2, 1));
    else setHearts((h) => Math.max(h - 1, 0));
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 relative">
      <Header progress={progress} hearts={hearts} onExitClick={() => setShowModal(true)} />
      <Quiz onAnswer={handleAnswer} />
      <Footer onCheck={() => console.log("Kiểm tra")} />
      <ExitModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={() => {
          const langData = localStorage.getItem("selectedLang");
          if (langData) {
            const langId = JSON.parse(langData).id;
            router.push(`/course?lang=${langId}`);
          }
        }}
      />
    </div>
  );
}
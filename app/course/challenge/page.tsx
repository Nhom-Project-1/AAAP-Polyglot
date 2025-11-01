"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "./challenge-header";
import Footer from "./challenge-footer";
import Quiz from "./quiz";
import { mockChallenge } from "./quiz";
import CongratModal from "./congrat";
import ExitModal from "./exit-modal";
import FailModal from "./fail";

export default function ChallengePage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [showModal, setShowModal] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [current, setCurrent] = useState(0);
  const [checked, setChecked] = useState(false); 
  const [showCongrat, setShowCongrat] = useState(false);
  const [showFail, setShowFail] = useState(false)
  const currentQuestion = mockChallenge[current];

  const handleSelect = (id: number) => {
      setSelectedChoice(id);
    };

  const handleCheck = () => {
    if (selectedChoice === null) return;
    const selected = currentQuestion.lua_chon.find(
      (c) => c.ma_lua_chon === selectedChoice
    );
    const correct = selected?.dung ?? false;
    setIsCorrect(correct);
    setShowResult(true);
    setChecked(true);
    setProgress((p) => Math.min(p + 1 / mockChallenge.length, 1));
    if (!correct) {
      setHearts((h) => {
        const newHearts = Math.max(h - 1, 0)
        if (newHearts === 0) {
          setTimeout(() => {
            setShowFail(true)
          }, 800) 
        }
        return newHearts
      })
    }
  };

  const handleContinue = () => {
    if (current < mockChallenge.length - 1) {
      setCurrent((c) => c + 1);
      setSelectedChoice(null);
      setShowResult(false);
      setIsCorrect(null);
      setChecked(false);
    } else {
      setShowCongrat(true);
    }
  };

  const resetChallenge = () => {
    setCurrent(0)
    setProgress(0)
    setHearts(5)
    setSelectedChoice(null)
    setShowResult(false)
    setIsCorrect(null)
    setChecked(false)
    setShowCongrat(false)
  }

   return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 relative">
      <Header progress={progress} hearts={hearts} onExitClick={() => setShowModal(true)} />
      
      <Quiz
         onSelect={handleSelect}
        showResult={showResult}
        selected={selectedChoice}
        current={current}
      />

      <Footer
        onCheck={handleCheck}
        onContinue={handleContinue}
        result={showResult ? isCorrect : null}
        checked={checked}
        hasSelected={selectedChoice !== null}
      />

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
      <CongratModal
        show={showCongrat}
        onClose={() => {
          const langData = localStorage.getItem("selectedLang");
          if (langData) {
            const langId = JSON.parse(langData).id;
            router.push(`/course?lang=${langId}`);
          }
        }}
        onRestart={resetChallenge}
      />
      <FailModal
        show={showFail}
        onClose={() => {
          const langData = localStorage.getItem("selectedLang")
          if (langData) {
            const langId = JSON.parse(langData).id
            router.push(`/course?lang=${langId}`)
          }
        }}
        onRestart={() => {
          resetChallenge()
          setShowFail(false)
        }}
      />
    </div>
  );
}
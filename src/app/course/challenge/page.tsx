"use client"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Quiz from "./quiz"
import Footer from "./challenge-footer"
import Header from "./challenge-header"
import ExitModal from "./exit-modal"
import CongratModal from "./congrat"
import FailModal from "./fail"
import { Skeleton } from "@/components/ui/skeleton"

type LuaChonThuThach = {
  ma_lua_chon: number
  ma_thu_thach: number
  noi_dung: string
  dung: boolean
}

type Challenge = {
  ma_thu_thach: number
  ma_bai_hoc: number
  cau_hoi: string
  loai_thu_thach: string
  lua_chon_thu_thach: LuaChonThuThach[]
  hinh_anh?: string
}

function ChallengeSkeleton() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Skeleton */}
      <header className="mt-8 mb-4 px-4 flex items-center justify-center gap-8 text-xl">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="w-[60vw] h-4 rounded-full" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-7 w-6 rounded-md" />
        </div>
      </header>

      {/* Quiz Skeleton */}
      <main className="flex-1 flex flex-col items-center justify-center text-xl font-medium gap-6">
        <Skeleton className="h-8 w-3/4 rounded-md" />
        <div className="flex flex-col gap-3 w-full max-w-md mt-4">
          <Skeleton className="h-12 w-full rounded-md" />
          <Skeleton className="h-12 w-full rounded-md" />
          <Skeleton className="h-12 w-full rounded-md" />
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
      </main>

      {/* Footer Skeleton */}
      <footer className="relative flex justify-end px-6 py-7 border-t border-gray-200">
        <Skeleton className="h-[68px] w-[180px] rounded-lg mr-60" />
      </footer>
    </div>
  );
}

export default function ChallengePageWrapper() {
  const searchParams = useSearchParams()
  const maBaiHoc = Number(searchParams.get("id"))
  if (!maBaiHoc) return <p>Không tìm thấy bài học</p>
  return <ChallengePage maBaiHoc={maBaiHoc} />
}

function ChallengePage({ maBaiHoc }: { maBaiHoc: number }) {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null)
  const [hearts, setHearts] = useState(5)
  const [maNguoiDung, setMaNguoiDung] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [showExitModal, setShowExitModal] = useState(false)
  const [showCongrats, setShowCongrats] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [completionMessage, setCompletionMessage] = useState<string | null>(null)
  const [footerResetKey, setFooterResetKey] = useState(0)
  const [showFail, setShowFail] = useState(false)
  const [isOutOfHearts, setIsOutOfHearts] = useState(false)
  const [isRestarting, setIsRestarting] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  // lấy user
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/user")
        const data = await res.json()
        if (data.id) setMaNguoiDung(data.id)
      } catch (err) {
        console.error("Không lấy được user:", err)
      }
    }
    fetchUser()
  }, [])

  // Lấy toàn bộ dữ liệu bài học một lần duy nhất
  useEffect(() => {
    async function fetchLesson() {
      if (!maBaiHoc) return
      setLoading(true)
      try {
        const res = await fetch(`/api/challenge?ma_bai_hoc=${maBaiHoc}`)
        const data = await res.json()
        if (data.challenges) {
          setChallenges(data.challenges)
        }
      } catch (err) {
        console.error("Lấy danh sách thử thách thất bại:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchLesson()
  }, [maBaiHoc])

  useEffect(() => {
    if (isOutOfHearts) {
      setShowFail(true)
    }
  }, [isOutOfHearts])
  
  const currentChallenge = challenges[currentIndex]

  if (loading || challenges.length === 0 || !currentChallenge) {
    return <ChallengeSkeleton />
  }

  const handleSelect = (id: number) => {
    setSelectedChoice(id)
  }

    const handleContinue = () => {
      if (isOutOfHearts) return 
      setSelectedChoice(null)
      setShowResult(false)
      if (currentIndex + 1 < challenges.length) {
        setCurrentIndex(currentIndex + 1)
      } else {
          setShowCongrats(true)
      }
    }

  const handleRestartChallenge = () => {
    setSelectedChoice(null)
    setIsRestarting(true) // Đánh dấu là đang restart
    setCurrentIndex(0)
    setFooterResetKey(prev => prev + 1)
    setHearts(5)
    setIsOutOfHearts(false)
    setShowFail(false)
    setShowCongrats(false)
      setShowResult(false)
      setCompletionMessage(null)
  }

  const progressValue = showResult
    ? (currentIndex + 1) / challenges.length
    : currentIndex / challenges.length

  const correctChoiceId = currentChallenge?.lua_chon_thu_thach?.find(
    (choice) => choice.dung
  )?.ma_lua_chon

  return (
    <div className="flex flex-col min-h-screen">
      <Header progress={progressValue} hearts={hearts} onExitClick={() => setShowExitModal(true)} />
      <ExitModal
        show={showExitModal}
        onClose={() => setShowExitModal(false)} 
        maBaiHoc={maBaiHoc}
      />
  <CongratModal show={showCongrats} message={completionMessage ?? undefined} onRestart={handleRestartChallenge} />
      <Quiz challenge={currentChallenge} onSelect={handleSelect} selected={selectedChoice} showResult={showResult} isChecking={isChecking} />
      {maNguoiDung && currentChallenge && (
        <Footer
          key={footerResetKey}
          isChecking={isChecking}
          maNguoiDung={maNguoiDung}
          maBaiHoc={maBaiHoc}
          maThuThach={currentChallenge.ma_thu_thach}
          luaChonDaChon={selectedChoice}
          correctChoiceId={correctChoiceId}
          hearts={hearts}
          isOutOfHearts={isOutOfHearts}
          onUpdateHearts={(val) => {
            setHearts(val)
            if (val === 0) setIsOutOfHearts(true)
          }}
          onShowResult={(v: boolean) => setShowResult(v)}
          isLastQuestion={currentIndex === challenges.length - 1}
          onFinalMessage={(m: string) => setCompletionMessage(m)}
          onContinue={handleContinue}
          onCheckingChange={(checking) => setIsChecking(checking)}
        />
      )}
      <FailModal show={showFail} onRestart={handleRestartChallenge} maBaiHoc={maBaiHoc} />
    </div>
  )
}
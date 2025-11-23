"use client"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthStore } from "@/lib/store"
import { useQuery } from "@tanstack/react-query"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import Footer from "./challenge-footer"
import Header from "./challenge-header"
import CongratModal from "./congrat"
import ExitModal from "./exit-modal"
import FailModal from "./fail"
import Quiz from "./quiz"
import Crying from "@/components/ui/crying"

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

type ModalState = 'none' | 'exit' | 'congrats' | 'fail';

function ChallengePageContent() {
  const searchParams = useSearchParams()
  const maBaiHoc = Number(searchParams.get("id"))
  if (!maBaiHoc) return <p>Không tìm thấy bài học</p>
  return <ChallengePage maBaiHoc={maBaiHoc} />
}

export default function ChallengePageWrapper() {
  return (
    <Suspense fallback={<Skeleton className="h-screen w-full" />}>
      <ChallengePageContent />
    </Suspense>
  )
}

const INITIAL_HEARTS = 5;

function ChallengePage({ maBaiHoc }: { maBaiHoc: number }) {
  const { user } = useAuthStore()
  const maNguoiDung = user?.id

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null)
  const [hearts, setHearts] = useState(INITIAL_HEARTS)
  const [modalState, setModalState] = useState<ModalState>('none');
  const [showResult, setShowResult] = useState(false)
  const [diemMoi, setDiemMoi] = useState<number>(0)
  const [completionMessage, setCompletionMessage] = useState<string | null>(null)
  const [footerResetKey, setFooterResetKey] = useState(0)
  const [isOutOfHearts, setIsOutOfHearts] = useState(false)
  const [isRestarting, setIsRestarting] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const router = useRouter()

  const resetChallengeState = () => {
    setSelectedChoice(null);
    setDiemMoi(0);
    setHearts(INITIAL_HEARTS);
    setIsOutOfHearts(false);
    setModalState('none');
    setShowResult(false);
    setCompletionMessage(null);
    setFooterResetKey(prev => prev + 1);
  }

  // Fetch challenge IDs
  const { data: challengeData, isLoading: isFetchingChallenges } = useQuery({
    queryKey: ['challenges', maBaiHoc],
    queryFn: async () => {
      const res = await fetch(`/api/challenge?ma_bai_hoc=${maBaiHoc}`)
      return res.json()
    },
    enabled: !!maBaiHoc
  })

  const challengeIds = challengeData?.challenges?.map((c: any) => c.ma_thu_thach) || []
  
  // Update hearts from API response
  useEffect(() => {
    if (typeof challengeData?.hearts === 'number') {
      setHearts(challengeData.hearts)
    }
  }, [challengeData?.hearts])

  // Fetch challenge detail
  const currentChallengeId = challengeIds[currentIndex]
  const { data: challengeDetailData, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['challenge', currentChallengeId],
    queryFn: async () => {
      const res = await fetch(`/api/challenge/${currentChallengeId}`)
      return res.json()
    },
    enabled: !!currentChallengeId
  })

  const currentChallenge = challengeDetailData?.challenge || null
  const loading = isFetchingChallenges || (!!currentChallengeId && isLoadingDetail)

  useEffect(() => {
    if (isOutOfHearts) {
      setModalState('fail');
    }
  }, [isOutOfHearts])

  // Logic to show "No challenges" message
  if (!isFetchingChallenges && challengeIds.length === 0) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center gap-4">
        <Crying size={150} />
        <p className="text-xl text-slate-500">Bài học này chưa có thử thách nào.</p>
        <Button 
          variant="secondary" 
          className="bg-pink-500 text-white hover:bg-pink-600 cursor-pointer"
          onClick={() => router.back()}
        >
          Quay lại
        </Button>
      </div>
    )
  }

  if (loading || !currentChallenge) {
    return (
      <div className="flex flex-col min-h-screen">
        {/* Skeleton Header */}
        <header className="mt-8 mb-4 px-4 flex items-center justify-center gap-8 text-xl">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-4 w-[60vw] rounded-full" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-6" />
          </div>
        </header>

        {/* Skeleton Quiz */}
        <main className="flex-1 flex flex-col items-center justify-center text-xl font-medium gap-6 w-full max-w-lg mx-auto">
          <Skeleton className="h-8 w-3/4" />
          <div className="flex flex-col gap-3 w-full mt-4">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        </main>

        {/* Skeleton Footer */}
        <footer className="flex justify-end px-6 py-7 border-t border-gray-200 mt-auto">
          <Skeleton className="h-20 w-80 rounded-lg" />
        </footer>
      </div>
    )
  }

  const handleSelect = (id: number) => {
    setSelectedChoice(id)
  }

  const handleContinue = () => {
    if (isOutOfHearts) return 
    setSelectedChoice(null)
    setShowResult(false)
    if (currentIndex + 1 < challengeIds.length) {
      setCurrentIndex(currentIndex + 1)
    } else {
        // Call API to mark lesson as completed
        fetch('/api/user/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ma_bai_hoc: maBaiHoc }),
        }).catch(err => console.error("Failed to mark lesson complete", err));

        setModalState('congrats');
    }
  }

  const handleRestartChallenge = () => {
    resetChallengeState();
    setIsRestarting(true);
    setCurrentIndex(0);
  }

  // Tính toán progress. Nếu đã show kết quả, tính cả câu hiện tại là đã hoàn thành.
  const progressValue = showResult
    ? (currentIndex + 1) / challengeIds.length
    : currentIndex / challengeIds.length

  // Tìm đáp án đúng của câu hỏi hiện tại để thực hiện Optimistic UI
  const correctChoiceId = currentChallenge?.lua_chon_thu_thach.find(
    (choice: any) => choice.dung
  )?.ma_lua_chon

  return (
    <div className="flex flex-col min-h-screen">
      <Header progress={progressValue} hearts={hearts} onExitClick={() => setModalState('exit')} />
      <ExitModal
        show={modalState === 'exit'}
        onClose={() => setModalState('none')} 
        maBaiHoc={maBaiHoc}
      />
      <CongratModal show={modalState === 'congrats'} diemMoi={diemMoi} message={completionMessage ?? undefined} onRestart={handleRestartChallenge} />
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
          onComplete={(xp) => setDiemMoi(xp)}
          onShowResult={(v: boolean) => setShowResult(v)}
          isLastQuestion={currentIndex === challengeIds.length - 1}
          onFinalMessage={(m: string) => setCompletionMessage(m)}
          onContinue={handleContinue}
          onCheckingChange={(checking) => setIsChecking(checking)}
        />
      )}
      <FailModal show={modalState === 'fail'} onRestart={handleRestartChallenge} maBaiHoc={maBaiHoc} />
    </div>
  )
}
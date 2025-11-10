"use client"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Quiz from "./quiz"
import Footer from "./challenge-footer"
import Header from "./challenge-header"
import ExitModal from "./exit-modal"
import CongratModal from "./congrat"
import FailModal from "./fail"

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

export default function ChallengePageWrapper() {
  const searchParams = useSearchParams()
  const maBaiHoc = Number(searchParams.get("id"))
  if (!maBaiHoc) return <p>Không tìm thấy bài học</p>
  return <ChallengePage maBaiHoc={maBaiHoc} />
}

function ChallengePage({ maBaiHoc }: { maBaiHoc: number }) {
  const [challengeIds, setChallengeIds] = useState<number[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null)
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null)
  const [hearts, setHearts] = useState(5)
  const [maNguoiDung, setMaNguoiDung] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [showExitModal, setShowExitModal] = useState(false)
  const [showCongrats, setShowCongrats] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [diemMoi, setDiemMoi] = useState<number>(0)
  const [completionMessage, setCompletionMessage] = useState<string | null>(null)
  const [footerResetKey, setFooterResetKey] = useState(0)
  const [showFail, setShowFail] = useState(false)
  const [isOutOfHearts, setIsOutOfHearts] = useState(false)
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

  // lấy danh sách challenge
  useEffect(() => {
    async function fetchChallengeIds() {
      if (!maBaiHoc) return
      try {
        const res = await fetch(`/api/challenge?ma_bai_hoc=${maBaiHoc}`)
        const data = await res.json()
        if (data.challenges) {
          const ids = data.challenges.map((c: any) => c.ma_thu_thach)
          setChallengeIds(ids)
        }
      } catch (err) {
        console.error("Lấy danh sách thử thách thất bại:", err)
      }
    }
    fetchChallengeIds()
  }, [maBaiHoc])

  // lấy chi tiết thử thách hiện tại
  useEffect(() => {
    async function fetchChallengeDetail() {
      if (challengeIds.length === 0) return
      const id = challengeIds[currentIndex]
      try {
        const res = await fetch(`/api/challenge/${id}`)
        const data = await res.json()
        if (data.challenge) setCurrentChallenge(data.challenge)
      } catch (err) {
        console.error("Lấy chi tiết thử thách thất bại:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchChallengeDetail()
  }, [challengeIds, currentIndex])

  useEffect(() => {
    if (isOutOfHearts) {
      setShowFail(true)
    }
  }, [isOutOfHearts])

  if (loading) return <p>Đang tải thử thách...</p>
  if (!currentChallenge) return <p>Không có thử thách</p>

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
          setShowCongrats(true)
      }
    }

  const handleRestartChallenge = () => {
    setSelectedChoice(null)
    setCurrentIndex(0)
    setDiemMoi(0)
    setFooterResetKey(prev => prev + 1)
    setHearts(5)
    setIsOutOfHearts(false)
    setShowFail(false)
    setShowCongrats(false)
      setShowResult(false)
      setCompletionMessage(null)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header progress={currentIndex / challengeIds.length} hearts={hearts} onExitClick={() => setShowExitModal(true)} />
      <ExitModal
        show={showExitModal}
        onClose={() => setShowExitModal(false)}
        onResetProgress={handleRestartChallenge} 
      />
  <CongratModal show={showCongrats} diemMoi={diemMoi} message={completionMessage ?? undefined} onRestart={handleRestartChallenge} />
      <Quiz challenge={currentChallenge} onSelect={handleSelect} selected={selectedChoice} showResult={showResult} />
      {maNguoiDung && currentChallenge && (
        <Footer
          key={footerResetKey}
          maNguoiDung={maNguoiDung}
          maBaiHoc={maBaiHoc}
          maThuThach={currentChallenge.ma_thu_thach}
          luaChonDaChon={selectedChoice}
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
        />
      )}
      <FailModal show={showFail} onRestart={handleRestartChallenge} />
    </div>
  )
}
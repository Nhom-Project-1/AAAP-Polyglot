"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useEffect, useState, Suspense } from "react"
import { ArrowLeft, Volume2 } from "lucide-react"
import Layout from "@/components/layout"
import UserProgress from "@/components/user-progress"
import Crying from "@/components/ui/crying"
import { Skeleton } from "@/components/ui/skeleton"
import Loading from "@/components/ui/loading"

type Unit = {
  ma_don_vi: number
  ten_don_vi: string
  mo_ta?: string
  ma_ngon_ngu: number
  thu_tu?: number
}

type Lesson = {
  ma_bai_hoc: number
  ten_bai_hoc: string
  mo_ta?: string
  ma_don_vi: number
  thu_tu?: number
}

type Vocab = {
  ma_tu: number
  ma_bai_hoc: number
  tu: string
  nghia: string
  phien_am: string
  lien_ket_am_thanh: string
  vi_du: string
}

function LessonPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const langId = searchParams.get("lang")
  const unitId = searchParams.get("unit")
  const lessonId = searchParams.get("id")

  const [unit, setUnit] = useState<Unit | null>(null)
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [vocabs, setVocabs] = useState<Vocab[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const playAudio = (src: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_AUDIO_BASE_URL || "";
    if (!baseUrl) return;

    const fullUrl = `${baseUrl}${src}`; 
    const audio = new Audio(fullUrl);
    audio.play();
  }

  useEffect(() => {
    if (!langId || !unitId || !lessonId) {
      setError("Thiếu tham số bài học hoặc ngôn ngữ")
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/languages/${langId}/units/${unitId}/lessons/${lessonId}`, {cache: "no-store"})
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || "Không thể tải dữ liệu")
          return
        }
        setUnit(data.unit)
        setLesson(data.lesson)
        setVocabs(data.data)
      } catch (e) {
        setError("Có lỗi xảy ra khi tải dữ liệu")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [langId, unitId, lessonId])

  const handleStartChallenge = async () => {
    if (!lesson) return;

    try {
      const res = await fetch(`/api/challenge?ma_bai_hoc=${lesson.ma_bai_hoc}`);
      if (!res.ok && res.status !== 404) {
        const data = await res.json();
        console.error(data.error || "Lỗi không xác định");
        return;
      }
      router.push(`/course/challenge?id=${lesson.ma_bai_hoc}`);
    } catch (err) {
      console.error("Lỗi khi gọi API challenge:", err);
    }
  };

  if (loading) {
    return (
      <main className="relative p-6 min-h-screen">
        <div className="absolute top-4 right-6">
          <UserProgress />
        </div>
        <div className="flex items-center gap-4 mb-4">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-9 w-1/2" />
        </div>
        <div className="text-center mt-8">
          <Skeleton className="h-9 w-1/3 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border rounded-xl p-4 shadow-md flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  if (error || !lesson || !unit)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <p className="text-gray-500 text-lg font-medium text-center">
          {error || "Không tìm thấy bài học này"}
        </p>
        <button
          onClick={() => router.back()}
          className="mt-2 text-sm text-pink-500 hover:underline cursor-pointer"
        >
          Quay lại
        </button>
      </div>
    )

  return (
    <main className="relative p-6 min-h-screen">
      <div className="absolute top-4 right-6">
        <UserProgress />
      </div>

      <div className="flex items-center gap-4 mb-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={() => router.back()}
          className="text-pink-500 hover:text-pink-600 cursor-pointer"
        >
          <ArrowLeft size={25} strokeWidth={2} />
        </motion.button>

        <h1 className="text-3xl font-bold text-pink-500">
          {lesson.ten_bai_hoc}: {lesson.mo_ta || ""}
        </h1>
      </div>

      <div className="text-center mt-8">
        <p className="text-3xl font-semibold">Danh sách từ vựng</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {vocabs.length > 0 ? (
          vocabs.map((v) => (
            <div
              key={v.ma_tu}
              className="border rounded-xl p-4 shadow-md flex items-center justify-between"
            >
              <div>
                <h3 className="text-xl font-bold">
                  {v.tu}{" "}
                  <span className="text-gray-500">{v.phien_am}</span>
                </h3>
                <p className="text-gray-700 mb-2">{v.nghia}</p>
                <p className="italic text-gray-500">{v.vi_du}</p>
              </div>
              {v.lien_ket_am_thanh && (
                <button
                  onClick={() => playAudio(v.lien_ket_am_thanh)}
                  className="ml-4 text-pink-500 hover:text-pink-600 cursor-pointer"
                >
                  <Volume2 size={24} />
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center mt-12 space-y-4 text-center text-gray-500 italic">
            <Crying size={150} />
            <p>Hiện tại chưa có từ vựng cho bài này</p>
          </div>
                )}
      </div>

      <div className="flex justify-center mt-12 mb-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStartChallenge}
          className="bg-pink-400 text-white px-8 py-3 rounded-xl font-semibold shadow-md hover:bg-pink-500 transition cursor-pointer"
        >
          Bắt đầu làm bài
        </motion.button>
      </div>
    </main>
  )
}

export default function LessonPage() {
  return (
    <Layout>
      <Suspense fallback={<Loading />}>
        <LessonPageContent />
      </Suspense>
    </Layout>
  )
}
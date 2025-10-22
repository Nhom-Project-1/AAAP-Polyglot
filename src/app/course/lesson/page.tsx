"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { ArrowLeft, Volume2 } from "lucide-react"
import Layout from "@/components/layout"
import UserProgress from "@/components/user-progress"
import Crying from "@/components/crying"

type Unit = {
  ma_don_vi: number
  title: string
  description: string
  ma_ngon_ngu: string
  order: number
}

type Lesson = {
  ma_bai_hoc: number
  title: string
  description: string
  ma_don_vi: number
  order: number
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

interface LessonPageProps {
  params: {
    langId: string
    unitId: string
    lessonId: string
  }
}

export default function LessonPage({ params }: LessonPageProps) {
  const router = useRouter()
  const { langId, unitId, lessonId } = params

  const [unit, setUnit] = useState<Unit | null>(null)
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [vocabs, setVocabs] = useState<Vocab[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const playAudio = (src: string) => {
    const audio = new Audio(src)
    audio.play()
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/course/${langId}/${unitId}/${lessonId}/vocabs`)
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || "Không thể tải dữ liệu")
          setUnit(null)
          setLesson(null)
          setVocabs([])
          return
        }

        setUnit(data.unit)
        setLesson(data.lesson)
        setVocabs(data.data)
      } catch (e) {
        setError("Có lỗi xảy ra khi tải dữ liệu")
        setUnit(null)
        setLesson(null)
        setVocabs([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [langId, unitId, lessonId])

  if (loading) return <p className="text-center mt-10">Đang tải dữ liệu...</p>

  if (error || !lesson || !unit) 
    return(
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <Crying size={150} /> 
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
    <Layout>
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
            {lesson.title}: {lesson.description}
          </h1>
        </div>

        <div className="text-center mt-8">
          <p className="text-3xl font-semibold">Danh sách từ vựng</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {vocabs.length > 0 ? (
            vocabs.map((v) => (
              <div key={v.ma_tu} className="border rounded-xl p-4 shadow-md flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">{v.tu} <span className="text-gray-500">{v.phien_am}</span></h3>
                  <p className="text-gray-700 mb-2">{v.nghia}</p>
                  <p className="italic text-gray-500">{v.vi_du}</p>
                </div>
                <button
                  onClick={() => playAudio(v.lien_ket_am_thanh)}
                  className="ml-4 text-pink-500 hover:text-pink-600 cursor-pointer"
                >
                  <Volume2 size={24} />
                </button>
              </div>
            ))
          ) : (
            <p className="col-span-full text-gray-500 text-center italic">
              Hiện tại chưa có từ vựng cho bài này
            </p>
          )}
        </div>

        <div className="flex justify-center mt-12 mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>  router.push("/course/challenge")}
            className="bg-pink-400 text-white px-8 py-3 rounded-xl font-semibold shadow-md hover:bg-pink-500 transition cursor-pointer"
          >
            Bắt đầu làm bài
          </motion.button>
        </div>
      </main>
    </Layout>
  )
}
"use client"
import Crying from "@/components/ui/crying"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

type Lesson = {
  ma_bai_hoc: number
  ten_bai_hoc: string
  thu_tu: number
  ma_don_vi: number
  isCompleted?: boolean
}

type Unit = {
  ma_don_vi: number
  ten_don_vi: string
  mo_ta?: string 
  ma_ngon_ngu: number
  bai_hoc: Lesson[]
}

type ApiUnit = {
  ma_don_vi: number;
  ten_don_vi: string;
  mo_ta?: string;
  ma_ngon_ngu: number;
  bai_hoc: ApiLesson[];
};

type ApiLesson = {
  ma_bai_hoc: number;
  ten_bai_hoc: string;
  thu_tu: number;
  ma_don_vi: number;
  isCompleted?: boolean;
};

export default function UnitLesson() {
  const [units, setUnits] = useState<Unit[]>([])
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const languageIdStr = searchParams.get("lang")
  const languageId = languageIdStr ? Number(languageIdStr) : NaN
  const [hasFetched, setHasFetched] = useState(false)

  useEffect(() => {
    if (!languageIdStr || isNaN(languageId)) {
      setError("Ngôn ngữ không hợp lệ")
      return
    }

    const fetchUnits = async () => {
      try {
        const res = await fetch(`api/languages/${languageId}/units`, {cache: "no-store"})
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()

        const mappedUnits: Unit[] = data.data.map((u: ApiUnit) => ({
          ma_don_vi: u.ma_don_vi,
          ten_don_vi: u.ten_don_vi,
          mo_ta: u.mo_ta,
          ma_ngon_ngu: u.ma_ngon_ngu,
          bai_hoc: (u.bai_hoc || []).map((l: ApiLesson) => ({
            ma_bai_hoc: l.ma_bai_hoc,
            ten_bai_hoc: l.ten_bai_hoc,
            thu_tu: l.thu_tu,
            ma_don_vi: l.ma_don_vi,
            isCompleted: l.isCompleted,
          }))
          .sort((a: Lesson, b: Lesson) => a.ma_bai_hoc - b.ma_bai_hoc),
        }))
        setUnits(mappedUnits)
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      }
      finally {
        setHasFetched(true)
      }
    }

    fetchUnits()
  }, [languageId, languageIdStr])
  if (!hasFetched) {
    return (
      <div className="space-y-16 mt-8 pl-6">
        {[...Array(2)].map((_, unitIndex) => (
          <div key={unitIndex} className="flex flex-col items-center">
            {/* Skeleton for Unit Header */}
            <Skeleton className="h-12 w-1/3 mb-10" />

            {/* Skeleton for Lessons */}
            <div className="relative w-full flex flex-col items-center space-y-28">
              {[...Array(3)].map((_, lessonIndex) => {
                const direction = unitIndex % 2 === 0 ? 1 : -1
                const waveOffset = Math.sin(lessonIndex * 1.1) * 120 * direction
                return (
                  <Skeleton key={lessonIndex} className="w-20 h-20 rounded-full" style={{ transform: `translateX(${waveOffset}px)` }} />
                )
              })}
            </div>
          </div>
        ))}
      </div>
    )
  }
  if (error)
    return (
      <div className="flex flex-col items-center justify-center mt-16">
        <p className="text-red-500 text-lg font-medium">{error}</p>
      </div>
    )

  if (!units.length)
    return (
      <div className="flex flex-col items-center justify-center mt-16">
        <Crying size={128} />
        <p className="text-gray-500 text-lg font-medium mt-4">
          Không có chương nào cho ngôn ngữ này.
        </p>
        <button
          onClick={() => router.push("/course/choose")}
          className="mt-2 text-sm text-pink-400 hover:underline cursor-pointer"
        >
          Chọn ngôn ngữ khác
        </button>
      </div>
    )
  let lessonIndex = 0;
  return (
    <div className="space-y-16 mt-8 pl-6">
      {units.map((unit, unitIndex) => {
        const unitLessons = unit.bai_hoc
        const direction = unitIndex % 2 === 0 ? 1 : -1

        return (
          <div key={unit.ma_don_vi} className="flex flex-col items-center">
            <div className="bg-pink-400 text-white rounded-lg shadow-md px-4 py-2 mb-10 w-1/3 text-center">
              <h2 className="text-lg font-bold">{unit.ten_don_vi}</h2>
              {unit.mo_ta && (
              <h2 className="text-lg font-bold mt-1">{unit.mo_ta}</h2>)}
            </div>

            <div className="relative w-full flex flex-col items-center space-y-28">
              {unitLessons.map((lesson, index) => {
                const waveOffset = Math.sin(index * 1.1) * 120 * direction
                lessonIndex += 1
                const isCompleted = lesson.isCompleted
                
                return (
                  <div
                    key={lesson.ma_bai_hoc}
                    className="relative flex flex-col items-center"
                    style={{
                      transform: `translateX(${waveOffset}px)`,
                    }}
                  >
                    {index === 0 && !isCompleted && (
                      <motion.span
                        animate={{ y: [0, -6, 0] }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="text-pink-500 font-semibold mb-2"
                      >
                        Start
                      </motion.span>
                    )}

                    <motion.div
                      whileHover={{
                        scale: 1.1,
                        boxShadow: isCompleted 
                          ? "0 0 20px rgba(234, 179, 8, 0.6)" // Yellow glow for completed
                          : "0 0 20px rgba(236,72,153,0.6)", // Pink glow for active
                      }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className={`w-20 h-20 flex items-center justify-center rounded-full text-white shadow-lg cursor-pointer border-4 ${
                        isCompleted 
                          ? "bg-yellow-400 border-yellow-200" 
                          : "bg-pink-400 border-pink-200"
                      }`}
                      onClick={() =>
                        router.push(`/course/lesson?id=${lesson.ma_bai_hoc}&unit=${unit.ma_don_vi}&lang=${languageId}`)

                      }
                    >
                      {isCompleted ? (
                        <Check size={32} strokeWidth={3} />
                      ) : (
                        <span className="text-lg font-bold">{lessonIndex}</span>
                      )}
                    </motion.div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
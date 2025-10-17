"use client"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useRouter,useSearchParams } from "next/navigation"
import Crying from "@/components/crying"
import Loading from "@/components/loading"

type Unit = {
  id: number
  title: string
  description: string
  languageId: string
  order: number
}

type Lesson = {
  id: number
  title: string
  unitId: number
  description: string
  order: number
}

export default function UnitLesson() {
  const [units, setUnits] = useState<Unit[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()
  const languageId = searchParams.get("lang") 
  const allUnits: Unit[] = [
    { id: 1, title: "Chương 1", description: "Bắt đầu với tiếng Anh", languageId: "en", order: 1 },
    { id: 2, title: "Chương 2", description: "Từ vựng giao tiếp hàng ngày", languageId: "en", order: 2 },

    { id: 3, title: "Chương 1", description: "Bắt đầu với tiếng Pháp", languageId: "fr", order: 1 },
    { id: 4, title: "Chương 2", description: "Từ vựng giao tiếp cơ bản", languageId: "fr", order: 2 },

    { id: 5, title: "Chương 1", description: "Bắt đầu với tiếng Nhật", languageId: "ja", order: 1 },
    { id: 6, title: "Chương 2", description: "Từ vựng về cuộc sống hàng ngày", languageId: "ja", order: 2 },

    { id: 7, title: "Chương 1", description: "Bắt đầu với tiếng Hàn", languageId: "ko", order: 1 },
    { id: 8, title: "Chương 2", description: "Từ vựng giao tiếp thông dụng", languageId: "ko", order: 2 },

    { id: 9, title: "Chương 1", description: "Bắt đầu với tiếng Tây Ban Nha", languageId: "es", order: 1 },
    { id: 10, title: "Chương 2", description: "Từ vựng về con người và cuộc sống", languageId: "es", order: 2 },

    { id: 11, title: "Chương 1", description: "Bắt đầu với tiếng Đức", languageId: "de", order: 1 },
    { id: 12, title: "Chương 2", description: "Từ vựng giao tiếp thường gặp", languageId: "de", order: 2 },

    { id: 13, title: "Chương 1", description: "Bắt đầu với tiếng Ả Rập", languageId: "ar", order: 1 },
    { id: 14, title: "Chương 2", description: "Từ vựng về đời sống và giao tiếp", languageId: "ar", order: 2 },

    { id: 15, title: "Chương 1", description: "Bắt đầu với tiếng Trung", languageId: "zh", order: 1 },
    { id: 16, title: "Chương 2", description: "Từ vựng về giao tiếp cơ bản", languageId: "zh", order: 2 },
  ]

   const allLessons: Lesson[] = [
    // tiếng Anh
    { id: 1, title: "Bài học 1", description: "Từ vựng cơ bản", unitId: 1, order: 1 },
    { id: 2, title: "Bài học 2", description: "Từ vựng về màu sắc", unitId: 1, order: 2 },
    { id: 3, title: "Bài học 3", description: "Từ vựng về số đếm", unitId: 1, order: 3 },
    { id: 4, title: "Bài học 4", description: "Từ vựng chào hỏi", unitId: 2, order: 1 },
    { id: 5, title: "Bài học 5", description: "Từ vựng trong giao tiếp hàng ngày", unitId: 2, order: 2 },
    { id: 6, title: "Bài học 6", description: "Từ vựng về cảm xúc", unitId: 2, order: 3 },
    { id: 7, title: "Bài học 7", description: "Từ vựng về động vật", unitId: 2, order: 4 },

    // tiếng Pháp
    { id: 8, title: "Bài học 1", description: "Từ vựng cơ bản", unitId: 3, order: 1 },
    { id: 9, title: "Bài học 2", description: "Từ vựng về đồ vật", unitId: 3, order: 2 },
    { id: 10, title: "Bài học 3", description: "Từ vựng về con người", unitId: 3, order: 3 },
    { id: 11, title: "Bài học 4", description: "Từ vựng chào hỏi và giao tiếp", unitId: 4, order: 1 },
    { id: 12, title: "Bài học 5", description: "Từ vựng trong quán ăn và mua sắm", unitId: 4, order: 2 },

    // tiếng Nhật
    { id: 13, title: "Bài học 1", description: "Từ vựng cơ bản", unitId: 5, order: 1 },
    { id: 14, title: "Bài học 2", description: "Từ vựng về đồ dùng cá nhân", unitId: 5, order: 2 },
    { id: 15, title: "Bài học 3", description: "Từ vựng về gia đình", unitId: 5, order: 3 },
    { id: 16, title: "Bài học 4", description: "Từ vựng về cuộc sống hàng ngày", unitId: 6, order: 1 },
    { id: 17, title: "Bài học 5", description: "Từ vựng về giao tiếp cơ bản", unitId: 6, order: 2 },

    // tiếng Hàn
    { id: 18, title: "Bài học 1", description: "Từ vựng cơ bản", unitId: 7, order: 1 },
    { id: 19, title: "Bài học 2", description: "Từ vựng về trường học", unitId: 7, order: 2 },
    { id: 20, title: "Bài học 3", description: "Từ vựng về thời tiết", unitId: 7, order: 3 },
    { id: 21, title: "Bài học 4", description: "Từ vựng trong giao tiếp hàng ngày", unitId: 8, order: 1 },
    { id: 22, title: "Bài học 5", description: "Từ vựng về du lịch", unitId: 8, order: 2 },

    // tiếng Tây Ban Nha
    { id: 23, title: "Bài học 1", description: "Từ vựng cơ bản", unitId: 9, order: 1 },
    { id: 24, title: "Bài học 2", description: "Từ vựng về con người", unitId: 9, order: 2 },
    { id: 25, title: "Bài học 3", description: "Từ vựng về đồ ăn", unitId: 9, order: 3 },
    { id: 26, title: "Bài học 4", description: "Từ vựng trong giao tiếp xã hội", unitId: 10, order: 1 },
    { id: 27, title: "Bài học 5", description: "Từ vựng về sở thích và cảm xúc", unitId: 10, order: 2 },

    // tiếng Đức
    { id: 28, title: "Bài học 1", description: "Từ vựng cơ bản", unitId: 11, order: 1 },
    { id: 29, title: "Bài học 2", description: "Từ vựng về trường học", unitId: 11, order: 2 },
    { id: 30, title: "Bài học 3", description: "Từ vựng về giao tiếp hàng ngày", unitId: 12, order: 1 },
    { id: 31, title: "Bài học 4", description: "Từ vựng về địa điểm và du lịch", unitId: 12, order: 2 },

    // tiếng Ả Rập
    { id: 32, title: "Bài học 1", description: "Từ vựng cơ bản", unitId: 13, order: 1 },
    { id: 33, title: "Bài học 2", description: "Từ vựng về đồ vật thường gặp", unitId: 13, order: 2 },
    { id: 34, title: "Bài học 3", description: "Từ vựng giao tiếp cơ bản", unitId: 14, order: 1 },
    { id: 35, title: "Bài học 4", description: "Từ vựng về cảm xúc và con người", unitId: 14, order: 2 },

    // tiếng Trung
    { id: 36, title: "Bài học 1", description: "Từ vựng cơ bản", unitId: 15, order: 1 },
    { id: 37, title: "Bài học 2", description: "Từ vựng về gia đình", unitId: 15, order: 2 },
    { id: 38, title: "Bài học 3", description: "Từ vựng giao tiếp hàng ngày", unitId: 16, order: 1 },
    { id: 39, title: "Bài học 4", description: "Từ vựng về địa điểm và cuộc sống", unitId: 16, order: 2 },
  ]
  const [loading, setLoading] = useState(true)
  useEffect(() => {
  if (!languageId) return
  const filteredUnits = allUnits.filter((u) => u.languageId === languageId)
  const unitIds = filteredUnits.map((u) => u.id)
  const filteredLessons = allLessons.filter((l) => unitIds.includes(l.unitId))

  setUnits(filteredUnits)
  setLessons(filteredLessons)
  setLoading(false) 
}, [languageId])

if (loading) return <Loading />

if (!units.length)
  return (
    <div className="flex flex-col items-center justify-center mt-16">
      <Crying size={128} />
      <p className="text-gray-500 text-lg font-medium mt-4">Không có chương nào cho ngôn ngữ này.</p>
      <button
        onClick={() => router.push("/course/choose")}
        className="mt-2 text-sm text-pink-400 hover:underline"
      >
        Chọn ngôn ngữ khác
      </button>
    </div>
  )
return (
    <div className="space-y-16 mt-8 pl-6">
      {units.map((unit, unitIndex) => {
        const unitLessons = lessons.filter((l) => l.unitId === unit.id)
        const direction = unitIndex % 2 === 0 ? 1 : -1

        return (
          <div key={unit.id} className="flex flex-col items-center">
            <div className="bg-pink-400 text-white rounded-lg shadow-md px-4 py-2 mb-10 w-1/4 text-center">
              <h2 className="text-lg font-bold">{unit.title}</h2>
              <h2 className="text-lg font-bold">{unit.description}</h2>
            </div>

            {/* danh sách bài học */}
            <div className="relative w-full flex flex-col items-center space-y-28">
              {unitLessons.map((lesson, index) => {
                const waveOffset = Math.sin(index * 1.1) * 120 * direction

                return (
                  <div
                    key={lesson.id}
                    className="relative flex flex-col items-center"
                    style={{
                      transform: `translateX(${waveOffset}px)`,
                    }}>
                    {index === 0 && (
                      <motion.span
                        animate={{ y: [0, -6, 0] }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="text-pink-500 font-semibold mb-2">
                        Start
                      </motion.span>
                    )}

                    <motion.div
                      whileHover={{
                        scale: 1.1,
                        boxShadow: "0 0 20px rgba(236,72,153,0.6)",
                      }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="w-20 h-20 flex items-center justify-center rounded-full text-white shadow-lg cursor-pointer bg-pink-400 border-4 border-pink-200"
                       onClick={() => router.push(`/course/lesson?id=${lesson.id}&unit=${unit.id}`)}
                    >
                      <span className="text-lg font-bold">{lesson.order}</span>
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
"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useMemo } from "react"
import { ArrowLeft, Volume2 } from "lucide-react"
import Layout from "@/components/layout"
import UserProgress from "@/components/user-progress"
import Crying from "@/components/crying"

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

type Vocab = {
  ma_tu: number
  ma_bai_hoc: number
  tu: string
  nghia: string
  phien_am: string
  lien_ket_am_thanh: string
  vi_du: string
}

export const mockVocabs: Vocab[] = [
  {
    ma_tu: 1,
    ma_bai_hoc: 1,
    tu: "apple",
    nghia: "quả táo",
    phien_am: "/ˈæp.əl/",
    lien_ket_am_thanh: "/apple.mp3", 
    vi_du: "I like eating an apple every day."
  },
  {
    ma_tu: 2,
    ma_bai_hoc: 1,
    tu: "book",
    nghia: "cuốn sách",
    phien_am: "/bʊk/",
    lien_ket_am_thanh: "/book.mp3",
    vi_du: "This book is very interesting."
  },
  {
    ma_tu: 3,
    ma_bai_hoc: 1,
    tu: "cat",
    nghia: "con mèo",
    phien_am: "/kæt/",
    lien_ket_am_thanh: "/cat.mp3",
    vi_du: "The cat is sleeping on the sofa."
  },
]

export default function LessonPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const playAudio = (src: string) => {
  const audio = new Audio(src)
  audio.play()
}
  const lessonId = Number(searchParams.get("id"))
  const unitId = Number(searchParams.get("unit"))
  
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

  const { lesson, unit } = useMemo(() => {
    const foundLesson = allLessons.find(l => l.id === lessonId) || null
    const foundUnit = allUnits.find(u => u.id === unitId) || null
    return { lesson: foundLesson, unit: foundUnit }
  }, [lessonId, unitId])
  const lessonVocabs = mockVocabs.filter(v => v.ma_bai_hoc === lesson?.id)

if (!lesson || !unit) 
  return(
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <Crying size={150} /> 
      <p className="text-gray-500 text-lg font-medium text-center">
        Không tìm thấy bài học này
      </p>
       <button
        onClick={() => router.push("/course")}
        className="mt-2 text-sm text-pink-500 hover:underline cursor-pointer"
      >
        Chọn bài học khác
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
  {lessonVocabs.length > 0 ? (
    lessonVocabs.map((v) => (
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
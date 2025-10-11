"use client"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"

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

export default function UnitLesson({ languageId }: { languageId: string }) {
  const [units, setUnits] = useState<Unit[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])

  const allUnits: Unit[] = [
  // tiếng Anh
  { id: 1, title: "Chương 1", description: "Bắt đầu với tiếng Anh cơ bản", languageId: "en", order: 1 },
  { id: 2, title: "Chương 2", description: "Cấu trúc câu cơ bản", languageId: "en", order: 2 },

  // tiếng Pháp
  { id: 3, title: "Chương 1", description: "Bắt đầu với tiếng Pháp cơ bản", languageId: "fr", order: 1 },
  { id: 4, title: "Chương 2", description: "Ngữ pháp cơ bản trong tiếng Pháp", languageId: "fr", order: 2 },

  // tiếng Nhật
  { id: 5, title: "Chương 1", description: "Bắt đầu với tiếng Nhật cơ bản", languageId: "ja", order: 1 },
  { id: 6, title: "Chương 2", description: "Cấu trúc câu tiếng Nhật", languageId: "ja", order: 2 },

  // tiếng Hàn
  { id: 7, title: "Chương 1", description: "Bắt đầu với tiếng Hàn cơ bản", languageId: "ko", order: 1 },
  { id: 8, title: "Chương 2", description: "Ngữ pháp và câu giao tiếp cơ bản", languageId: "ko", order: 2 },

  // tiếng Tây Ban Nha
  { id: 9, title: "Chương 1", description: "Bắt đầu với tiếng Tây Ban Nha cơ bản", languageId: "es", order: 1 },
  { id: 10, title: "Chương 2", description: "Ngữ pháp và mẫu câu cơ bản", languageId: "es", order: 2 },

  // tiếng Đức
  { id: 11, title: "Chương 1", description: "Bắt đầu với tiếng Đức cơ bản", languageId: "de", order: 1 },
  { id: 12, title: "Chương 2", description: "Cấu trúc câu và danh từ trong tiếng Đức", languageId: "de", order: 2 },

  // tiếng Ả Rập
  { id: 13, title: "Chương 1", description: "Bắt đầu với tiếng Ả Rập cơ bản", languageId: "ar", order: 1 },
  { id: 14, title: "Chương 2", description: "Phát âm và cấu trúc câu cơ bản", languageId: "ar", order: 2 },

  // tiếng Trung
  { id: 15, title: "Chương 1", description: "Bắt đầu với tiếng Trung cơ bản", languageId: "zh", order: 1 },
  { id: 16, title: "Chương 2", description: "Ngữ pháp và câu giao tiếp thông dụng", languageId: "zh", order: 2 },
]

 const allLessons: Lesson[] = [
  // tiếng Anh
  { id: 1, title: "Bài học 1", description: "Danh từ", unitId: 1, order: 1 },
  { id: 2, title: "Bài học 2", description: "Động từ", unitId: 1, order: 2 },
  { id: 3, title: "Bài học 3", description: "Tính từ", unitId: 1, order: 3 },
  { id: 4, title: "Bài học 4", description: "Câu chào hỏi", unitId: 1, order: 4 },
  { id: 5, title: "Bài học 1", description: "Tạo câu đơn giản", unitId: 2, order: 1 },
  { id: 6, title: "Bài học 2", description: "Đại từ nhân xưng", unitId: 2, order: 2 },
  { id: 7, title: "Bài học 3", description: "Từ nối cơ bản", unitId: 2, order: 3 },

  // tiếng Pháp
  { id: 8, title: "Bài học 1", description: "Câu chào và giới thiệu", unitId: 3, order: 1 },
  { id: 9, title: "Bài học 2", description: "Danh từ và mạo từ", unitId: 3, order: 2 },
  { id: 10, title: "Bài học 3", description: "Động từ être và avoir", unitId: 3, order: 3 },
  { id: 11, title: "Bài học 1", description: "Chia động từ nhóm 1", unitId: 4, order: 1 },
  { id: 12, title: "Bài học 2", description: "Cấu trúc phủ định", unitId: 4, order: 2 },

  // tiếng Nhật
  { id: 13, title: "Bài học 1", description: "Chữ cái Hiragana", unitId: 5, order: 1 },
  { id: 14, title: "Bài học 2", description: "Câu chào hỏi", unitId: 5, order: 2 },
  { id: 15, title: "Bài học 3", description: "Giới thiệu bản thân", unitId: 5, order: 3 },
  { id: 16, title: "Bài học 1", description: "Trợ từ は và を", unitId: 6, order: 1 },
  { id: 17, title: "Bài học 2", description: "Cấu trúc câu khẳng định", unitId: 6, order: 2 },

  // tiếng Hàn
  { id: 18, title: "Bài học 1", description: "Bảng chữ cái Hangul", unitId: 7, order: 1 },
  { id: 19, title: "Bài học 2", description: "Câu chào hỏi cơ bản", unitId: 7, order: 2 },
  { id: 20, title: "Bài học 3", description: "Đại từ nhân xưng", unitId: 7, order: 3 },

  // tiếng Tây Ban Nha
  { id: 21, title: "Bài học 1", description: "Câu chào và lời tạm biệt", unitId: 8, order: 1 },
  { id: 22, title: "Bài học 2", description: "Danh từ và giới tính", unitId: 8, order: 2 },
  { id: 23, title: "Bài học 3", description: "Động từ ser và estar", unitId: 8, order: 3 },

  // tiếng Đức
  { id: 24, title: "Bài học 1", description: "Câu chào và giới thiệu", unitId: 9, order: 1 },
  { id: 25, title: "Bài học 2", description: "Danh từ và mạo từ", unitId: 9, order: 2 },
  { id: 26, title: "Bài học 3", description: "Động từ haben và sein", unitId: 9, order: 3 },

  // tiếng Ả Rập
  { id: 27, title: "Bài học 1", description: "Bảng chữ cái tiếng Ả Rập", unitId: 13, order: 1 },
  { id: 28, title: "Bài học 2", description: "Phát âm cơ bản", unitId: 14, order: 2 },
  { id: 29, title: "Bài học 3", description: "Câu chào hỏi", unitId: 14, order: 3 },

  // tiếng Trung
  { id: 30, title: "Bài học 1", description: "Thanh điệu và pinyin", unitId: 15, order: 1 },
  { id: 31, title: "Bài học 2", description: "Câu chào hỏi cơ bản", unitId: 16, order: 2 },
  { id: 32, title: "Bài học 3", description: "Giới thiệu bản thân", unitId: 16, order: 3 },
]

 useEffect(() => {
    const filteredUnits = allUnits.filter((u) => u.languageId === languageId)
    const unitIds = filteredUnits.map((u) => u.id)
    const filteredLessons = allLessons.filter((l) => unitIds.includes(l.unitId))

    setUnits(filteredUnits)
    setLessons(filteredLessons)
  }, [languageId])

  if (!units.length)
    return <p className="text-gray-500">Không có chương nào cho ngôn ngữ này.</p>

return (
  <div className="space-y-12 mt-8 pl-6">
    {units.map((unit) => {
      const unitLessons = lessons.filter((l) => l.unitId === unit.id)

      return (
        <div key={unit.id} className="flex flex-col items-center">
          <div className="bg-pink-400 text-white rounded-lg shadow-md px-4 py-2 mb-6 w-1/3 text-center">
            <h2 className="text-lg font-bold">{unit.title}</h2>
            <h2 className="text-lg font-bold"> {unit.description}</h2>
          </div>

          {/* danh sách bài học*/}
          <div className="relative w-full flex flex-col items-center space-y-20">
            {unitLessons.map((lesson, index) => {
              const waveOffset = Math.sin(index * 1.2) * 130

              return (
                <div
                  key={lesson.id}
                  className="relative flex flex-col items-center"
                  style={{
                    transform: `translateX(${waveOffset}px)`,
                  }}
                >
                  {/* chữ Start ở trên lesson 1 */}
                  {index === 0 && (
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
                      boxShadow: "0 0 20px rgba(236,72,153,0.6)",
                    }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="w-20 h-20 flex items-center justify-center rounded-full text-white shadow-lg cursor-pointer bg-pink-400 border-4 border-pink-200"
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
"use client"

interface QuizProps {
  onSelect: (id: number) => void;
  showResult: boolean;
  selected: number | null;
  current: number;
}

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
  lua_chon: LuaChonThuThach[]
  hinh_anh?: string  
}

export const mockChallenge: Challenge[] = [
  {
    ma_thu_thach: 1,
    ma_bai_hoc: 1,
    cau_hoi: "What does the word 'apple' mean?",
    loai_thu_thach: "multiple_choice",
    lua_chon: [
      { ma_lua_chon: 1, ma_thu_thach: 1, noi_dung: "quả táo", dung: true },
      { ma_lua_chon: 2, ma_thu_thach: 1, noi_dung: "quả chuối", dung: false },
      { ma_lua_chon: 3, ma_thu_thach: 1, noi_dung: "cuốn sách", dung: false },
      { ma_lua_chon: 4, ma_thu_thach: 1, noi_dung: "con mèo", dung: false },
    ],
  },
  {
    ma_thu_thach: 2,
    ma_bai_hoc: 1,
    cau_hoi: "Choose the correct order: 'I / morning / in / the / study / English'.",
    loai_thu_thach: "word_order",
    lua_chon: [
      { ma_lua_chon: 5, ma_thu_thach: 2, noi_dung: "I study English in the morning.", dung: true },
      { ma_lua_chon: 6, ma_thu_thach: 2, noi_dung: "English I study in the morning.", dung: false },
      { ma_lua_chon: 7, ma_thu_thach: 2, noi_dung: "Morning in the English study I.", dung: false },
    ],
  },
  {
    ma_thu_thach: 3,
    ma_bai_hoc: 1,
    cau_hoi: "Fill in the blank: 'She ____ to school every day.'",
    loai_thu_thach: "fill_blank",
    lua_chon: [
      { ma_lua_chon: 8, ma_thu_thach: 3, noi_dung: "go", dung: false },
      { ma_lua_chon: 9, ma_thu_thach: 3, noi_dung: "goes", dung: true },
      { ma_lua_chon: 10, ma_thu_thach: 3, noi_dung: "gone", dung: false },
    ],
  },
  {
    ma_thu_thach: 4,
    ma_bai_hoc: 1,
    cau_hoi: "Select the correct translation for: 'Con mèo đang ngủ'.",
    loai_thu_thach: "multiple_choice",
    lua_chon: [
      { ma_lua_chon: 11, ma_thu_thach: 4, noi_dung: "The cat is sleeping.", dung: true },
      { ma_lua_chon: 12, ma_thu_thach: 4, noi_dung: "The cat sleeps.", dung: false },
      { ma_lua_chon: 13, ma_thu_thach: 4, noi_dung: "The cats are eating.", dung: false },
      { ma_lua_chon: 14, ma_thu_thach: 4, noi_dung: "The dog is sleeping.", dung: false },
    ],
  },
  {
    ma_thu_thach: 5,
    ma_bai_hoc: 1,
    cau_hoi: "Arrange the words: 'beautiful / city / this / is / very'.",
    loai_thu_thach: "word_order",
    lua_chon: [
      { ma_lua_chon: 15, ma_thu_thach: 5, noi_dung: "This city is very beautiful.", dung: true },
      { ma_lua_chon: 16, ma_thu_thach: 5, noi_dung: "Beautiful this city very is.", dung: false },
      { ma_lua_chon: 17, ma_thu_thach: 5, noi_dung: "This beautiful very is city.", dung: false },
    ],
  },
  {
    ma_thu_thach: 6,
    ma_bai_hoc: 1,
    cau_hoi: "Đây là con gì?",
    loai_thu_thach: "multiple_choice",
    hinh_anh: "/kitty.png", 
    lua_chon: [
      { ma_lua_chon: 18, ma_thu_thach: 6, noi_dung: "cat", dung: true },
      { ma_lua_chon: 19, ma_thu_thach: 6, noi_dung: "dog", dung: false },
      { ma_lua_chon: 20, ma_thu_thach: 6, noi_dung: "monkey", dung: false },
      { ma_lua_chon: 21, ma_thu_thach: 6, noi_dung: "snake", dung: false },
    ],
  },
]

export default function Quiz({ onSelect, showResult, selected, current }: QuizProps) {
  const currentQuestion = mockChallenge[current];

return (
  <main className="flex-1 flex flex-col items-center justify-center text-xl font-medium gap-6">
      {currentQuestion.hinh_anh && (
        <img
          src={currentQuestion.hinh_anh}
          alt="question image"
          className="w-40 h-40 object-contain mb-2"
        />
      )}
    <p>{currentQuestion.cau_hoi}</p>
    <div className="flex flex-col gap-3 w-full max-w-md">
      {currentQuestion.lua_chon.map((choice) => {
        const isSelected = selected === choice.ma_lua_chon
        const isCorrect = choice.dung
        let showColor = "bg-gray-100 border-gray-300 text-gray-800"

        if (showResult) {
          if (isSelected && isCorrect) {
            showColor = "bg-green-400 text-white border-green-500"
          } else if (isSelected && !isCorrect) {
            showColor = "bg-red-400 text-white border-red-500"
          } else if (!isSelected && isCorrect) {
            showColor = "bg-green-300 text-white border-green-400"
          } else {
            showColor = "bg-gray-100 border-gray-300 text-gray-800"
          }
        } else if (isSelected) {
          showColor = "bg-pink-100 border-pink-500 text-pink-700"
        } else {
          showColor = "bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-800"
        }

        return (
          <button
            key={choice.ma_lua_chon}
            onClick={() => onSelect(choice.ma_lua_chon)}
            disabled={showResult}
            className={`px-4 py-2 rounded border text-left transition-all duration-150 ease-out transform
              ${!showResult ? "hover:scale-105 active:scale-95 cursor-pointer" : "cursor-default"}
              ${showColor}`}
          >
            {choice.noi_dung}
          </button>
        )
      })}
    </div>
  </main>
)

}
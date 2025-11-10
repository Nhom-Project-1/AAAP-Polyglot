"use client"

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
interface QuizProps {
  challenge: Challenge
  onSelect: (id: number) => void
  showResult: boolean
  selected: number | null
  isChecking: boolean
}

export default function Quiz({ challenge, onSelect, showResult, selected, isChecking }: QuizProps) {
  if (!challenge) return null

  return (
    <main className="flex-1 flex flex-col items-center justify-center text-xl font-medium gap-6">
      {challenge.hinh_anh && (
        <img
          src={challenge.hinh_anh}
          alt="question image"
          className="w-40 h-40 object-contain mb-2"
        />
      )}
      <p>{challenge.cau_hoi}</p>
      <div className="flex flex-col gap-3 w-full max-w-md">
        {challenge.lua_chon_thu_thach?.map((choice: LuaChonThuThach) => {
          const isSelected = selected === choice.ma_lua_chon
          const isCorrect = choice.dung
          let colorClass = "bg-gray-100 border-gray-300 text-gray-800"
          let hoverClass = "hover:bg-pink-200" // Hiệu ứng hover mặc định

          if (showResult || isChecking) {
            hoverClass = "" // Xóa hiệu ứng hover khi đang kiểm tra hoặc đã có kết quả
            if (isSelected && isCorrect) colorClass = "bg-green-400 text-white border-green-500"
            else if (isSelected && !isCorrect) colorClass = "bg-red-400 text-white border-red-500"
            else if (!isSelected && isCorrect) colorClass = "bg-green-300 text-white border-green-400"
          } else if (isSelected) {
            colorClass = "bg-pink-100 border-pink-500 text-pink-700"
          }

          return (
            <button
              key={choice.ma_lua_chon}
              onClick={() => {
                if (showResult||isChecking) return  
                onSelect(choice.ma_lua_chon)
              }}
              disabled={showResult || isChecking}
              className={`px-4 py-2 rounded border text-left transition-all duration-150 ease-out transform
                ${showResult || isChecking ? "cursor-default" : "hover:scale-105 active:scale-95 cursor-pointer"}
                ${colorClass} ${hoverClass}`}
            >
              {choice.noi_dung}
            </button>
          )
        })}
      </div>
    </main>
  )
}
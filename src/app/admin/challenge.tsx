"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Pencil, Trash, Plus, Search } from "lucide-react"
import toast from "react-hot-toast"

interface Challenge {
ma_thu_thach: string
ma_bai_hoc: string
cau_hoi:string
loai_thu_thach:string
}

const mockData: Challenge[] = Array.from({ length: 100 }).map((_, i) => ({
  ma_thu_thach: `TT${i + 1}`,
  ma_bai_hoc: `L${i + 1}`,
  cau_hoi: `Câu hỏi ${i + 1}`,
  loai_thu_thach: `Loại thử thách ${i + 1}`,
}))

export default function AdminChallenge() {
  const [currentPage, setCurrentPage] = useState(1)
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | null>(null)
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null)
  const [challengeToDelete, setChallengeToDelete] = useState<Challenge | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [data, setData] = useState<Challenge[]>(mockData)
  const [errors, setErrors] = useState({
    ma_bai_hoc: "",
    cau_hoi: "",
    loai_thu_thach: ""
  })
  const [isDirty, setIsDirty] = useState(false)

  const pageSize = 10

  const highlightText = (text: string) => {
    if (!searchTerm) return text
    const regex = new RegExp(`(${searchTerm})`, "gi")
    return text.split(regex).map((part, i) =>
      regex.test(part) ? <span key={i} className="bg-pink-200">{part}</span> : part
    )
  }

  const filteredData = data.filter(challenge =>
    challenge.cau_hoi.toLowerCase().includes(searchTerm.toLowerCase()) 
  )

  const totalPages = Math.ceil(filteredData.length / pageSize)
  const currentData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const handleEdit = (challenge: Challenge) => {
    setEditingChallenge(challenge)
    setModalType("edit")
    setErrors({ ma_bai_hoc: "", cau_hoi: "", loai_thu_thach: "" })
    setIsDirty(false)
  }

  const handleDelete = (challenge: Challenge) => {
    toast.dismiss()
    setChallengeToDelete(challenge)
    setModalType("delete")
  }

  const handleSave = (challenge: Challenge, isEdit: boolean) => {
    const newErrors = {
      ma_bai_hoc: "",
      cau_hoi: "",
      loai_thu_thach: ""
    }
    setErrors(newErrors)
    if (!challenge.ma_bai_hoc.trim()) {
      newErrors.ma_bai_hoc = "Mã bài học không được để trống"
      setErrors(newErrors)
    }
    if (!challenge.cau_hoi.trim()) {
      newErrors.cau_hoi = "Câu hỏi không được để trống"
      setErrors(newErrors)
    }
    if (!challenge.loai_thu_thach.trim()) {
      newErrors.loai_thu_thach = "Loại thử thách không được để trống"
      setErrors(newErrors)
    }
    if (newErrors.ma_bai_hoc || newErrors.cau_hoi || newErrors.loai_thu_thach) {
        setErrors(newErrors)
        return
    }
    if (isEdit) {
      toast.dismiss()
      setData(prev => prev.map(c => c.ma_thu_thach === editingChallenge?.ma_thu_thach ? { ...c, ...challenge } : c))
      toast.success("Sửa thử thách thành công!")
    } else {
      toast.dismiss()
      const maxId = data.reduce((max, item) => {
        const num = parseInt(item.ma_thu_thach.replace('TT','')) || 0
        return num > max ? num : max
      }, 0)
      challenge.ma_thu_thach = `TT${maxId + 1}`
      setData(prev => [...prev, challenge])
      toast.success("Thêm thử thách thành công!")
    }

    setModalType(null)
    setEditingChallenge(null)
    setErrors({ ma_bai_hoc: "", cau_hoi: "", loai_thu_thach: "" })
    setIsDirty(false)
  }

  return (
    <div>
      {/* header + search + thêm */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-semibold text-pink-500">Danh sách thử thách</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo câu hỏi"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1) }}
              className="border px-8 py-2 rounded-md w-64"
            />
          </div>
          <button
            onClick={() => {
              setEditingChallenge(null)
              setModalType("add")
              setErrors({ ma_bai_hoc: "", cau_hoi: "", loai_thu_thach: "" })
              setIsDirty(false)
            }}
            className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Thêm thử thách
          </button>
        </div>
      </div>

      {/* bảng */}
      <div className="overflow-x-auto bg-white rounded-md shadow-md">
        <table className="w-full table-auto border-collapse">
          <thead className="bg-pink-50 text-slate-700">
            <tr>
              <th className="px-4 py-2 text-left">Mã thử thách</th>
              <th className="px-4 py-2 text-left">Mã bài học</th>
              <th className="px-4 py-2 text-left">Câu hỏi</th>
              <th className="px-4 py-2 text-left">Loại thử thách</th>
              <th className="px-4 py-2 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map(challenge => (
              <tr key={challenge.ma_thu_thach} className="hover:bg-pink-50">
                <td className="px-4 py-2">{challenge.ma_thu_thach}</td>
                <td className="px-4 py-2">{challenge.ma_bai_hoc}</td>
                <td className="px-4 py-2">{highlightText(challenge.cau_hoi)}</td>
                <td className="px-4 py-2">{challenge.loai_thu_thach}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button onClick={() => handleEdit(challenge)} className="p-1 rounded-md bg-yellow-100 hover:bg-yellow-200 cursor-pointer">
                    <Pencil className="w-4 h-4 text-yellow-600" />
                  </button>
                  <button onClick={() => handleDelete(challenge)} className="p-1 rounded-md bg-red-100 hover:bg-red-200 cursor-pointer">
                    <Trash className="w-4 h-4 text-red-600" />
                  </button>
                </td>
              </tr>
            ))}
            {currentData.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4 text-slate-500">Không có kết quả</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      <div className="flex justify-center items-center gap-2 mt-4 py-2">
        <button 
          onClick={() => setCurrentPage(1)} 
          disabled={currentPage===1} 
          className={`px-1 transition-colors ${currentPage===1?'text-pink-500 cursor-default':'text-pink-500 hover:text-pink-700 cursor-pointer'}`}
        >&lt;&lt;</button>

        <button 
          onClick={() => setCurrentPage(p => Math.max(p-1,1))} 
          disabled={currentPage===1} 
          className={`px-1 transition-colors ${currentPage===1?'text-pink-500 cursor-default':'text-pink-500 hover:text-pink-700 cursor-pointer'}`}
        >&lt;</button>

        {(() => {
          const pagesToShow = 5
          let start = Math.max(1, currentPage - 2)
          let end = Math.min(totalPages, start + pagesToShow - 1)
          if (end - start < pagesToShow - 1) start = Math.max(1, end - pagesToShow + 1)
          return Array.from({ length: end - start + 1 }, (_, i) => start + i)
        })().map(page => (
          <button 
            key={page} 
            onClick={() => setCurrentPage(page)} 
            className={`px-3 py-1 rounded-md transition-colors border ${page===currentPage?'bg-pink-500 text-white border-pink-500 cursor-default':'bg-white text-pink-500 border-pink-300 hover:bg-pink-100 cursor-pointer'}`}
          >
            {page}
          </button>
        ))}

        <button 
          onClick={() => setCurrentPage(p => Math.min(p+1,totalPages))} 
          disabled={currentPage===totalPages} 
          className={`px-1 transition-colors ${currentPage===totalPages?'text-pink-500 cursor-default':'text-pink-500 hover:text-pink-700 cursor-pointer'}`}
        >&gt;</button>

        <button 
          onClick={() => setCurrentPage(totalPages)} 
          disabled={currentPage===totalPages} 
          className={`px-1 transition-colors ${currentPage===totalPages?'text-pink-500 cursor-default':'text-pink-500 hover:text-pink-700 cursor-pointer'}`}
        >&gt;&gt;</button>
      </div>

      {/* Modal Thêm / Sửa / Xóa */}
      <AnimatePresence>
        {modalType && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <motion.div initial={{scale:0.9}} animate={{scale:1}} exit={{scale:0.9}} className="bg-white rounded-md p-6 w-96 shadow-lg">
              {/* Thêm / Sửa */}
              {(modalType === "add" || modalType === "edit") && (
                <>
                  <h3 className="text-lg font-semibold mb-4">{modalType === "edit" ? "Sửa thử thách" : "Thêm thử thách"}</h3>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">Mã bài học</label>
                      <input id="mabaihoc" type="text" defaultValue={editingChallenge?.ma_bai_hoc || ""} className="border px-3 py-2 rounded-md w-full" onChange={() => setIsDirty(true)} />
                      {errors.ma_bai_hoc && <span className="text-red-500 text-sm mt-1">{errors.ma_bai_hoc}</span>}
                    </div>
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">Câu hỏi</label>
                      <input id="cau" type="text" defaultValue={editingChallenge?.cau_hoi || ""} className="border px-3 py-2 rounded-md w-full" onChange={() => setIsDirty(true)} />
                      {errors.cau_hoi && <span className="text-red-500 text-sm mt-1">{errors.cau_hoi}</span>}
                    </div>
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">Loại thử thách</label>
                      <input id="type" type="text" defaultValue={editingChallenge?.loai_thu_thach || ""} className="border px-3 py-2 rounded-md w-full" onChange={() => setIsDirty(true)} />
                      {errors.loai_thu_thach && <span className="text-red-500 text-sm mt-1">{errors.loai_thu_thach}</span>}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button onClick={() => setModalType(null)} className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 cursor-pointer">Hủy</button>
                    <button
                      onClick={() => {
                        if (!isDirty) return
                        const maBaiHocInput = (document.getElementById('mabaihoc') as HTMLInputElement).value
                        const cauInput = (document.getElementById('cau') as HTMLInputElement).value
                        const loaiInput = (document.getElementById('type') as HTMLInputElement).value
                        handleSave(
                          {
                            ma_thu_thach: editingChallenge?.ma_thu_thach || '',
                            ma_bai_hoc: maBaiHocInput,
                            cau_hoi: cauInput,
                            loai_thu_thach: loaiInput,
                          },
                          modalType === "edit"
                        )
                      }}
                      className={`px-4 py-2 rounded-md text-white transition-colors ${isDirty?'bg-pink-500 hover:bg-pink-600 cursor-pointer':'bg-gray-300 cursor-default'}`}
                    >
                      Lưu
                    </button>
                  </div>
                </>
              )}

              {/* Xóa */}
              {modalType === "delete" && challengeToDelete && (
                <>
                  <h3 className="text-lg font-semibold mb-4 text-red-600">Xác nhận xóa</h3>
                  <p className="mb-4">Bạn có chắc muốn xóa từ vựng <strong>{challengeToDelete.cau_hoi}</strong> không?</p>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setModalType(null)} className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 cursor-pointer">Hủy</button>
                    <button
                      onClick={() => {
                        setData(prev => prev.filter(c => c.ma_thu_thach !== challengeToDelete.ma_thu_thach))
                        setModalType(null)
                        toast.success("Xóa thành công!")
                      }}
                      className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                    >
                      Xóa
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
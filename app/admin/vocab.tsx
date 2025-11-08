"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Pencil, Trash, Plus, Search } from "lucide-react"
import toast from "react-hot-toast"

interface Vocab {
ma_tu: string
ma_bai_hoc: string
tu:string
nghia:string
lien_ket_am_thanh:string
phien_am:string
vi_du:string
}

const mockData: Vocab[] = Array.from({ length: 100 }).map((_, i) => ({
  ma_tu: `T${i + 1}`,
  ma_bai_hoc: `L${i + 1}`,
  tu: `word ${i + 1}`,
  nghia: `nghĩa của word ${i + 1}`,
  lien_ket_am_thanh: `/audio/word${i + 1}.mp3`,
  phien_am: `/wɜːd${i + 1}/`,
  vi_du: `Ví dụ cho từ ${i + 1}.`
}))


export default function AdminVocab() {
  const [currentPage, setCurrentPage] = useState(1)
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | null>(null)
  const [editingWord, setEditingWord] = useState<Vocab | null>(null)
  const [wordToDelete, setWordToDelete] = useState<Vocab | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [data, setData] = useState<Vocab[]>(mockData)
  const [errors, setErrors] = useState({
    ma_bai_hoc: "",
    tu: "",
    nghia: "",
    lien_ket_am_thanh: "",
    phien_am: ""
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

  const filteredData = data.filter(word =>
    word.tu.toLowerCase().includes(searchTerm.toLowerCase()) ||
    word.nghia.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredData.length / pageSize)
  const currentData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const handleEdit = (word: Vocab) => {
    setEditingWord(word)
    setModalType("edit")
    setErrors({
      ma_bai_hoc: "",
      tu: "",
      nghia: "",
      lien_ket_am_thanh: "",
      phien_am: ""
    })
    setIsDirty(false)
  }

  const handleDelete = (word: Vocab) => {
    toast.dismiss()
    setWordToDelete(word)
    setModalType("delete")
  }

  const handleSave = (word: Vocab, isEdit: boolean) => {
    const newErrors = {ma_bai_hoc:"", tu:"", nghia:"", lien_ket_am_thanh:"", phien_am:""}
    if (!word.ma_bai_hoc.trim()) {
      newErrors.ma_bai_hoc = "Mã bài học không được để trống"
    }
    if (!word.tu.trim()) {
      newErrors.tu = "Từ vựng không được để trống"
    }
    if (!word.nghia.trim()) {
      newErrors.nghia = "Nghĩa không được để trống"
    }
    if (!word.lien_ket_am_thanh.trim()) {
      newErrors.lien_ket_am_thanh = "Liên kết âm thanh không được để trống"
    }
    if (!word.phien_am.trim()) {
      newErrors.phien_am = "Phiên âm không được để trống"
    }
    if (newErrors.ma_bai_hoc || newErrors.tu || newErrors.nghia || newErrors.lien_ket_am_thanh || newErrors.phien_am) {
      setErrors(newErrors)
      return
    }
    if (isEdit) {
      toast.dismiss()
      setData(prev => prev.map(w => w.ma_tu === editingWord?.ma_tu ? { ...w, ...word } : w))
      toast.success("Sửa từ vựng thành công!")
    } else {
      toast.dismiss()
      const maxId = data.reduce((max, item) => {
        const num = parseInt(item.ma_tu.replace('T','')) || 0
        return num > max ? num : max
      }, 0)
      word.ma_tu = `T${maxId + 1}`
      setData(prev => [...prev, word])
      toast.success("Thêm từ vựng thành công!")
    }

    setModalType(null)
    setEditingWord(null)
    setErrors({
                ma_bai_hoc: "",
                tu: "",
                nghia: "",
                lien_ket_am_thanh: "",
                phien_am: ""
              })
    setIsDirty(false)
  }

  return (
    <div>
      {/* header + search + thêm */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-semibold text-pink-500">Danh sách từ vựng</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo từ hoặc nghĩa"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1) }}
              className="border px-8 py-2 rounded-md w-64"
            />
          </div>
          <button
            onClick={() => {
              setEditingWord(null)
              setModalType("add")
              setErrors({
                ma_bai_hoc: "",
                tu: "",
                nghia: "",
                lien_ket_am_thanh: "",
                phien_am: ""
              })
              setIsDirty(false)
            }}
            className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Thêm từ vựng
          </button>
        </div>
      </div>

      {/* bảng */}
      <div className="overflow-x-auto bg-white rounded-md shadow-md">
        <table className="w-full table-auto border-collapse">
          <thead className="bg-pink-50 text-slate-700">
            <tr>
              <th className="px-4 py-2 text-left">Mã từ vựng</th>
              <th className="px-4 py-2 text-left">Mã bài học</th>
              <th className="px-4 py-2 text-left">Từ vựng</th>
              <th className="px-4 py-2 text-left">Nghĩa</th>
              <th className="px-4 py-2 text-left">Liên kết âm thanh</th>
              <th className="px-4 py-2 text-left">Phiên âm</th>
              <th className="px-4 py-2 text-left">Ví dụ</th>
              <th className="px-4 py-2 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map(word => (
              <tr key={word.ma_tu} className="hover:bg-pink-50">
                <td className="px-4 py-2">{word.ma_tu}</td>
                <td className="px-4 py-2">{word.ma_bai_hoc}</td>
                <td className="px-4 py-2">{highlightText(word.tu)}</td>
                <td className="px-4 py-2">{highlightText(word.nghia)}</td>
                <td className="px-4 py-2">{highlightText(word.lien_ket_am_thanh)}</td>
                <td className="px-4 py-2">{highlightText(word.phien_am)}</td>
                <td className="px-4 py-2">{highlightText(word.vi_du)}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button onClick={() => handleEdit(word)} className="p-1 rounded-md bg-yellow-100 hover:bg-yellow-200 cursor-pointer">
                    <Pencil className="w-4 h-4 text-yellow-600" />
                  </button>
                  <button onClick={() => handleDelete(word)} className="p-1 rounded-md bg-red-100 hover:bg-red-200 cursor-pointer">
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
                  <h3 className="text-lg font-semibold mb-4">{modalType === "edit" ? "Sửa từ vựng" : "Thêm từ vựng"}</h3>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">Mã bài học</label>
                      <input id="mabaihoc" type="text" defaultValue={editingWord?.ma_bai_hoc || ""} className="border px-3 py-2 rounded-md w-full" onChange={() => setIsDirty(true)} />
                      {errors.ma_bai_hoc && <span className="text-red-500 text-sm mt-1">{errors.ma_bai_hoc}</span>}
                    </div>
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">Từ vựng</label>
                      <input id="name" type="text" defaultValue={editingWord?.tu || ""} className="border px-3 py-2 rounded-md w-full" onChange={() => setIsDirty(true)} />
                      {errors.tu && <span className="text-red-500 text-sm mt-1">{errors.tu}</span>}
                    </div>
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">Nghĩa</label>
                      <input id="mean" type="text" defaultValue={editingWord?.nghia || ""} className="border px-3 py-2 rounded-md w-full" onChange={() => setIsDirty(true)} />
                      {errors.nghia && <span className="text-red-500 text-sm mt-1">{errors.nghia}</span>}
                    </div>
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">Liên kết âm thanh</label>
                      <input id="sound" type="text" defaultValue={editingWord?.lien_ket_am_thanh || ""} className="border px-3 py-2 rounded-md w-full" onChange={() => setIsDirty(true)} />
                      {errors.lien_ket_am_thanh && <span className="text-red-500 text-sm mt-1">{errors.lien_ket_am_thanh}</span>}
                    </div>
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">Phiên âm</label>
                      <input id="trans" type="text" defaultValue={editingWord?.tu || ""} className="border px-3 py-2 rounded-md w-full" onChange={() => setIsDirty(true)} />
                      {errors.phien_am && <span className="text-red-500 text-sm mt-1">{errors.phien_am}</span>}
                    </div>
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">Ví dụ</label>
                      <input id="example" type="text" defaultValue={editingWord?.vi_du || ""} className="border px-3 py-2 rounded-md w-full" onChange={() => setIsDirty(true)} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button onClick={() => setModalType(null)} className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 cursor-pointer">Hủy</button>
                    <button
                      onClick={() => {
                        if (!isDirty) return
                        const maBaiHocInput = (document.getElementById('mabaihoc') as HTMLInputElement).value
                        const nameInput = (document.getElementById('name') as HTMLInputElement).value
                        const meanInput = (document.getElementById('mean') as HTMLInputElement).value
                        const soundInput = (document.getElementById('sound') as HTMLInputElement).value
                        const transInput = (document.getElementById('trans') as HTMLInputElement).value
                        const exInput = (document.getElementById('example') as HTMLInputElement).value
                        handleSave(
                          {
                            ma_tu: editingWord?.ma_tu || '',
                            ma_bai_hoc: maBaiHocInput,
                            tu: nameInput,
                            nghia: meanInput,
                            lien_ket_am_thanh: soundInput,
                            phien_am: transInput,
                            vi_du: exInput
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
              {modalType === "delete" && wordToDelete && (
                <>
                  <h3 className="text-lg font-semibold mb-4 text-red-600">Xác nhận xóa</h3>
                  <p className="mb-4">Bạn có chắc muốn xóa từ vựng <strong>{wordToDelete.tu}</strong> không?</p>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setModalType(null)} className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 cursor-pointer">Hủy</button>
                    <button
                      onClick={() => {
                        setData(prev => prev.filter(w => w.ma_tu !== wordToDelete.ma_tu))
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
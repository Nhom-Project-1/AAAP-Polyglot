"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Pencil, Trash, Plus, Search } from "lucide-react"
import toast from "react-hot-toast"

interface Vocab {
  ma_tu: string
  ma_bai_hoc: string
  tu: string
  nghia: string
  lien_ket_am_thanh: string
  phien_am: string
  vi_du: string
}

export default function AdminVocab() {
  const [data, setData] = useState<Vocab[]>([])
  const [loading, setLoading] = useState(true) // Giữ nguyên là true
  const [currentPage, setCurrentPage] = useState(1)
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | null>(null)
  const [editingWord, setEditingWord] = useState<Vocab | null>(null)
  const [wordToDelete, setWordToDelete] = useState<Vocab | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [errors, setErrors] = useState({
    ma_bai_hoc: "",
    tu: "",
    nghia: "",
    lien_ket_am_thanh: "",
    phien_am: "",
    ma_tu: ""
  })
  const [isDirty, setIsDirty] = useState(false)

  const [modalInputs, setModalInputs] = useState<Vocab>({
    ma_tu: "",
    ma_bai_hoc: "",
    tu: "",
    nghia: "",
    lien_ket_am_thanh: "",
    phien_am: "",
    vi_du: ""
  })

  const pageSize = 10

  // --- FETCH DATA ---
  const fetchVocabs = async (q = "") => {
    setLoading(true)
      try {
      const res = await fetch(`/api/admin/vocabs${q ? `?q=${q}` : ""}`, {
        method: "GET",
        credentials: "include"   
      })
      if (!res.ok) throw new Error((await res.json()).message || "Lỗi khi lấy dữ liệu từ server")
      const json = await res.json()
      setData(json.data)
    } catch (err: any) {
      toast.error(err.message || "Không thể lấy dữ liệu từ server")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchVocabs(searchTerm)
    }, 300) 

    return () => clearTimeout(delay)
  }, [searchTerm])

  // --- CRUD API ---
  // --- Thêm từ ---
const addVocab = async (word: Vocab) => {
  try {
    const res = await fetch("/api/admin/vocabs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(word),
    })
    if (!res.ok) throw new Error((await res.json()).message || "Thêm thất bại")

    await fetchVocabs(searchTerm)
    toast.success("Thêm từ vựng thành công!")
    return true // Trả về true khi thành công
  } catch (err: any) {
    toast.error(err.message || "Thêm thất bại")
    return false // Trả về false khi thất bại
  }
}


// --- Sửa từ ---
const editVocab = async (word: Vocab) => {
  try {
    const res = await fetch("/api/admin/vocabs", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(word),
    })
    if (!res.ok) throw new Error((await res.json()).message || "Sửa thất bại")
    // Tải lại dữ liệu để đảm bảo tính nhất quán
    await fetchVocabs(searchTerm)
    toast.success("Sửa từ vựng thành công!")
    return true // Trả về true khi thành công
  } catch (err: any) {
    toast.error(err.message || "Sửa thất bại")
    return false // Trả về false khi thất bại
  }
}

// --- Xóa từ ---
const deleteVocab = async (ma_tu: string) => {
  try {
    const res = await fetch(`/api/admin/vocabs?id=${ma_tu}`, {
      method: "DELETE",
      credentials: "include"
    })
    if (!res.ok) throw new Error((await res.json()).message || "Xóa thất bại")
    await fetchVocabs(searchTerm)
    toast.success("Xóa thành công!")
  } catch (err: any) {
    toast.error(err.message || "Xóa thất bại")
  }
}

  // --- PAGINATION ---
  const filteredData = data // Dữ liệu đã được lọc từ API


  const totalPages = Math.ceil(filteredData.length / pageSize)
  const currentData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  // --- UTILS ---
  const highlightText = (text: string | null | undefined) => {
    if (!text) return ""   
    if (!searchTerm) return text
    const regex = new RegExp(`(${searchTerm})`, "gi")
    return text.split(regex).map((part, i) =>
      regex.test(part) ? <span key={i} className="bg-pink-200">{part}</span> : part
    )
  }

  const handleEdit = (word: Vocab) => {
    setEditingWord(word)
    setModalType("edit")
    setErrors({ ma_bai_hoc: "", tu: "", nghia: "", lien_ket_am_thanh: "", phien_am: "", ma_tu: "" })
    setIsDirty(false)
  }

  const handleDelete = (word: Vocab) => {
    toast.dismiss()
    setWordToDelete(word)
    setModalType("delete")
  }

const handleSave = async (word: Vocab, isEdit: boolean) => {
  const newErrors = {
    ma_bai_hoc: "",
    tu: "",
    nghia: "",
    lien_ket_am_thanh: "",
    phien_am: "",
    ma_tu: ""
  }

  // --- check required ---
  if (!String(word.ma_bai_hoc || "").trim()) newErrors.ma_bai_hoc = "Mã bài học không được để trống"
  if (!String(word.tu || "").trim()) newErrors.tu = "Từ vựng không được để trống"
  if (!String(word.nghia || "").trim()) newErrors.nghia = "Nghĩa không được để trống"
  if (!String(word.lien_ket_am_thanh || "").trim()) newErrors.lien_ket_am_thanh = "Liên kết âm thanh không được để trống"
  if (!String(word.phien_am || "").trim()) newErrors.phien_am = "Phiên âm không được để trống"
  if (!/^\d+$/.test(word.ma_bai_hoc)) newErrors.ma_bai_hoc = "Mã bài học chỉ được nhập số"
  if (word.ma_bai_hoc && !/^\d+$/.test(word.ma_bai_hoc)) newErrors.ma_bai_hoc = "Mã bài học chỉ được nhập số"
  if (word.ma_tu && !/^\d+$/.test(word.ma_tu)) newErrors.ma_tu = "Mã từ vựng chỉ được nhập số"
  if (Object.values(newErrors).some(e => e)) {
    setErrors(newErrors)
    return
  }

  let success = false;
  if (isEdit) {
    success = await editVocab(word);
  } else {
    success = await addVocab(word);
  }

  // Đóng modal và reset form nếu thao tác (thêm hoặc sửa) thành công
  if (success) {
    setModalType(null);
    setEditingWord(null);
    setIsDirty(false);
    setErrors({ ma_bai_hoc: "", tu: "", nghia: "", lien_ket_am_thanh: "", phien_am: "", ma_tu: "" });
  }
}


  useEffect(() => {
    if (editingWord) setModalInputs(editingWord)
    else setModalInputs({ ma_tu:"", ma_bai_hoc:"", tu:"", nghia:"", lien_ket_am_thanh:"", phien_am:"", vi_du:"" })
  }, [editingWord, modalType])

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
              setErrors({ ma_bai_hoc: "", tu: "", nghia: "", lien_ket_am_thanh: "", phien_am: "", ma_tu: "" })
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
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-4 text-slate-500">Đang tải...</td>
              </tr>
            ) : currentData.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-4 text-slate-500">Không có kết quả</td>
              </tr>
            ) : currentData.map(word => (
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

        <button onClick={() => setCurrentPage(p => Math.min(p+1,totalPages))} disabled={currentPage===totalPages || totalPages === 0} className={`px-1 transition-colors ${currentPage===totalPages || totalPages === 0 ?'text-pink-500 cursor-default':'text-pink-500 hover:text-pink-700 cursor-pointer'}`}>{">"}</button>
        <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage===totalPages || totalPages === 0} className={`px-1 transition-colors ${currentPage===totalPages || totalPages === 0 ?'text-pink-500 cursor-default':'text-pink-500 hover:text-pink-700 cursor-pointer'}`}>{">>"}</button>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalType && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <motion.div initial={{scale:0.9}} animate={{scale:1}} exit={{scale:0.9}} className="bg-white rounded-md p-6 w-96 shadow-lg">
              {(modalType==="add" || modalType==="edit") && (
                <>
                  <h3 className="text-lg font-semibold mb-4">{modalType==="edit" ? "Sửa từ vựng" : "Thêm từ vựng"}</h3>
                  <div className="flex flex-col gap-2">
                    {["ma_bai_hoc","tu","nghia","lien_ket_am_thanh","phien_am","vi_du"].map(field => (
                      <div key={field} className="flex flex-col">
                        <label className="mb-1 text-sm font-medium text-gray-700">{field.replace(/_/g," ")}</label>
                        <input
                          type="text"
                          value={modalInputs[field as keyof Vocab] || ""}
                          onChange={e => {
                            let val = e.target.value
                            if (field === "ma_bai_hoc" || field === "ma_tu") {
                              val = val.replace(/\D/g, "") 
                            }
                            setModalInputs({...modalInputs, [field]: val})
                            setIsDirty(true)
                          }}
                          className="border px-3 py-2 rounded-md w-full"
                        />
                        {errors[field as keyof typeof errors] && <span className="text-red-500 text-sm mt-1">{errors[field as keyof typeof errors]}</span>}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button onClick={() => setModalType(null)} className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 cursor-pointer">Hủy</button>
                    <button
                      onClick={() => { if (isDirty) handleSave(modalInputs, modalType==="edit") }}
                      className={`px-4 py-2 rounded-md text-white ${isDirty?'bg-pink-500 hover:bg-pink-600':'bg-gray-300 cursor-default'}`}
                    >Lưu</button>
                  </div>
                </>
              )}

              {modalType==="delete" && wordToDelete && (
                <>
                  <h3 className="text-lg font-semibold mb-4 text-red-600">Xác nhận xóa</h3>
                  <p className="mb-4">Bạn có chắc muốn xóa từ vựng <strong>{wordToDelete.tu}</strong> không?</p>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setModalType(null)} className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 cursor-pointer">Hủy</button>
                    <button onClick={() => { deleteVocab(wordToDelete.ma_tu); setModalType(null) }} className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 cursor-pointer">Xóa</button>
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
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Pencil, Trash, Plus, Search } from "lucide-react"
import toast from "react-hot-toast"

interface Language {
  ma_ngon_ngu: string
  ten_ngon_ngu: string
  mo_ta: string
}

export default function AdminLanguage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | null>(null)
  const [editingLang, setEditingLang] = useState<Language | null>(null)
  const [langToDelete, setLangToDelete] = useState<Language | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [data, setData] = useState<Language[]>([])
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState({
    ten_ngon_ngu: "",
    mo_ta: ""
  })
  const [isDirty, setIsDirty] = useState(false)

  const pageSize = 10
  const API_URL = "/api/language" 

  // Fetch dữ liệu từ API
  const fetchLanguages = async (query = "") => {
    try {
      setLoading(true)
      const url = query ? `${API_URL}?q=${encodeURIComponent(query)}` : API_URL
      const res = await fetch(url)
      if (!res.ok) throw new Error("Không thể tải dữ liệu")
      const result = await res.json()
      setData(result)
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi tải dữ liệu ngôn ngữ")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLanguages()
  }, [])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLanguages(searchTerm)
      setCurrentPage(1)
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm])

  const highlightText = (text: string) => {
    if (!searchTerm) return text
    const regex = new RegExp(`(${searchTerm})`, "gi")
    return text.split(regex).map((part, i) =>
      regex.test(part) ? <span key={i} className="bg-pink-200">{part}</span> : part
    )
  }

  const filteredData = data
  const totalPages = Math.ceil(filteredData.length / pageSize)
  const currentData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const handleEdit = (lang: Language) => {
    setEditingLang(lang)
    setModalType("edit")
    setErrors({ ten_ngon_ngu: "", mo_ta: "" })
    setIsDirty(false)
  }

  const handleDelete = (lang: Language) => {
    setLangToDelete(lang)
    setModalType("delete")
  }

  const handleSave = async (lang: Language, isEdit: boolean) => {
  const newErrors = { ten_ngon_ngu: "", mo_ta: "" }
  if (!lang.ten_ngon_ngu.trim()) newErrors.ten_ngon_ngu = "Tên ngôn ngữ không được để trống"
  if (!lang.mo_ta.trim()) newErrors.mo_ta = "Mô tả không được để trống"
  if (newErrors.ten_ngon_ngu || newErrors.mo_ta) {
    setErrors(newErrors)
    return
  }

  try {
    if (isEdit) {
      const res = await fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ma_ngon_ngu: editingLang?.ma_ngon_ngu,
          ten_ngon_ngu: (document.getElementById('name') as HTMLInputElement).value,
          mo_ta: (document.getElementById('desc') as HTMLInputElement).value
        })
      })
      if (!res.ok) throw new Error((await res.json()).message || "Cập nhật thất bại")
      toast.success("Sửa ngôn ngữ thành công!")
    } else {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ten_ngon_ngu: (document.getElementById('name') as HTMLInputElement).value,
          mo_ta: (document.getElementById('desc') as HTMLInputElement).value
        })
      })
      if (!res.ok) throw new Error((await res.json()).message || "Thêm thất bại")
      toast.success(`Thêm ngôn ngữ thành công!`)
    }
    fetchLanguages(searchTerm)
  } catch (error: any) {
    toast.error(error.message)
  }

  setModalType(null)
  setEditingLang(null)
  setErrors({ ten_ngon_ngu: "", mo_ta: "" })
  setIsDirty(false)
}

  const confirmDelete = async () => {
    if (!langToDelete) return
    try {
      const res = await fetch(`${API_URL}?ma_ngon_ngu=${langToDelete.ma_ngon_ngu}`, {
        method: "DELETE"
      })
      if (!res.ok) throw new Error((await res.json()).message || "Xóa thất bại")
      toast.success("Xóa thành công!")
      fetchLanguages(searchTerm)
    } catch (error: any) {
      toast.error(error.message)
    }
    setModalType(null)
    setLangToDelete(null)
  }

  return (
    <div>
      {/* header + search + thêm */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-semibold text-pink-500">Danh sách ngôn ngữ</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc mô tả"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="border px-8 py-2 rounded-md w-64"
            />
          </div>
          <button
            onClick={() => {
              setEditingLang({ ma_ngon_ngu: "", ten_ngon_ngu: "", mo_ta: "" })
              setModalType("add")
              setErrors({ ten_ngon_ngu: "", mo_ta: "" })
              setIsDirty(false)
            }}
            className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Thêm ngôn ngữ
          </button>
        </div>
      </div>

      {/* bảng */}
      <div className="overflow-x-auto bg-white rounded-md shadow-md">
        <table className="w-full table-auto border-collapse">
          <thead className="bg-pink-50 text-slate-700">
            <tr>
              <th className="px-4 py-2 text-left">Mã ngôn ngữ</th>
              <th className="px-4 py-2 text-left">Tên ngôn ngữ</th>
              <th className="px-4 py-2 text-left">Mô tả</th>
              <th className="px-4 py-2 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-4 text-slate-500">Đang tải...</td>
              </tr>
            ) : currentData.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-4 text-slate-500">Không có kết quả</td>
              </tr>
            ) : (
              currentData.map(lang => (
                <tr key={lang.ma_ngon_ngu} className="hover:bg-pink-50">
                  <td className="px-4 py-2">{lang.ma_ngon_ngu}</td>
                  <td className="px-4 py-2">{highlightText(lang.ten_ngon_ngu)}</td>
                  <td className="px-4 py-2">{highlightText(lang.mo_ta)}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button onClick={() => handleEdit(lang)} className="p-1 rounded-md bg-yellow-100 hover:bg-yellow-200 cursor-pointer">
                      <Pencil className="w-4 h-4 text-yellow-600" />
                    </button>
                    <button onClick={() => handleDelete(lang)} className="p-1 rounded-md bg-red-100 hover:bg-red-200 cursor-pointer">
                      <Trash className="w-4 h-4 text-red-600" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4 py-2">
          <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className={`px-1 transition-colors ${currentPage === 1 ? 'text-pink-500 cursor-default' : 'text-pink-500 hover:text-pink-700 cursor-pointer'}`}>&lt;&lt;</button>
          <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className={`px-1 transition-colors ${currentPage === 1 ? 'text-pink-500 cursor-default' : 'text-pink-500 hover:text-pink-700 cursor-pointer'}`}>&lt;</button>

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
              className={`px-3 py-1 rounded-md transition-colors border ${page === currentPage ? 'bg-pink-500 text-white border-pink-500 cursor-default' : 'bg-white text-pink-500 border-pink-300 hover:bg-pink-100 cursor-pointer'}`}
            >
              {page}
            </button>
          ))}

          <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className={`px-1 transition-colors ${currentPage === totalPages ? 'text-pink-500 cursor-default' : 'text-pink-500 hover:text-pink-700 cursor-pointer'}`}>&gt;</button>
          <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className={`px-1 transition-colors ${currentPage === totalPages ? 'text-pink-500 cursor-default' : 'text-pink-500 hover:text-pink-700 cursor-pointer'}`}>&gt;&gt;</button>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modalType && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-md p-6 w-96 shadow-lg">
              {/* Thêm / Sửa */}
              {(modalType === "add" || modalType === "edit") && (
                <>
                  <h3 className="text-lg font-semibold mb-4">{modalType === "edit" ? "Sửa ngôn ngữ" : "Thêm ngôn ngữ"}</h3>
                  <div className="flex flex-col gap-2">
                    {modalType === "edit" && (
                      <div className="flex flex-col">
                        <label className="mb-1 text-sm font-medium text-gray-700">Mã ngôn ngữ</label>
                        <input type="text" value={editingLang?.ma_ngon_ngu || ""} disabled className="border px-3 py-2 rounded-md w-full bg-gray-50" />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">Tên ngôn ngữ</label>
                      <input
                        id="name"
                        type="text"
                        defaultValue={editingLang?.ten_ngon_ngu || ""}
                        className="border px-3 py-2 rounded-md w-full"
                        onChange={() => setIsDirty(true)}
                      />
                      {errors.ten_ngon_ngu && <span className="text-red-500 text-sm mt-1">{errors.ten_ngon_ngu}</span>}
                    </div>
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">Mô tả</label>
                      <input
                        id="desc"
                        type="text"
                        defaultValue={editingLang?.mo_ta || ""}
                        className="border px-3 py-2 rounded-md w-full"
                        onChange={() => setIsDirty(true)}
                      />
                      {errors.mo_ta && <span className="text-red-500 text-sm mt-1">{errors.mo_ta}</span>}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button onClick={() => { setModalType(null); setIsDirty(false) }} className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 cursor-pointer">Hủy</button>
                    <button
                      onClick={() => {
                        if (!isDirty) return
                        const nameInput = (document.getElementById('name') as HTMLInputElement).value
                        const descInput = (document.getElementById('desc') as HTMLInputElement).value
                        handleSave(
                          {
                            ma_ngon_ngu: editingLang?.ma_ngon_ngu || '',
                            ten_ngon_ngu: nameInput,
                            mo_ta: descInput
                          },
                          modalType === "edit"
                        )
                      }}
                      className={`px-4 py-2 rounded-md text-white transition-colors ${isDirty ? 'bg-pink-500 hover:bg-pink-600 cursor-pointer' : 'bg-gray-300 cursor-default'}`}
                    >
                      Lưu
                    </button>
                  </div>
                </>
              )}

              {/* Xóa */}
              {modalType === "delete" && langToDelete && (
                <>
                  <h3 className="text-lg font-semibold mb-4 text-red-600">Xác nhận xóa</h3>
                  <p className="mb-4">Bạn có chắc muốn xóa ngôn ngữ <strong>{langToDelete.ten_ngon_ngu}</strong> không?</p>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setModalType(null)} className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 cursor-pointer">Hủy</button>
                    <button
                      onClick={confirmDelete}
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
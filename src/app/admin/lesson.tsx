"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Pencil, Trash, Plus, Search } from "lucide-react"
import toast from "react-hot-toast"

interface Lesson {
  ma_bai_hoc: string
  ma_unit: string
  ten_bai_hoc: string
  mo_ta: string
}

export default function AdminLesson() {
  const [currentPage, setCurrentPage] = useState(1)
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | null>(null)
  const [editingLesson, seteditingLesson] = useState<Lesson | null>(null)
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null)
  const [formState, setFormState] = useState({
    ma_bai_hoc: "",
    ma_unit: "",
    ten_bai_hoc: "",
    mo_ta: ""
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [data, setData] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState({
    ten_bai_hoc: "",
    ma_unit: "",
    mo_ta: ""
  })
  const [isDirty, setIsDirty] = useState(false)

  const pageSize = 10

  const fetchLessons = async (q = "") => {
    setLoading(true)
    try {
      const url = new URL("/api/admin/lessons", location.origin)
      if (q) url.searchParams.set("q", q)
      const res = await fetch(url)
      const result = await res.json()
      if (!res.ok) throw new Error(result.message || "Lỗi khi lấy danh sách bài học")
      setData(result.data.map((l: any) => ({
        ma_bai_hoc: l.ma_bai_hoc.toString(),
        ma_unit: l.ma_don_vi.toString(),
        ten_bai_hoc: l.ten_bai_hoc,
        mo_ta: l.mo_ta || ""
      })))
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

    useEffect(() => {
    const delay = setTimeout(() => {
      fetchLessons(searchTerm)
    }, 300) // 300ms

    return () => clearTimeout(delay)
  }, [searchTerm])

  const highlightText = (text: string | null | undefined) => {
    const safeText = text ?? ""      // chống null trước

    if (!searchTerm.trim()) return safeText

    const safeSearch = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")   // escape regex
    const regex = new RegExp(`(${safeSearch})`, "gi")

    return safeText.split(regex).map((part, i) =>
      part.toLowerCase() === searchTerm.toLowerCase()
        ? <span key={i} className="bg-pink-200">{part}</span>
        : part
    )
  }


  const filteredData = data.filter(u =>
    u.ten_bai_hoc.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.mo_ta.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredData.length / pageSize)
  const currentData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormState(prev => ({
      ...prev,
      [name]: name === "ma_unit" ? value.replace(/\D/g, "") : value // loại bỏ ký tự không phải số
    }))
    setIsDirty(true)
  }

  const handleEdit = (lesson: Lesson) => {
    seteditingLesson(lesson)
    setModalType("edit")
    setFormState(lesson) 
    setErrors({ ten_bai_hoc: "", ma_unit: "", mo_ta: "" })
    setIsDirty(false)
  }

  const handleDelete = (lesson: Lesson) => {
    toast.dismiss()
    setLessonToDelete(lesson)
    setModalType("delete")
  }

  const handleSave = async (lesson: Lesson, isEdit: boolean) => {
    const newErrors = { ten_bai_hoc: "", ma_unit: "", mo_ta: "" }

    if (!lesson.ten_bai_hoc.trim()) newErrors.ten_bai_hoc = "Tên bài học không được để trống"
    if (!lesson.ma_unit.trim()) newErrors.ma_unit = "Mã unit không được để trống"

    if (newErrors.ten_bai_hoc || newErrors.ma_unit) {
      setErrors(newErrors)
      return
    }

    try {
      const res = await fetch("/api/admin/lessons", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ma_bai_hoc: lesson.ma_bai_hoc,
          ma_don_vi: lesson.ma_unit,
          ten_bai_hoc: lesson.ten_bai_hoc,
          mo_ta: lesson.mo_ta
        })
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.message || "Lỗi khi lưu bài học")

      toast.success(result.message)

      // fetch lại dữ liệu sau khi thêm/sửa
      fetchLessons(searchTerm)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setModalType(null)
      seteditingLesson(null)
      setErrors({ ten_bai_hoc: "", ma_unit: "", mo_ta: "" })
      setIsDirty(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!lessonToDelete) return
    try {
      const res = await fetch(`/api/admin/lessons?id=${lessonToDelete.ma_bai_hoc}`, { method: "DELETE" })
      const result = await res.json()
      if (!res.ok) throw new Error(result.message || "Lỗi khi xóa bài học")

      toast.success(result.message)
      fetchLessons(searchTerm)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setModalType(null)
      setLessonToDelete(null)
    }
  }

  return (
    <div>
      {/* header + search + thêm */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-semibold text-pink-500">Danh sách bài học</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc mô tả"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1) }}
              className="border px-8 py-2 rounded-md w-64"
            />
          </div>
          <button
            onClick={() => {
              seteditingLesson(null)
              setModalType("add")
              setFormState({
                ma_bai_hoc: "",
                ma_unit: "",
                ten_bai_hoc: "",
                mo_ta: ""
              })
              setErrors({ ten_bai_hoc: "", ma_unit: "", mo_ta: "" })
              setIsDirty(false)
            }}
            className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Thêm bài học
          </button>
        </div>
      </div>

      {/* bảng */}
      <div className="overflow-x-auto bg-white rounded-md shadow-md">
        <table className="w-full table-auto border-collapse">
          <thead className="bg-pink-50 text-slate-700">
            <tr>
              <th className="px-4 py-2 text-left">Mã bài học</th>
              <th className="px-4 py-2 text-left">Mã unit</th>
              <th className="px-4 py-2 text-left">Tên bài học</th>
              <th className="px-4 py-2 text-left">Mô tả</th>
              <th className="px-4 py-2 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-4">Đang tải...</td>
              </tr>
            ) : currentData.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-slate-500">Không có kết quả</td>
              </tr>
            ) : currentData.map(lesson => (
              <tr key={lesson.ma_bai_hoc} className="hover:bg-pink-50">
                <td className="px-4 py-2">{lesson.ma_bai_hoc}</td>
                <td className="px-4 py-2">{lesson.ma_unit}</td>
                <td className="px-4 py-2">{highlightText(lesson.ten_bai_hoc)}</td>
                <td className="px-4 py-2">{highlightText(lesson.mo_ta)}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button onClick={() => handleEdit(lesson)} className="p-1 rounded-md bg-yellow-100 hover:bg-yellow-200 cursor-pointer">
                    <Pencil className="w-4 h-4 text-yellow-600" />
                  </button>
                  <button onClick={() => handleDelete(lesson)} className="p-1 rounded-md bg-red-100 hover:bg-red-200 cursor-pointer">
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
        <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className={`px-1 transition-colors ${currentPage===1?'text-pink-500 cursor-default':'text-pink-500 hover:text-pink-700 cursor-pointer'}`}>&lt;&lt;</button>
        <button onClick={() => setCurrentPage(p => Math.max(p-1,1))} disabled={currentPage === 1} className={`px-1 transition-colors ${currentPage===1?'text-pink-500 cursor-default':'text-pink-500 hover:text-pink-700 cursor-pointer'}`}>&lt;</button>

        {(() => {
          const pagesToShow = 5
          let start = Math.max(1, currentPage - 2)
          let end = Math.min(totalPages, start + pagesToShow - 1)
          if (end - start < pagesToShow - 1) start = Math.max(1, end - pagesToShow + 1)
          return Array.from({ length: end - start + 1 }, (_, i) => start + i)
        })().map(page => (
          <button key={page} onClick={() => setCurrentPage(page)} className={`px-3 py-1 rounded-md transition-colors border ${page===currentPage?'bg-pink-500 text-white border-pink-500 cursor-default':'bg-white text-pink-500 border-pink-300 hover:bg-pink-100 cursor-pointer'}`}>
            {page}
          </button>
        ))}

        <button onClick={() => setCurrentPage(p => Math.min(p+1,totalPages))} disabled={currentPage === totalPages} className={`px-1 transition-colors ${currentPage===totalPages?'text-pink-500 cursor-default':'text-pink-500 hover:text-pink-700 cursor-pointer'}`}>&gt;</button>
        <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className={`px-1 transition-colors ${currentPage===totalPages?'text-pink-500 cursor-default':'text-pink-500 hover:text-pink-700 cursor-pointer'}`}>&gt;&gt;</button>
      </div>

      {/* Modal Thêm / Sửa / Xóa */}
      <AnimatePresence>
        {modalType && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <motion.div initial={{scale:0.9}} animate={{scale:1}} exit={{scale:0.9}} className="bg-white rounded-md p-6 w-96 shadow-lg">
              {(modalType === "add" || modalType === "edit") && (
                <>
                  <h3 className="text-lg font-semibold mb-4">{modalType === "edit" ? "Sửa bài học" : "Thêm bài học"}</h3>
                  <div className="flex flex-col gap-2">
                      <div className="flex flex-col">
                        <label className="mb-1 text-sm font-medium text-gray-700">Mã unit</label>
                        <input name="ma_unit" type="text" value={formState.ma_unit} onChange={handleFormChange} className="border px-3 py-2 rounded-md w-full" />
                        {errors.ma_unit && <span className="text-red-500 text-sm mt-1">{errors.ma_unit}</span>}
                    </div>
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">Tên bài học</label>
                      <input name="ten_bai_hoc" type="text" value={formState.ten_bai_hoc} onChange={handleFormChange} className="border px-3 py-2 rounded-md w-full" />
                      {errors.ten_bai_hoc && <span className="text-red-500 text-sm mt-1">{errors.ten_bai_hoc}</span>}
                    </div>
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">Mô tả</label>
                      <input name="mo_ta" type="text" value={formState.mo_ta} onChange={handleFormChange} className="border px-3 py-2 rounded-md w-full" />
                      {errors.mo_ta && <span className="text-red-500 text-sm mt-1">{errors.mo_ta}</span>}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button onClick={() => setModalType(null)} className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 cursor-pointer">Hủy</button>
                    <button
                      onClick={() => {
                        if (!isDirty) return
                        const lessonToSave = { ...formState, ma_bai_hoc: editingLesson?.ma_bai_hoc || "" }
                        handleSave(lessonToSave, modalType === "edit")
                      }}
                      className={`px-4 py-2 rounded-md text-white transition-colors ${isDirty?'bg-pink-500 hover:bg-pink-600 cursor-pointer':'bg-gray-300 cursor-default'}`}
                    >
                      Lưu
                    </button>
                  </div>
                </>
              )}

              {modalType === "delete" && lessonToDelete && (
                <>
                  <h3 className="text-lg font-semibold mb-4 text-red-600">Xác nhận xóa</h3>
                  <p className="mb-4">Bạn có chắc muốn xóa bài học <strong>{lessonToDelete.ten_bai_hoc}</strong> không?</p>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setModalType(null)} className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 cursor-pointer">Hủy</button>
                    <button onClick={handleConfirmDelete} className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 cursor-pointer">
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
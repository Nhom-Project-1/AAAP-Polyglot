"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Pencil, Trash, Plus, Search } from "lucide-react"
import toast from "react-hot-toast"

interface Unit {
  ma_unit: string
  ma_ngon_ngu: string
  ten_unit: string
  mo_ta: string
}

export default function AdminUnit() {
  const [currentPage, setCurrentPage] = useState(1)
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | null>(null)
  const [editingUnit, seteditingUnit] = useState<Unit | null>(null)
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null)
  const [formState, setFormState] = useState<Unit>({
    ma_unit: "",
    ma_ngon_ngu: "",
    ten_unit: "",
    mo_ta: ""
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [data, setData] = useState<Unit[]>([])
  const [errors, setErrors] = useState({
    ma_ngon_ngu: "",
    ten_unit: "",
    mo_ta: ""
  })
  const [isDirty, setIsDirty] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const pageSize = 10

  const fetchUnits = async (q = "") => {
    setIsLoading(true)
    try {
      const url = new URL("/api/admin/units", location.origin)
      if (q) url.searchParams.set("q", q)
      const res = await fetch(url)
      const result = await res.json()
      if (!res.ok) throw new Error(result.message || "Lỗi khi lấy danh sách unit")
      setData(result.data.map((u: any) => ({
        ma_unit: u.ma_don_vi.toString(),
        ma_ngon_ngu: u.ma_ngon_ngu.toString(),
        ten_unit: u.ten_don_vi,
        mo_ta: u.mo_ta || ""
      })))
    } catch (error: any) {
      toast.error(error.message)
      setData([])
    } finally {
      setIsLoading(false)
    }
  }

  // debounce search 300ms
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchUnits(searchTerm)
    }, 300)
    return () => clearTimeout(delay)
  }, [searchTerm])

  const highlightText = (text: string) => {
    if (!searchTerm) return text
    const regex = new RegExp(`(${searchTerm})`, "gi")
    return text.split(regex).map((part, i) =>
      regex.test(part) ? <span key={i} className="bg-pink-200">{part}</span> : part
    )
  }

  const filteredData = data.filter(u =>
    u.ten_unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      [name]: name === "ma_ngon_ngu" ? value.replace(/\D/g, "") : value
    }))
    setIsDirty(true)
  }

  const handleEdit = (u: Unit) => {
    seteditingUnit(u)
    setModalType("edit")
    setFormState(u)
    setErrors({ ma_ngon_ngu: "", ten_unit: "", mo_ta: "" })
    setIsDirty(false)
  }

  const handleDelete = (u: Unit) => {
    toast.dismiss()
    setUnitToDelete(u)
    setModalType("delete")
  }

  const handleSave = async (isEdit: boolean) => {
    const newErrors = { ma_ngon_ngu: "", ten_unit: "", mo_ta: "" }
    if (!formState.ma_ngon_ngu.trim()) newErrors.ma_ngon_ngu = "Mã ngôn ngữ không được để trống"
    if (!formState.ten_unit.trim()) newErrors.ten_unit = "Tên chương không được để trống"
    if (!formState.mo_ta.trim()) newErrors.mo_ta = "Mô tả không được để trống"

    if (newErrors.ma_ngon_ngu || newErrors.ten_unit || newErrors.mo_ta) {
      setErrors(newErrors)
      return
    }

    try {
      const method = isEdit ? "PUT" : "POST"
      const body = isEdit
        ? {
            ma_don_vi: formState.ma_unit,
            ma_ngon_ngu: formState.ma_ngon_ngu,
            ten_don_vi: formState.ten_unit,
            mo_ta: formState.mo_ta
          }
        : {
            ma_ngon_ngu: formState.ma_ngon_ngu,
            ten_don_vi: formState.ten_unit,
            mo_ta: formState.mo_ta
          }

      const res = await fetch("/api/admin/units", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.message || "Lỗi khi lưu unit")

      toast.success(result.message)
      fetchUnits(searchTerm)

      // Đóng modal và reset form khi thành công
      setModalType(null)
      seteditingUnit(null)
      setErrors({ ma_ngon_ngu: "", ten_unit: "", mo_ta: "" })
      setIsDirty(false)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleConfirmDelete = async () => {
    if (!unitToDelete) return
    try {
      const res = await fetch(`/api/admin/units?id=${unitToDelete.ma_unit}`, { method: "DELETE" })
      const result = await res.json()
      if (!res.ok) throw new Error(result.message || "Lỗi khi xóa unit")

      toast.success(result.message)
      fetchUnits(searchTerm)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setModalType(null)
      setUnitToDelete(null)
    }
  }

  return (
    <div>
      {/* header + search + thêm */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-semibold text-pink-500">Danh sách chương</h2>
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
              seteditingUnit(null)
              setModalType("add")
              setFormState({
                ma_unit: "",
                ma_ngon_ngu: "",
                ten_unit: "",
                mo_ta: ""
              })
              setErrors({ ma_ngon_ngu: "", ten_unit: "", mo_ta: "" })
              setIsDirty(false)
            }}
            className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Thêm chương
          </button>
        </div>
      </div>

      {/* bảng */}
      <div className="overflow-x-auto bg-white rounded-md shadow-md">
        <table className="w-full table-auto border-collapse">
          <thead className="bg-pink-50 text-slate-700">
            <tr>
              <th className="px-4 py-2 text-left">Mã chương</th>
              <th className="px-4 py-2 text-left">Mã ngôn ngữ</th>
              <th className="px-4 py-2 text-left">Tên chương</th>
              <th className="px-4 py-2 text-left">Mô tả</th>
              <th className="px-4 py-2 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-slate-500">Đang tải...</td>
              </tr>
            ) : currentData.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-slate-500">Không có kết quả</td>
              </tr>
            ) : (
              currentData.map(unit => (
                <tr key={unit.ma_unit} className="hover:bg-pink-50">
                  <td className="px-4 py-2">{unit.ma_unit}</td>
                  <td className="px-4 py-2">{unit.ma_ngon_ngu}</td>
                  <td className="px-4 py-2">{highlightText(unit.ten_unit)}</td>
                  <td className="px-4 py-2">{highlightText(unit.mo_ta)}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button onClick={() => handleEdit(unit)} className="p-1 rounded-md bg-yellow-100 hover:bg-yellow-200 cursor-pointer">
                      <Pencil className="w-4 h-4 text-yellow-600" />
                    </button>
                    <button onClick={() => handleDelete(unit)} className="p-1 rounded-md bg-red-100 hover:bg-red-200 cursor-pointer">
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
      <div className="flex justify-center items-center gap-2 mt-4 py-2">
        <button onClick={() => setCurrentPage(1)} disabled={currentPage===1} className={`px-1 transition-colors ${currentPage===1?'text-pink-500 cursor-default':'text-pink-500 hover:text-pink-700 cursor-pointer'}`}>&lt;&lt;</button>
        <button onClick={() => setCurrentPage(p => Math.max(p-1,1))} disabled={currentPage===1} className={`px-1 transition-colors ${currentPage===1?'text-pink-500 cursor-default':'text-pink-500 hover:text-pink-700 cursor-pointer'}`}>&lt;</button>
        {(() => {
          const pagesToShow = 5
          let start = Math.max(1, currentPage - 2)
          let end = Math.min(totalPages, start + pagesToShow - 1)
          if (end - start < pagesToShow - 1) start = Math.max(1, end - pagesToShow + 1)
          return Array.from({ length: end - start + 1 }, (_, i) => start + i)
        })().map(page => (
          <button key={page} onClick={() => setCurrentPage(page)} className={`px-3 py-1 rounded-md transition-colors border ${page===currentPage?'bg-pink-500 text-white border-pink-500 cursor-default':'bg-white text-pink-500 border-pink-300 hover:bg-pink-100 cursor-pointer'}`}>{page}</button>
        ))}
        <button onClick={() => setCurrentPage(p => Math.min(p+1,totalPages))} disabled={currentPage===totalPages} className={`px-1 transition-colors ${currentPage===totalPages?'text-pink-500 cursor-default':'text-pink-500 hover:text-pink-700 cursor-pointer'}`}>&gt;</button>
        <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage===totalPages} className={`px-1 transition-colors ${currentPage===totalPages?'text-pink-500 cursor-default':'text-pink-500 hover:text-pink-700 cursor-pointer'}`}>&gt;&gt;</button>
      </div>

      {/* Modal Thêm / Sửa / Xóa */}
      <AnimatePresence>
        {modalType && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <motion.div initial={{scale:0.9}} animate={{scale:1}} exit={{scale:0.9}} className="bg-white rounded-md p-6 w-96 shadow-lg">
              {(modalType === "add" || modalType === "edit") && (
                <>
                  <h3 className="text-lg font-semibold mb-4">{modalType === "edit" ? "Sửa unit" : "Thêm unit"}</h3>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">Mã ngôn ngữ</label>
                      <input name="ma_ngon_ngu" type="text" value={formState.ma_ngon_ngu} onChange={handleFormChange} className="border px-3 py-2 rounded-md w-full" />
                      {errors.ma_ngon_ngu && <span className="text-red-500 text-sm mt-1">{errors.ma_ngon_ngu}</span>}
                    </div>
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">Tên chương</label>
                      <input name="ten_unit" type="text" value={formState.ten_unit} onChange={handleFormChange} className="border px-3 py-2 rounded-md w-full" />
                      {errors.ten_unit && <span className="text-red-500 text-sm mt-1">{errors.ten_unit}</span>}
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
                        handleSave(modalType === "edit")
                      }}
                      className={`px-4 py-2 rounded-md text-white transition-colors ${isDirty?'bg-pink-500 hover:bg-pink-600 cursor-pointer':'bg-gray-300 cursor-default'}`}
                    >
                      Lưu
                    </button>
                  </div>
                </>
              )}

              {modalType === "delete" && unitToDelete && (
                <>
                  <h3 className="text-lg font-semibold mb-4 text-red-600">Xác nhận xóa</h3>
                  <p className="mb-4">Bạn có chắc muốn xóa unit <strong>{unitToDelete.ten_unit}</strong> không?</p>
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
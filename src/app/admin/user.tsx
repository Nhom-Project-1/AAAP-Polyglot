"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Pencil, Trash, Plus, Search } from "lucide-react"
import toast from "react-hot-toast"

interface User {
  ma_nguoi_dung: string
  ho_ten: string
  ten_dang_nhap: string
  email: string
  ngay_tao: string
  ngay_cap_nhat: string
}

const mockData: User[] = Array.from({ length: 100 }).map((_, i) => {
  const now = new Date()
  const ngayTao = new Date(2023, 8, (i % 30) + 1, now.getHours(), now.getMinutes(), now.getSeconds())
  const ngayCapNhat = new Date(2023, 9, (i % 30) + 1, now.getHours(), now.getMinutes(), now.getSeconds())

  return {
    ma_nguoi_dung: `${i + 1}`,
    ho_ten: `Người dùng ${i + 1}`,
    ten_dang_nhap: `user${i + 1}`,
    email: `user${i + 1}@gmail.com`,
    ngay_tao: ngayTao.toISOString(),
    ngay_cap_nhat: ngayCapNhat.toISOString(),
  }
})

export default function AdminUser() {
  const [currentPage, setCurrentPage] = useState(1)
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | null>(null)
  const [editingUser, seteditingUser] = useState<User | null>(null)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [data, setData] = useState<User[]>(mockData)
  const [errors, setErrors] = useState({
    ho_ten: "" ,
    ten_dang_nhap: "",
    email: "",
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

  const filteredData = data.filter(u =>
    u.ho_ten.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.ten_dang_nhap.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredData.length / pageSize)
  const currentData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const handleEdit = (u: User) => {
    seteditingUser(u)
    setModalType("edit")
    setErrors({ ho_ten: "", ten_dang_nhap: "", email: ""})
    setIsDirty(false)
  }

  const handleDelete = (u:  User) => {
    toast.dismiss()
    setUserToDelete(u)
    setModalType("delete")
  }

  const handleSave = (user: User, isEdit: boolean) => {
    const newErrors = { ho_ten: "", ten_dang_nhap: "",email: "" }
    if (!user.ho_ten.trim()) {
      newErrors.ho_ten = "Họ và tên không được để trống"
    }
    if (!user.ten_dang_nhap.trim()) {
      newErrors.ten_dang_nhap = "Tên đăng nhập không được để trống"
    }
    if (!isEdit) {
    if (!user.email.trim()) newErrors.email = "Email không được để trống"
    else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(user.email)) newErrors.email = "Email không hợp lệ"
    }
  }
    if (newErrors.ho_ten || newErrors.ten_dang_nhap || newErrors.email) {
      setErrors(newErrors)
      return
    }
    if (isEdit) {
      toast.dismiss()
      setData(prev => prev.map(u => u.ma_nguoi_dung === editingUser?.ma_nguoi_dung ? { ...u, ...user } : u))
      toast.success("Sửa thông tin người dùng thành công!")
    } else {
      toast.dismiss()
      const maxId = data.reduce((max, item) => {
      const num = parseInt(item.ma_nguoi_dung.replace('', '')) || 0
      return num > max ? num : max
      }, 0)
      user.ma_nguoi_dung = `${maxId + 1}`
      setData(prev => [...prev, user])
      toast.success("Thêm người dùng thành công!")
    }

    setModalType(null)
    seteditingUser(null)
    setErrors({ ho_ten: "", ten_dang_nhap: "", email: "" })
    setIsDirty(false)
  }

  return (
    <div>
      {/* header + search + thêm */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-semibold text-pink-500">Danh sách người dùng</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, username hoặc email"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1) }}
              className="border px-8 py-2 rounded-md w-78"
            />
          </div>
          <button
            onClick={() => {
              seteditingUser(null)
              setModalType("add")
              setErrors({ ho_ten: "", ten_dang_nhap: "", email:"" })
              setIsDirty(false)
            }}
            className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Thêm người dùng
          </button>
        </div>
      </div>

      {/* bảng */}
      <div className="overflow-x-auto bg-white rounded-md shadow-md">
        <table className="w-full table-auto border-collapse">
          <thead className="bg-pink-50 text-slate-700">
            <tr>
              <th className="px-4 py-2 text-left">Mã người dùng</th>
              <th className="px-4 py-2 text-left">Họ và tên</th>
              <th className="px-4 py-2 text-left">Tên đăng nhập</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Ngày tạo</th>
              <th className="px-4 py-2 text-left">Ngày cập nhật</th>
              <th className="px-4 py-2 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map(user => (
              <tr key={user.ma_nguoi_dung} className="hover:bg-pink-50">
                <td className="px-4 py-2">{user.ma_nguoi_dung}</td>
                <td className="px-4 py-2">{highlightText(user.ho_ten)}</td>
                <td className="px-4 py-2">{highlightText(user.ten_dang_nhap)}</td>
                <td className="px-4 py-2">{highlightText(user.email)}</td>
                <td className="px-4 py-2">{new Date(user.ngay_tao).toLocaleString()}</td>
                <td className="px-4 py-2">{new Date(user.ngay_cap_nhat).toLocaleString()}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button onClick={() => handleEdit(user)} className="p-1 rounded-md bg-yellow-100 hover:bg-yellow-200 cursor-pointer">
                    <Pencil className="w-4 h-4 text-yellow-600" />
                  </button>
                  <button onClick={() => handleDelete(user)} className="p-1 rounded-md bg-red-100 hover:bg-red-200 cursor-pointer">
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
            <h3 className="text-lg font-semibold mb-4">
              {modalType === "edit" ? "Sửa thông tin người dùng" : "Thêm người dùng"}
            </h3>
            <div className="flex flex-col gap-2">
              {/* Họ và tên */}
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-gray-700">Họ và tên</label>
                <input
                  id="name"
                  type="text"
                  defaultValue={editingUser?.ho_ten || ""}
                  className="border px-3 py-2 rounded-md w-full"
                  onChange={() => setIsDirty(true)}
                />
                {errors.ho_ten && <span className="text-red-500 text-sm mt-1">{errors.ho_ten}</span>}
              </div>

              {/* Username */}
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-gray-700">Tên đăng nhập</label>
                <input
                  id="username"
                  type="text"
                  defaultValue={editingUser?.ten_dang_nhap || ""}
                  className="border px-3 py-2 rounded-md w-full"
                  onChange={() => setIsDirty(true)}
                />
                {errors.ten_dang_nhap && <span className="text-red-500 text-sm mt-1">{errors.ten_dang_nhap}</span>}
              </div>

              {/* Email chỉ khi thêm */}
              {modalType === "add" && (
                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium text-gray-700">Email</label>
                  <input
                    id="email"
                    type="email"
                    defaultValue=""
                    className="border px-3 py-2 rounded-md w-full"
                    onChange={() => setIsDirty(true)}
                  />
                  {errors.email && <span className="text-red-500 text-sm mt-1">{errors.email}</span>}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (!isDirty) return;

                  const nameInput = (document.getElementById('name') as HTMLInputElement).value
                  const usernameInput = (document.getElementById('username') as HTMLInputElement).value
                  const emailInput = modalType === "add"
                    ? (document.getElementById('email') as HTMLInputElement).value
                    : editingUser?.email || ""
                  const now = new Date().toISOString()
                  handleSave(
                    {
                      ma_nguoi_dung: editingUser?.ma_nguoi_dung || '',
                      ho_ten: nameInput,
                      ten_dang_nhap: usernameInput,
                      email: emailInput,
                      ngay_tao: editingUser?.ngay_tao || now,
                      ngay_cap_nhat: now,
                    },
                    modalType === "edit"
                  )
                }}
                className={`px-4 py-2 rounded-md text-white transition-colors ${
                  isDirty ? 'bg-pink-500 hover:bg-pink-600 cursor-pointer' : 'bg-gray-300 cursor-default'
                }`}
              >
                Lưu
              </button>
            </div>
          </>
        )}

              {/* Xóa */}
              {modalType === "delete" && userToDelete && (
                <>
                  <h3 className="text-lg font-semibold mb-4 text-red-600">Xác nhận xóa</h3>
                  <p className="mb-4">Bạn có chắc muốn xóa người dùng <strong>{userToDelete.ten_dang_nhap}</strong> không?</p>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setModalType(null)} className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 cursor-pointer">Hủy</button>
                    <button
                      onClick={() => {
                        setData(prev => prev.filter(u => u.ma_nguoi_dung !== userToDelete.ma_nguoi_dung))
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
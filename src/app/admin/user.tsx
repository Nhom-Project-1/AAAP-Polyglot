"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Pencil, Trash, Plus, Search, Eye, EyeOff } from "lucide-react"
import toast from "react-hot-toast"

interface User {
  ma_nguoi_dung: number
  ho_ten: string
  ten_dang_nhap: string
  email: string
  ngay_tao: string
  ngay_cap_nhat?: string
}

export default function AdminUser() {
  const [currentPage, setCurrentPage] = useState(1)
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [data, setData] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState({
    ho_ten: "",
    ten_dang_nhap: "",
    email: "",
    mat_khau: "",
  })
  const [isDirty, setIsDirty] = useState(false)

  // OTP States
  const [verificationStep, setVerificationStep] = useState(false)
  const [verificationToken, setVerificationToken] = useState("")
  const [otp, setOtp] = useState("")
  const [otpError, setOtpError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const pageSize = 10

  // === LẤY DỮ LIỆU TỪ API ===
  const fetchUsers = async (query = "") => {
    try {
      setLoading(true)
      const url = query
        ? `/api/user/search?q=${encodeURIComponent(query)}`
        : `/api/user?admin=true`
      const res = await fetch(url)
      if (!res.ok) throw new Error("Không thể tải danh sách người dùng")
      const users: User[] = await res.json()
      setData(users)
    } catch (err) {
      toast.error("Lỗi tải dữ liệu người dùng")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchUsers(searchTerm)
      setCurrentPage(1)
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

  const filteredData = data
  const totalPages = Math.ceil(filteredData.length / pageSize)
  const currentData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleEdit = (u: User) => {
    setEditingUser(u)
    setModalType("edit")
    setErrors({ ho_ten: "", ten_dang_nhap: "", email: "", mat_khau: "" })
    setIsDirty(false)
  }

  const handleDelete = (u: User) => {
    toast.dismiss()
    setUserToDelete(u)
    setModalType("delete")
  }

  const resetModal = () => {
    setModalType(null)
    setEditingUser(null)
    setVerificationStep(false)
    setVerificationToken("")
    setOtp("")
    setOtpError("")
    setIsDirty(false)
    setShowPassword(false)
    setErrors({ ho_ten: "", ten_dang_nhap: "", email: "", mat_khau: "" })
  }

  return (
    <div>
      {/* Header + Search + Add Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-semibold text-pink-500">Danh sách người dùng</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, username hoặc email"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="border px-8 py-2 rounded-md w-78"
            />
          </div>
          <button
            onClick={() => {
              setEditingUser(null)
              setModalType("add")
              setErrors({ ho_ten: "", ten_dang_nhap: "", email: "", mat_khau: "" })
              setIsDirty(false)
              setVerificationStep(false)
              setShowPassword(false)
            }}
            className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Thêm người dùng
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12 space-x-2">
          <p className="text-black font-medium">Đang tải người dùng...</p>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className="overflow-x-auto bg-white rounded-md shadow-md">
          <table className="w-full table-auto border-collapse">
            <thead className="bg-pink-50 text-slate-700">
              <tr>
                <th className="px-4 py-2 text-left">Mã</th>
                <th className="px-4 py-2 text-left">Họ và tên</th>
                <th className="px-4 py-2 text-left">Tên đăng nhập</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Ngày tạo</th>
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
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4 py-2">
          <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}
            className={`px-1 transition-colors ${currentPage === 1 ? 'text-pink-500 cursor-default' : 'text-pink-500 hover:text-pink-700 cursor-pointer'}`}>
            {"<<"}
          </button>
          <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}
            className={`px-1 transition-colors ${currentPage === 1 ? 'text-pink-500 cursor-default' : 'text-pink-500 hover:text-pink-700 cursor-pointer'}`}>
            {"<"}
          </button>

          {(() => {
            const pagesToShow = 5
            let start = Math.max(1, currentPage - 2)
            const end = Math.min(totalPages, start + pagesToShow - 1)
            if (end - start < pagesToShow - 1) start = Math.max(1, end - pagesToShow + 1)
            return Array.from({ length: end - start + 1 }, (_, i) => start + i)
          })().map(page => (
            <button key={page} onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded-md transition-colors border ${page === currentPage ? 'bg-pink-500 text-white border-pink-500 cursor-default' : 'bg-white text-pink-500 border-pink-300 hover:bg-pink-100 cursor-pointer'}`}>
              {page}
            </button>
          ))}

          <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}
            className={`px-1 transition-colors ${currentPage === totalPages ? 'text-pink-500 cursor-default' : 'text-pink-500 hover:text-pink-700 cursor-pointer'}`}>
            {">"}
          </button>
          <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}
            className={`px-1 transition-colors ${currentPage === totalPages ? 'text-pink-500 cursor-default' : 'text-pink-500 hover:text-pink-700 cursor-pointer'}`}>
            {">>"}
          </button>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modalType && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-md p-6 w-96 shadow-lg max-h-screen overflow-y-auto">

              {/* BƯỚC 1: Thêm / Sửa */}
              {(modalType === "add" || modalType === "edit") && !verificationStep && (
                <>
                  <h3 className="text-lg font-semibold mb-4">
                    {modalType === "edit" ? "Sửa thông tin người dùng" : "Thêm người dùng"}
                  </h3>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">Họ và tên</label>
                      <input id="name" type="text" defaultValue={editingUser?.ho_ten || ""}
                        className="border px-3 py-2 rounded-md w-full"
                        onChange={() => setIsDirty(true)} />
                      {errors.ho_ten && <span className="text-red-500 text-sm mt-1">{errors.ho_ten}</span>}
                    </div>

                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">Tên đăng nhập</label>
                      <input id="username" type="text" defaultValue={editingUser?.ten_dang_nhap || ""}
                        className="border px-3 py-2 rounded-md w-full"
                        onChange={() => setIsDirty(true)} />
                      {errors.ten_dang_nhap && <span className="text-red-500 text-sm mt-1">{errors.ten_dang_nhap}</span>}
                    </div>

                    {/* CHỈ HIỂN THỊ KHI THÊM MỚI */}
                    {modalType === "add" && (
                      <>
                        <div className="flex flex-col">
                          <label className="mb-1 text-sm font-medium text-gray-700">Email</label>
                          <input id="email" type="email" defaultValue=""
                            className="border px-3 py-2 rounded-md w-full"
                            onChange={() => setIsDirty(true)} />
                          {errors.email && <span className="text-red-500 text-sm mt-1">{errors.email}</span>}
                        </div>

                        <div className="flex flex-col relative">
                          <label className="mb-1 text-sm font-medium text-gray-700">Mật khẩu</label>
                          <input id="password" type={showPassword ? "text" : "password"}
                            className="border px-3 py-2 rounded-md w-full pr-10"
                            onChange={() => setIsDirty(true)} />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700"
                          >
                            {showPassword ? (
                              <Eye className="w-5 h-5" />
                            ) : (
                              <EyeOff className="w-5 h-5" />
                            )}
                          </button>
                          {errors.mat_khau && <span className="text-red-500 text-sm mt-1">{errors.mat_khau}</span>}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <button onClick={resetModal}
                      className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 cursor-pointer">
                      Hủy
                    </button>
                    <button
                      onClick={async () => {
                        if (!isDirty) return

                        const nameInput = (document.getElementById('name') as HTMLInputElement).value.trim()
                        const usernameInput = (document.getElementById('username') as HTMLInputElement).value.trim()
                        const emailInput = modalType === "add"
                          ? (document.getElementById('email') as HTMLInputElement).value.trim()
                          : editingUser?.email || ""
                        const passwordInput = modalType === "add"
                          ? (document.getElementById('password') as HTMLInputElement)?.value || ""
                          : ""

                        const newErrors = { ho_ten: "", ten_dang_nhap: "", email: "", mat_khau: "" }
                        if (!nameInput) newErrors.ho_ten = "Họ và tên không được để trống"
                        if (!usernameInput) newErrors.ten_dang_nhap = "Tên đăng nhập không được để trống"
                        if (modalType === "add") {
                          if (!emailInput) newErrors.email = "Email không được để trống"
                          else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput))
                            newErrors.email = "Email không hợp lệ"
                          if (!passwordInput) newErrors.mat_khau = "Mật khẩu không được để trống"
                        }

                        if (Object.values(newErrors).some(e => e)) {
                          setErrors(newErrors)
                          return
                        }

                        if (modalType === "edit") {
                          try {
                            const res = await fetch("/api/user", {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                id: editingUser?.ma_nguoi_dung,
                                ho_ten: nameInput,
                                ten_dang_nhap: usernameInput,
                              }),
                            })
                            const result = await res.json()
                            if (!res.ok) throw new Error(result.error || "Cập nhật thất bại")
                            toast.success("Sửa thành công!")
                            fetchUsers(searchTerm)
                            resetModal()
                          } catch (err: any) {
                            toast.error(err.message || "Lỗi cập nhật")
                          }
                          return
                        }

                        // Gửi OTP
                        try {
                          const res = await fetch("/api/user/send_verification", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              fullName: nameInput,
                              username: usernameInput,
                              email: emailInput,
                              password: passwordInput,
                            }),
                          })

                          const result = await res.json()
                          if (!res.ok) throw new Error(result.error)

                          toast.success("Đã gửi mã xác thực đến email!")
                          setVerificationToken(result.token)
                          setVerificationStep(true)
                          setErrors({ ho_ten: "", ten_dang_nhap: "", email: "", mat_khau: "" })
                        } catch (err: any) {
                          toast.error(err.message || "Gửi mã thất bại")
                        }
                      }}
                      className={`px-4 py-2 rounded-md text-white transition-colors ${
                        isDirty ? 'bg-pink-500 hover:bg-pink-600 cursor-pointer' : 'bg-gray-300 cursor-default'
                      }`}>
                      {modalType === "edit" ? "Lưu" : "Gửi mã xác thực"}
                    </button>
                  </div>
                </>
              )}

              {/* BƯỚC 2: Xác thực OTP */}
              {verificationStep && (
                <>
                  <h3 className="text-lg font-semibold mb-4 text-pink-600 text-center">Xác thực OTP</h3>
                  <p className="text-sm text-gray-600 mb-4 text-center">
                    Mã xác thực đã được gửi đến email. Vui lòng nhập mã 6 chữ số.
                  </p>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                      setOtpError("")
                    }}
                    className="border px-3 py-2 rounded-md w-full text-center text-lg tracking-widest focus:ring-pink-500 focus:border-pink-500"
                  />
                  {otpError && <p className="text-red-500 text-sm mt-1">{otpError}</p>}

                  <div className="flex justify-between mt-4">
                    <button onClick={() => {
                      setVerificationStep(false)
                      setOtp("")
                      setOtpError("")
                    }}
                      className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 cursor-pointer">
                      Quay lại
                    </button>
                    <button
                      onClick={async () => {
                        if (otp.length !== 6) {
                          setOtpError("Mã phải đủ 6 chữ số")
                          return
                        }
                        try {
                          const res = await fetch("/api/user/verify", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ token: verificationToken, code: otp }),
                          });

                          const result = await res.json();
                          if (!res.ok) throw new Error(result.error || "Xác thực thất bại");

                          toast.success("Tạo người dùng thành công!");
                          fetchUsers(searchTerm);
                          resetModal();

                        } catch (err: any) {
                          setOtpError(err.message || "Xác thực thất bại");
                        }
                      }}
                      className="px-4 py-2 rounded-md bg-pink-500 text-white hover:bg-pink-600 cursor-pointer">
                      Xác nhận
                    </button>
                  </div>
                </>
              )}

              {/* XÓA */}
              {modalType === "delete" && userToDelete && (
                <>
                  <h3 className="text-lg font-semibold mb-4 text-red-600">Xác nhận xóa</h3>
                  <p className="mb-4">Bạn có chắc muốn xóa người dùng <strong>{userToDelete.ten_dang_nhap}</strong> không?</p>
                  <div className="flex justify-end gap-2">
                    <button onClick={resetModal}
                      className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 cursor-pointer">Hủy</button>
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch(`/api/user?id=${userToDelete.ma_nguoi_dung}`, {
                            method: "DELETE",
                          })
                          if (!res.ok) throw new Error()
                          toast.success("Xóa thành công!")
                          fetchUsers(searchTerm)
                        } catch {
                          toast.error("Lỗi xóa người dùng")
                        } finally {
                          resetModal()
                        }
                      }}
                      className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 cursor-pointer">
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
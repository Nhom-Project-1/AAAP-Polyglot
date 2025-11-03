"use client"

import Layout from "@/components/layout"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"

interface UserResponse {
  fullName: string
  username: string
  error?: string
}

export default function AccountPage() {
  const [fullName, setFullName] = useState("")
  const [username, setUsername] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const [originalFullName, setOriginalFullName] = useState("")
  const [originalUsername, setOriginalUsername] = useState("")

  const [errors, setErrors] = useState({
    fullName: "",
    username: "",
  })

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user", { cache: "no-store" })
        if (!res.ok) throw new Error("Không thể tải thông tin người dùng")
        const data: UserResponse = await res.json()
        setFullName(data.fullName || "")
        setUsername(data.username || "")
        setOriginalFullName(data.fullName || "")
        setOriginalUsername(data.username || "")
      } catch (err) {
        toast.error("Không thể tải thông tin người dùng")
      }
    }
    fetchUser()
  }, [])

  const hasChanges =
    fullName.trim() !== originalFullName.trim() ||
    username.trim() !== originalUsername.trim() ||
    (newPassword.trim() && currentPassword.trim())

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const newErrors = { fullName: "", username: "" }
    if (!fullName.trim()) newErrors.fullName = "Họ và tên không được bỏ trống"
    if (!username.trim()) newErrors.username = "Tên đăng nhập không được bỏ trống"
    setErrors(newErrors)
    if (newErrors.fullName || newErrors.username) return

    const body: {
      fullName?: string
      username?: string
      currentPassword?: string
      newPassword?: string
    } = {}

    if (fullName.trim() !== originalFullName.trim()) body.fullName = fullName.trim()
    if (username.trim() !== originalUsername.trim()) body.username = username.trim()
    if (newPassword.trim()) {
      body.currentPassword = currentPassword
      body.newPassword = newPassword
    }

    if (Object.keys(body).length === 0) {
      toast.error("Không có thay đổi nào để cập nhật!")
      return
    }

    try {
      const res = await fetch("/api/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data: UserResponse = await res.json()
      if (!res.ok) throw new Error(data.error || "Cập nhật thất bại")

      toast.success("Cập nhật thành công!")

      setOriginalFullName(fullName)
      setOriginalUsername(username)
      setCurrentPassword("")
      setNewPassword("")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Có lỗi xảy ra"
      toast.error(message)
    }
  }

  return (
    <Layout>
      <div className="flex justify-center items-center min-h-screen px-4">
        <div className="w-full max-w-md bg-white p-8">
          <h1 className="text-2xl font-bold text-center mb-2">Thông tin người dùng</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Họ và tên */}
            <div>
              <label className="block text-sm font-medium mb-1">Họ và tên</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  const val = e.target.value
                  setFullName(val)
                  if (!val.trim()) setErrors((p) => ({ ...p, fullName: "Họ và tên không được bỏ trống" }))
                  else setErrors((p) => ({ ...p, fullName: "" }))
                }}
                className="w-full px-3 py-2 rounded-lg border border-pink-300 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
              />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
            </div>

            {/* Tên đăng nhập */}
            <div>
              <label className="block text-sm font-medium mb-1">Tên đăng nhập</label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  const val = e.target.value
                  setUsername(val)
                  if (!val.trim()) setErrors((p) => ({ ...p, username: "Tên đăng nhập không được bỏ trống" }))
                  else setErrors((p) => ({ ...p, username: "" }))
                }}
                className="w-full px-3 py-2 rounded-lg border border-pink-300 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
              />
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
            </div>

            {/* Mật khẩu hiện tại */}
            <div>
              <label className="block text-sm font-medium mb-1">Mật khẩu hiện tại</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-pink-300 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <img src={showPassword ? "/openeye.svg" : "/closeeye.svg"} alt="" className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Mật khẩu mới */}
            <div>
              <label className="block text-sm font-medium mb-1">Mật khẩu mới</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-pink-300 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <img src={showNewPassword ? "/openeye.svg" : "/closeeye.svg"} alt="" className="h-5 w-5" />
                </button>
              </div>
            </div>

            <Button
              variant="secondary"
              type="submit"
              disabled={!hasChanges}
              className={`px-8 py-3 mx-auto block w-40 rounded-lg text-white transition bg-pink-400 hover:bg-pink-500 
                ${hasChanges ? "cursor-pointer" : "cursor-not-allowed"}`}
            >
              Lưu thay đổi
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  )
}
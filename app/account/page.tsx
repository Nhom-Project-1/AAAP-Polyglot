"use client"
import  Layout  from '@/components/layout'
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

export default function AccountPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  type AccountErrors = {
    fullName: string
    username: string
    password: string
    newPassword: string
  }

  const [errors, setErrors] = useState<AccountErrors>({
    fullName: "",
    username: "",
    password: "",
    newPassword: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    let valid = true
    const newErrors: AccountErrors = { fullName: "", username: "", password: "", newPassword: "" }

    if (!fullName.trim()) {
      newErrors.fullName = "Họ và tên không được bỏ trống"
      valid = false
    }
    if (!username.trim()) {
      newErrors.username = "Tên đăng nhập không được bỏ trống"
      valid = false
    }
    if (!password.trim()) {
      newErrors.password = "Mật khẩu không được bỏ trống"
      valid = false
    }
    if (!newPassword.trim()) {
      newErrors.newPassword = "Vui lòng nhập lại mật khẩu!"
      valid = false
    } else if (password !== newPassword) {
      newErrors.newPassword = "Mật khẩu nhập lại không khớp"
      valid = false
    }

    setErrors(newErrors)
    if (!valid) return
    toast.success("Thay đổi thông tin thành công!",{duration: 3000})
  }

  return (
      <Layout>
      <div className="flex justify-center items-center min-h-screen px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
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
                  setErrors(prev => ({ ...prev, fullName: val.trim() ? "" : "Họ và tên không được bỏ trống" }))
                }}
                className="w-full px-3 py-2 rounded-lg border border-pink-300 bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
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
                  setErrors(prev => ({ ...prev, username: val.trim() ? "" : "Tên đăng nhập không được bỏ trống" }))
                }}
                className="w-full px-3 py-2 rounded-lg border border-pink-300 bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
              />
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
            </div>
            {/* Mật khẩu */}
            <div>
              <label className="block text-sm font-medium mb-1">Mật khẩu hiện tại</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    const val = e.target.value
                    setPassword(val)
                    setErrors(prev => ({ ...prev, password: val.trim() ? "" : "Mật khẩu không được bỏ trống" }))
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-pink-300 bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <img src={showPassword ? "/openeye.svg" : "/closeeye.svg"} alt="" className="h-5 w-5" />
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
            {/* Mật khẩu mới */}
            <div>
              <label className="block text-sm font-medium mb-1">Mật khẩu mới</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    const val = e.target.value
                    setNewPassword(val)
                    if (!val.trim()) setErrors(prev => ({ ...prev, newPassword: "Vui lòng nhập mật khẩu mới!" }))
                    else setErrors(prev => ({ ...prev, newPassword: "" }))
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-pink-300 bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
                />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <img src={showNewPassword ? "/openeye.svg" : "/closeeye.svg"} alt="" className="h-5 w-5" />
                </button>
              </div>
              {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>}
            </div>
            <Button variant="secondary" className="px-8 py-3 mx-auto block w-40 cursor-pointer bg-pink-400 text-white rounded-lg hover:bg-pink-500 transition" type="submit" >
              Lưu thay đổi
            </Button>
          </form>
          </div>
        </div>
      </Layout>
  )
}

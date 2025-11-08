"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Loading from "@/components/ui/loading"
import { Button } from "@/components/ui/button"

export default function AdminLoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({ identifier: "", password: "" })

  const mockAdmins = [
    { username: "admin", password: "000" }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    let valid = true
    const newErrors = { identifier: "", password: "" }
    if (!identifier.trim()) {
      newErrors.identifier = "Tên đăng nhập không được bỏ trống"
      valid = false
    }
    if (!password.trim()) {
      newErrors.password = "Mật khẩu không được bỏ trống"
      valid = false
    }
    setErrors(newErrors)
    if (!valid) return

    const admin = mockAdmins.find(
      (u) => u.username === identifier && u.password === password
    )

    if (admin) {
      setIsLoading(true)
      setTimeout(() => router.push("/admin"), 1000)
    } else {
      setErrors((prev) => ({ ...prev, password: "Tên đăng nhập hoặc mật khẩu sai" }))
    }
  }

  if (isLoading) return <Loading />

  return ( 
  <div className="min-h-screen flex items-center justify-center bg-slate-50"> 
  <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-slate-200"> 
  <h1 className="text-2xl font-bold text-pink-600 text-center mb-6">
  Đăng nhập 
  </h1> 
  <form onSubmit={handleSubmit} className="space-y-4"> 
  <div> 
  <label className="block text-sm font-medium mb-1 text-slate-700">
  Tên đăng nhập </label>
  <input
  type="text"
  value={identifier}
  onChange={(e) => {
  setIdentifier(e.target.value)
  if (errors.identifier && e.target.value.trim() !== "") {
  setErrors((prev) => ({ ...prev, identifier: "" }))
  }
  }}
  className="w-full border border-pink-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
  />
  {errors.identifier && ( <p className="text-red-500 text-xs mt-1">{errors.identifier}</p>
  )} </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700">
            Mật khẩu
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password && e.target.value.trim() !== "") {
                  setErrors((prev) => ({ ...prev, password: "" }))
                }
              }}
              className="w-full border border-pink-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <img
                src={showPassword ? "/openeye.svg" : "/closeeye.svg"}
                alt={showPassword ? "Hiện mật khẩu" : "Ẩn mật khẩu"}
                className="w-5 h-5"
              />
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        <div className="flex justify-center">
          <Button
            type="submit"
            variant="secondary"
            className="px-8 py-3 w-40 cursor-pointer"
          >
            Đăng nhập
          </Button>
        </div>
      </form>
    </div>
  </div>
  )
}
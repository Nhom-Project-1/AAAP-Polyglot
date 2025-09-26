"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import toast, { Toaster } from "react-hot-toast"
import { useRouter } from "next/navigation"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!password.trim() || !confirmPassword.trim()) {
      setError("Vui lòng nhập đầy đủ mật khẩu")
      return
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp")
      return
    }

    setError("")
    toast.success("Mật khẩu của bạn đã được đặt lại thành công! Vui lòng đăng nhập lại")
    setTimeout(() => {
        toast.dismiss()
        router.push("/login")
    }, 3000)
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen flex items-center justify-center bg-white-50">
        <div className="w-full max-w-md bg-gray p-8 rounded-2xl shadow-md">
          <h1 className="text-2xl font-bold text-center mb-6">Đặt lại mật khẩu</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input type="password" value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (error && e.target.value.trim() !== "" && confirmPassword === e.target.value) {
                    setError("")
                  }
                }}
                placeholder="Nhập mật khẩu mới" className="w-full border border-pink-300 rounded-lg px-3 py-2"/>
            </div>

            <div>
              <input type="password" value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  if (error && e.target.value.trim() !== "" && password === e.target.value) {
                    setError("")
                  }
                }}
                placeholder="Nhập lại mật khẩu mới" className="w-full border border-pink-300 rounded-lg px-3 py-2"/>
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>

            <Button variant="secondary" type="submit" className="w-30 px-8 py-3 mx-auto block cursor-pointer">Xác nhận</Button>
          </form>
        </div>
      </div>
    </>
  )
}
"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import toast, { Toaster } from "react-hot-toast"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setError("Vui lòng nhập email")
      return
    }

    setError("") 
    toast.success("Mật khẩu mới đã được gửi vào mail của bạn")
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen flex items-center justify-center bg-white-50">
        <div className="w-full max-w-md bg-gray p-8 rounded-2xl shadow-md">
          <h1 className="text-2xl font-bold text-center mb-6">Đặt lại mật khẩu</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (error && e.target.value.trim() !== "") {
                    setError("")
                  }
                }}
                placeholder="Nhập email của bạn"
                className="w-full border border-pink-300 rounded-lg px-3 py-2"
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>

            <Button variant="secondary" type="submit" className="w-30 px-8 py-3 mx-auto block">
              Gửi
            </Button>
          </form>
        </div>
      </div>
    </>
  )
}
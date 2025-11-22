"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import toast, { Toaster } from "react-hot-toast"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const emailRegex =  /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/
    if (!email.trim()) {
      setError("Vui lòng nhập email")
      return
    } else if (!emailRegex.test(email)) {
      setError("Vui lòng nhập email đúng định dạng")
      return
    }

    setError("") 
    toast.success("Link đặt lại mật khẩu đã được gửi vào email của bạn!", { duration: 5000})
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
                  const value = e.target.value
                  setEmail(value)
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/
                  if (!emailRegex.test(value)) setError("Vui lòng nhập email đúng định dạng")
                  else setError("")
                }}
                placeholder="Nhập email của bạn"
                className="w-full border border-pink-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus: ring-pink-300 focus:border-pink-300"
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>
            <Button variant="secondary" type="submit" className="w-30 px-8 py-3 mx-auto block cursor-pointer">Gửi</Button>
          </form>
        </div>
      </div>
    </>
  )
}
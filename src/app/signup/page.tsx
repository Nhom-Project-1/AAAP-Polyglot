"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import LoadingTulip from "@/components/loading"

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName, username })
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Có lỗi xảy ra khi đăng ký")
        return
      }

      // nếu đăng ký thành công mới show loading
      setIsLoading(true)
      toast.success("Đăng ký thành công! Đang chuyển sang trang học tập...")

      setTimeout(() => router.push("/course/choose"), 2000)

    } catch (err) {
      console.error(err)
      toast.error("Có lỗi xảy ra khi kết nối server")
    }
  }

  if (isLoading) return <LoadingTulip />

  return (
    <div className="min-h-screen flex items-center justify-center bg-white-50">
      <div className="w-full max-w-md bg-gray p-8 rounded-2xl shadow-md">
        <h1 className="text-2xl font-bold text-center mb-2">Đăng ký tài khoản AAAP Polyglot</h1>
        <p className="text-center text-sm mb-6">
          Đã có tài khoản?{" "}
          <a href="/login" className="text-pink-500 hover:underline">Đăng nhập</a>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Họ và tên</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-pink-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tên đăng nhập</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-pink-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-pink-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-pink-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>

          <Button variant="secondary" className="px-8 py-3 mx-auto block w-40 cursor-pointer" type="submit">Đăng ký</Button>
        </form>
      </div>
    </div>
  )
}
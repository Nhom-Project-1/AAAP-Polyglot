"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useRouter } from "next/navigation" 
import Loading from "@/components/loading"

export default function LoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError("")
  setIsLoading(true)
  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "Có lỗi xảy ra")
      setIsLoading(false)
      return
    }

    const langRes = await fetch("/api/user-language")
    const langData = await langRes.json()

    if (langData.current) {
       router.push(`/course?lang=${langData.current.id}`)        
    } else {
      router.push("/course/choose")  
    }

  } catch (err) {
    console.error(err)
    setError("Có lỗi xảy ra. Vui lòng thử lại")
    setIsLoading(false)
  }
}

  if (isLoading) return <Loading/>

  return (
    <div className="min-h-screen flex items-center justify-center bg-white-50">
      <div className="w-full max-w-md bg-gray p-8 rounded-2xl shadow-md">
        <h1 className="text-2xl text-black-500 font-bold text-center mb-6">
          Đăng nhập vào AAAP Polyglot
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">

          {/*Username hoặc email*/}
          <div>
            <label className="block text-sm font-medium mb-1 text-black-500">
              Tên đăng nhập hoặc email
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full border border-pink-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
            />
          </div>

          {/* Mật khẩu */}
          <div>
            <label className="block text-sm font-medium mb-1 text-black-500">Mật khẩu</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          </div>

          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

          <div className="flex justify-center">
            <Button variant="secondary" className="px-8 py-3 w-40 cursor-pointer" type="submit">
              Đăng nhập
            </Button>
          </div>
        </form>

        <div className="text-center text-sm text-black-600 mt-4">
          <span>Quên mật khẩu?{" "}
            <button onClick={() => router.push("/login/forgot")} className="text-pink-500 hover:underline cursor-pointer">
              Đổi thôi!
            </button>
          </span>
        </div>
        <div className="mt-3 text-sm text-center">
          <span>Là người mới?{" "}
            <button onClick={() => router.push("/signup")} className="text-pink-500 hover:underline cursor-pointer">
              Tạo tài khoản!
            </button>
          </span>
        </div>
      </div>
    </div>
  )
}
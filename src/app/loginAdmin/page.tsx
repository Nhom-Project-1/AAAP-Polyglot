
"use client"

import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/store"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function LoginAdminPage() {
  const router = useRouter()

  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { setIsLoggedIn, setUser, setIsAdmin } = useAuthStore();

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch("/api/user", { credentials: "include" })
        if (res.ok) {
          const user = await res.json();
          if (user.role === 'admin') {
            router.push(`/admin`)
          } else {
            router.push(`/`)
          }
          return
        }
      } catch (err) {
        console.error("Không lấy được user:", err)
      } finally {
        // setCheckingRedirect(false)
      }
    }

    checkLogin()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
        credentials: "include",
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Đăng nhập thất bại.")
        setIsLoading(false)
        return
      }

      setUser(data.user);
      setIsLoggedIn(true);
      setIsAdmin(true);
      router.push("/admin")

    } catch (err) {
      console.error(err)
      setError("Có lỗi xảy ra. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }

  //if (isLoading || checkingRedirect) return <Loading />

  return (
    <div className="min-h-screen flex items-center justify-center bg-white-50">
      <div className="w-full max-w-md bg-gray p-8 rounded-2xl shadow-md">
        <h1 className="text-2xl text-black-500 font-bold text-center mb-6">
          Admin Login
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">

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
                <Image
                  src={showPassword ? "/openeye.svg" : "/closeeye.svg"}
                  alt={showPassword ? "Hiện mật khẩu" : "Ẩn mật khẩu"}
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

          {/* <div className="flex justify-center"> */}
            {/* <Button variant="secondary" className="px-8 py-3 w-40 cursor-pointer" type="submit">
              Đăng nhập
            </Button> */}
            <Button
              variant="secondary"
              className="w-40 mx-auto flex justify-center items-center gap-2 cursor-pointer"
              type="submit"
              disabled={isLoading}
            >
              {isLoading && (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              )}
              {isLoading ? "Đang xử lý..." : "Đăng nhập"}
            </Button>
          {/* </div> */}
        </form>
      </div>
    </div>
  )
}

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

  type User = {
    id: string
    username: string
    password: string
    email?: string
  }
  //Dữ liệu test
  const mockUsers: User[] = [
    { id: "1", username: "phanh", password: "123", email: "phanh@gmail.com" },
    { id: "2", username: "admin", password: "000", email: "admin@gmail.com" },
  ]
  type LoginErrors = {
    identifier: string
    password: string
  }
const [errors, setErrors] = useState<LoginErrors>({ identifier: "", password: "" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    let valid = true
    const newErrors: LoginErrors = { identifier: "", password: "" }

    if (!identifier.trim()) {
      newErrors.identifier = "Tên đăng nhập hoặc email không được bỏ trống"
      valid = false
    }
    if (!password.trim()) {
      newErrors.password = "Mật khẩu không được bỏ trống"
      valid = false
    }
    setErrors(newErrors)

    if (!valid) return
    const user = mockUsers.find(
      (u) =>
        (u.username === identifier || u.email === identifier) &&
        u.password === password
    )
    if (user) {
      setIsLoading(true)
      setTimeout(() => router.push("/course/choose"),1000)
    } else {
      setErrors(prev => ({ ...prev, password: "Tên đăng nhập hoặc mật khẩu sai" }))
    }
    
  }
  if (isLoading) return <Loading/>
  return (
    <div className="min-h-screen flex items-center justify-center bg-white-50">
      <div className="w-full max-w-md bg-gray p-8 rounded-2xl shadow-md">
        <h1 className="text-2xl text-black-500 font-bold text-center mb-6">Đăng nhập vào AAAP Polyglot</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/*Username hoặc email*/}
          <div>
            <label className="block text-sm font-medium mb-1 text-black-500">
              Tên đăng nhập hoặc email
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => {setIdentifier(e.target.value) 
                            if (errors.identifier && e.target.value.trim() !== "") {setErrors(prev => ({ ...prev, identifier: "" }))}
                        }}
              className="w-full border border-pink-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus: ring-pink-300 focus:border-pink-300"
            />
            {errors.identifier && (
              <p className="text-red-500 text-xs mt-1">{errors.identifier}</p>
            )}
          </div>

          {/* Mật khẩu */}
          <div>
            <label className="block text-sm font-medium mb-1 text-black-500">Mật khẩu</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {setPassword(e.target.value) 
                            if (errors.password && e.target.value.trim() !== "") {setErrors(prev => ({ ...prev, password: "" }))}
                        }}  
                className="w-full border border-pink-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus: ring-pink-300 focus:border-pink-300"
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

          {}
          <div className="flex justify-between">
            <Button variant="secondary" className="px-8 py-3 mx-auto block w-40 cursor-pointer" type="submit">Đăng nhập</Button>
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
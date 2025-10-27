"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import LoadingTulip from "@/components/ui/loading"

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [verificationError, setVerificationError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  type SignupErrors = {
    fullName: string
    username: string
    email: string
    password: string
    confirmPassword: string
  }

  const [errors, setErrors] = useState<SignupErrors>({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  })

  const emailRegex =  /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    let valid = true
    const newErrors: SignupErrors = { fullName: "", username: "", email: "", password: "", confirmPassword: "" }

    if (!showVerification) {
      if (!fullName.trim()) {
        newErrors.fullName = "Họ và tên không được bỏ trống"
        valid = false
      }
      if (!username.trim()) {
        newErrors.username = "Tên đăng nhập không được bỏ trống"
        valid = false
      }
      if (!email.trim()) {
        newErrors.email = "Email không được bỏ trống"
        valid = false
      } else if (!emailRegex.test(email)) {
        newErrors.email = "Vui lòng nhập email đúng định dạng"
        valid = false
      }
      if (!password.trim()) {
        newErrors.password = "Mật khẩu không được bỏ trống"
        valid = false
      }
      if (!confirmPassword.trim()) {
        newErrors.confirmPassword = "Vui lòng nhập lại mật khẩu!"
        valid = false
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "Mật khẩu nhập lại không khớp"
        valid = false
      }

      setErrors(newErrors)
      if (!valid) return

      setShowVerification(true)
      toast("Vui lòng nhập mã xác thực để hoàn tất đăng ký")
      return
    }

    if (verificationCode === "111") {
      setIsLoading(true)
      toast.success("Đăng ký thành công! Đang chuyển sang trang học tập...")
      setTimeout(() => router.push("/course/choose"), 2000)
    } else setVerificationError("Mã xác thực không đúng")
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
              disabled={showVerification}
              className={`w-full border border-pink-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus: ring-pink-300 focus:border-pink-300 ${showVerification ? "bg-gray-100 cursor-not-allowed" : ""}`}
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
              disabled={showVerification}
              className={`w-full border border-pink-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus: ring-pink-300 focus:border-pink-300 ${showVerification ? "bg-gray-100 cursor-not-allowed" : ""}`}
            />
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                const val = e.target.value
                setEmail(val)
                if (!val.trim()) setErrors(prev => ({ ...prev, email: "Email không được bỏ trống" }))
                else if (!emailRegex.test(val)) setErrors(prev => ({ ...prev, email: "Vui lòng nhập email đúng định dạng" }))
                else setErrors(prev => ({ ...prev, email: "" }))
              }}
              disabled={showVerification}
              className={`w-full border border-pink-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus: ring-pink-300 focus:border-pink-300 ${showVerification ? "bg-gray-100 cursor-not-allowed" : ""}`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Mật khẩu */}
          <div className="relative">
            <label className="block text-sm font-medium mb-1">Mật khẩu</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  const val = e.target.value
                  setPassword(val)
                  setErrors(prev => ({ ...prev, password: val.trim() ? "" : "Mật khẩu không được bỏ trống" }))
                }}
                disabled={showVerification}
                className={`w-full border border-pink-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus: ring-pink-300 focus:border-pink-300 ${showVerification ? "bg-gray-100 cursor-not-allowed" : ""}`}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <img src={showPassword ? "/openeye.svg" : "/closeeye.svg"} alt="" className="h-5 w-5"/>
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Nhập lại mật khẩu */}
          <div className="relative">
            <label className="block text-sm font-medium mb-1">Nhập lại mật khẩu</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  const val = e.target.value
                  setConfirmPassword(val)
                  if (!val.trim()) setErrors(prev => ({ ...prev, confirmPassword: "Vui lòng nhập lại mật khẩu!" }))
                  else if (val !== password) setErrors(prev => ({ ...prev, confirmPassword: "Mật khẩu nhập lại không khớp" }))
                  else setErrors(prev => ({ ...prev, confirmPassword: "" }))
                }}
                disabled={showVerification}
                className={`w-full border border-pink-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus: ring-pink-300 focus:border-pink-300 ${showVerification ? "bg-gray-100 cursor-not-allowed" : ""}`}
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <img src={showConfirmPassword ? "/openeye.svg" : "/closeeye.svg"} alt="" className="h-5 w-5"/>
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* Mã xác thực */}
          {showVerification && (
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Mã xác thực</label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-32 border border-pink-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus: ring-pink-300 focus:border-pink-300"
              />
            </div>
          )}
          {verificationError && <p className="text-red-500 text-xs mt-1">{verificationError}</p>}

          <Button variant="secondary" className="px-8 py-3 mx-auto block w-40 cursor-pointer" type="submit">Đăng ký</Button>
        </form>
      </div>
    </div>
  )
}
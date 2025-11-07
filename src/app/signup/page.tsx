  "use client"
  import { useState } from "react"
  import { Button } from "@/components/ui/button"
  import { useRouter } from "next/navigation"
  import toast from "react-hot-toast"

  export default function RegisterPage() {
    const router = useRouter()

    const [fullName, setFullName] = useState("")
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false);
    const [showVerification, setShowVerification] = useState  (false)
    const [verificationCode, setVerificationCode] = useState("")
    const [verificationError, setVerificationError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [token, setToken] = useState("");

    const handleSignUp = async (e: React.FormEvent) => {
      e.preventDefault()
      setIsLoading(false)

      try {
        const res = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName, username, email, password }),
        })

        const data = await res.json()
        if (res.ok) {
          toast.success("Mã xác thực đã được gửi tới email của bạn!")
          setToken(data.token);
          setShowVerification(true)
        } else {
          toast.error(data?.error || "Đăng ký thất bại")
        }
      } catch (err) {
        console.error("Signup error:", err)
        toast.error("Có lỗi xảy ra khi đăng ký.")
      } finally {
        setIsLoading(false)
      }
    }

    const handleVerify = async () => {
      if (!verificationCode.trim()) {
      toast.error("Vui lòng nhập mã xác thực.")
      return
    }
      setVerificationError(""); 
      setIsLoading(true)
      try {
        const res = await fetch("/api/signup/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            token, 
            code: verificationCode,
          }),
        })
        const data = await res.json()
        if (res.ok) {
          toast.success("Đăng ký thành công! Đang chuyển hướng...")
          setVerificationError("")
          setTimeout(() => router.push("/course/choose"), 2000)
        } else {
          toast.error(data?.error || "Mã xác thực không đúng.")
        }
      } catch (err) {
        console.error("Verification error:", err)
        toast.error("Có lỗi xảy ra khi xác thực.")
      } finally {
        setIsLoading(false)
      }
    }


    return (
    <div className="min-h-screen flex items-center justify-center bg-white-50">
      <div className="w-full max-w-md bg-gray p-8 rounded-2xl shadow-md">
        <h1 className="text-2xl font-bold text-center mb-2">
          Đăng ký tài khoản AAAP Polyglot
        </h1>
        <p className="text-center text-sm mb-6">
          Đã có tài khoản?{" "}
          <a href="/login" className="text-pink-500 hover:underline">
            Đăng nhập
          </a>
        </p>

        <form
          onSubmit={showVerification ? (e) => { e.preventDefault(); handleVerify(); } : handleSignUp}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Họ và tên</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-pink-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
              disabled={showVerification}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tên đăng nhập</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-pink-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
              disabled={showVerification}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-pink-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
              disabled={showVerification}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mật khẩu</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-pink-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
                disabled={showVerification}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                <img
                  src={showPassword ? "/openeye.svg" : "/closeeye.svg"}
                  alt={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  className="w-5 h-5 opacity-70 hover:opacity-100 transition"
                />
              </button>
            </div>
          </div>

          {showVerification && (
            <div>
              <label className="block text-sm font-medium mb-1">Mã xác thực</label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full border border-pink-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
              />
              {verificationError && (
                <p className="text-red-500 text-xs mt-1">{verificationError}</p>
              )}
            </div>
          )}

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
            {isLoading ? "Đang xử lý..." : "Đăng ký"}
          </Button>

        </form>
      </div>
    </div>
  )
}
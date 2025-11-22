'use client'

import { useAuthStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { Header } from './header'
import { Footer } from './ui/footer'

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
const {setIsLoggedIn, setUser, setIsAdmin} = useAuthStore()
  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      })
      setIsLoggedIn(  false)
      setUser(null)
      setIsAdmin(false)
      if (res.ok) {
        router.push("/") // Sau khi logout thì về trang marketing
      } else {
        console.error("Đăng xuất thất bại:", await res.text())
      }
    } catch (err) {
      console.error("Lỗi khi đăng xuất:", err)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header onLogoutAction={handleLogout} />
      <div className="flex-1 px-14 py-8">{children}</div>
      <Footer />
    </div>
  )
}

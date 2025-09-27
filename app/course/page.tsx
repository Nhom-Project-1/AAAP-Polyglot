'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useRouter } from 'next/navigation'

export default function CoursePage() {
  const router = useRouter()

  const handleLogout = () => {
    console.log("Đăng xuất")
    router.push('/')
  }

  return (
    <div>
      <Header onLogout={handleLogout} />
      <main className="p-6">
        <h2>Trang học tập</h2>
        <p>Nội dung khóa học...</p>
      </main>
      <Footer />
    </div>
  )
}

'use client'

import { Header } from './header'
import { Footer } from './footer'
import { useRouter } from 'next/navigation'
import { useClerk } from '@clerk/nextjs'

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { signOut } = useClerk() 

  const handleLogout = async () => {
    try {
      await signOut()      
      router.push('/')     
    } catch (err) {
      console.error('Đăng xuất thất bại', err)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header onLogout={handleLogout} />
      <div className="flex-1 px-14 py-8">{children}</div>
      <Footer />
    </div>
  )
}

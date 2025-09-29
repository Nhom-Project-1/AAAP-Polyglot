'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

const menuItems = [
  { name: 'Học tập', href: '/course' },
  { name: 'Bảng xếp hạng', href: '/ranking' },
  { name: 'Mục tiêu', href: '/goal' },
  { name: 'Tài khoản', href: '/account' },
]

type HeaderProps = {
  onLogout: () => void
}

export const Header = ({ onLogout }: HeaderProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  return (
    <header className="w-full border-b-2 border-slate-200 px-6">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-x-6">
          <Image src="/logo.png" alt="Logo" width={32} height={32} />
          <span className="text-pink-300 font-bold text-4xl r">AAAP Polyglot</span>
          <nav className="flex gap-x-6 ml-6">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <span key={item.href} onClick={() => router.push(item.href)} className={`text-2xl cursor-pointer transition-colors ${
                    isActive
                      ? "font-medium text-pink-300 border-b-2 border-pink-300 pb-1  hover:text-pink-500"
                      : "font-medium text-pink-300 hover:text-pink-500"}`}>
                  {item.name}
                </span>
              )
            })}
          </nav>
        </div>

        <div>
          <Button variant="secondary" className="px-6 py-3 text-lg cursor-pointer"onClick={() => setShowLogoutModal(true)}>
            Đăng xuất
          </Button>
        </div>
      </div>

      {/* Modal xác nhận logout */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-70">
          <div className="bg-white rounded-lg p-6 w-100 text-center shadow-lg relative">
            <button onClick={() => setShowLogoutModal(false)} className="absolute top-3 right-3 text-pink-400 hover:text-pink-600 text-xl cursor-pointer" >
              ✕
            </button>
            <h3 className="text-lg font-bold text-pink-300 mb-4">Xác nhận đăng xuất</h3>
            <p className="mb-6">Bạn có chắc chắn muốn đăng xuất không?</p>
            <div className="flex justify-center gap-4">
              <Button variant="ghost" onClick={() => setShowLogoutModal(false)} className="cursor-pointer">Hủy</Button>
              <Button variant="danger"className="px-6 py-2 text-lg font-semibold cursor-pointer" onClick={() => {
                setShowLogoutModal(false) 
                onLogout()}}>
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
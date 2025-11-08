"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { User, LogOut, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import AdminUnit from "./unit"
import AdminLanguage from "./language"
import AdminLesson from "./lesson"
import AdminVocab from "./vocab"
import AdminChallenge from "./challenge"
import AdminUser from "./user"

const COMPONENTS: Record<string, React.ReactNode> = {
  unit: <AdminUnit />,
  language: <AdminLanguage />,
  lesson: <AdminLesson />,
  vocab: <AdminVocab />,
  challenge: <AdminChallenge />,
  user: <AdminUser />,
}

export default function AdminLayout() {
  const [activeTab, setActiveTab] = useState("unit") 
  const [openDropdown, setOpenDropdown] = useState(false)
  const router = useRouter()

  const sidebarItems = [
    { name: "Unit", key: "unit" },
    { name: "Lesson", key: "lesson" },
    { name: "Challenge", key: "challenge" },
    { name: "Vocab", key: "vocab" },
    { name: "Language", key: "language" },
    { name: "User", key: "user" },
  ]

   const handleLogout = () => {
    setOpenDropdown(false)
    router.push("/loginAdmin")
  }
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */} 
      <header className="h-12 bg-pink-400 text-white px-6 flex justify-between items-center w-full shadow-md sticky top-0 z-50"> 
        <div className="flex items-center gap-2"> 
          <div className="text-lg font-semibold tracking-wide">AAAP Polyglot Admin</div> 
        </div> 
        <div className="flex items-center gap-2 relative"> 
          <span className="text-sm">Hi, Admin</span> 
            <div className="flex items-center gap-1">
              <div className="w-8 h-8 bg-white/20 flex items-center justify-center rounded-md border border-white"> 
                <User className="w-5 h-5 text-white" /> 
              </div> 
              <div className="relative cursor-pointer" onMouseEnter={() => setOpenDropdown(true)} onMouseLeave={() => setOpenDropdown(false)} > 
                <ChevronDown className="text-white w-4 h-4" /> 
                  <AnimatePresence> {openDropdown && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }} className="absolute right-0 top-7 bg-white shadow-md rounded-md py-2 w-36 text-slate-700 z-50" > 
                      <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-1.5 w-full text-left hover:bg-pink-50 text-sm cursor-pointer" > 
                        <LogOut size={16} /> Đăng xuất 
                      </button> 
                    </motion.div> )} 
                  </AnimatePresence> 
              </div> 
          </div> 
        </div> 
      </header>
      {/* Body */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col">
          <nav className="flex flex-col gap-2">
            {sidebarItems.map((item) => {
              const isActive = activeTab === item.key
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`px-4 py-2 rounded-lg text-base font-medium transition-colors text-left ${
                    isActive
                      ? "bg-pink-100 text-pink-600 font-semibold"
                      : "text-slate-700 hover:bg-pink-50 hover:text-pink-500 cursor-pointer"
                  }`}
                >
                  {item.name}
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 bg-slate-50 p-6 overflow-y-auto">
          {COMPONENTS[activeTab] || <div>Chọn một mục từ sidebar</div>}
        </main>
      </div>
    </div>
  )
}
/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut, Book, Users, Puzzle, Layers, Languages, Globe } from "lucide-react"
import AdminUnit from "./unit"
import AdminLanguage from "./language"
import AdminLesson from "./lesson"
import AdminVocab from "./vocab"
import AdminChallenge from "./challenge"
import AdminUser from "./user"
import { Button } from "@/components/ui/button"
import { useAuthStore } from '@/lib/store';

const COMPONENTS: Record<string, React.ReactNode> = {
  unit: <AdminUnit />,
  lesson: <AdminLesson />,
  challenge: <AdminChallenge />,
  vocab: <AdminVocab />,
  language: <AdminLanguage />,
  user: <AdminUser />,
}

export default function AdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("unit")
  const { setUser, setIsAdmin, setIsLoggedIn } = useAuthStore();

  const menuItems = [
    { key: "unit", label: "Unit", icon: <Layers size={20} /> },
    { key: "lesson", label: "Lesson", icon: <Book size={20} /> },
    { key: "challenge", label: "Challenge", icon: <Puzzle size={20} /> },
    { key: "vocab", label: "Vocab", icon: <Languages size={20} /> },
    { key: "language", label: "Language", icon: <Globe size={20} /> },
    { key: "user", label: "User", icon: <Users size={20} /> },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      setUser(null);
      setIsAdmin(false);
      setIsLoggedIn(false);
      router.push('/loginAdmin');
    } catch (error) {
      console.error('Failed to logout', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-6 flex items-center gap-3 border-b border-gray-200">
          <img src="/logo.png" alt="Logo" className="w-10 h-10" />
          <h2 className="text-xl font-bold text-pink-600 tracking-wide">AAAP Admin</h2>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const active = activeTab === item.key
            return (
              <div
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-all font-medium ${
                  active
                    ? "bg-pink-50 text-pink-600"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </div>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <Button
            variant="secondaryOutline"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 cursor-pointer"
          >
            <LogOut size={16} />
            <span>Đăng xuất</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          {COMPONENTS[activeTab] || <div>Chọn một mục từ sidebar</div>}
        </div>
      </main>
    </div>
  );
}

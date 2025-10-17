import { Header } from "./header"
import { Footer } from "./footer"
import {useRouter} from "next/navigation"

export default function Layout({ children }: { children: React.ReactNode }) {
  const route = useRouter()
  const handleLogout = () => {
    console.log("Đăng xuất")
    route.push('/')
  }
  return (
    <div className="min-h-screen flex flex-col">
      <Header onLogout={handleLogout} />
      <div className="flex-1 px-14 py-8">{children}</div>
      <Footer />
    </div>
  )
}
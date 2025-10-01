"use client"
import { useState } from "react"
import Layout from "@/components/layout"
import ReactCountryFlag from "react-country-flag"
import toast, {Toaster} from "react-hot-toast"
import { useRouter } from "next/navigation"

const languages = [
  { id: "fr", label: "Tiếng Pháp", code: "FR" },
  { id: "en", label: "Tiếng Anh", code: "GB" },
  { id: "zh", label: "Tiếng Trung", code: "CN" },
  { id: "ar", label: "Tiếng Ả Rập", code: "SA" },
]

export default function ChooseLanguagePage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const handleSelect = (lang:(typeof languages)[number]) => {
    setSelected(lang.id)
    localStorage.setItem("selectedLang", JSON.stringify(lang))
    const t = toast.success("Bạn đã chọn " + lang.label, { duration: 2000 })
    setTimeout(() => {
      toast.dismiss(t)
      router.push("/course") }, 1000)
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-6 text-center"> Chọn một ngôn ngữ bạn muốn học </h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-items-center">
          {languages.map((lang) => {
            const isActive = selected === lang.id
            return (
              <button
                key={lang.id}
                onClick={() =>
                  handleSelect(lang)}
                className={`relative w-40 h-40 flex flex-col items-center justify-center rounded-2xl shadow transition hover:-translate-y-1 focus:outline-none bg-white ${
                  isActive ? "ring-2 ring-pink-400" : ""
                }`} >
                <span
                  className={`absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full ${
                    isActive ? "bg-pink-500 text-white" : "bg-gray-200 text-gray-400"
                  }`} >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" >
                    <path fillRule="evenodd" d="M20.03 7.47a1 1 0 0 1 .05 1.41l-8.5 9a1 1 0 0 1-1.42.02l-4.5-4.3a1 1 0 1 1 1.4-1.43l3.79 3.62 7.79-8.25a1 1 0 0 1 1.39-.07z" clipRule="evenodd"/>
                  </svg>
                </span>
                <ReactCountryFlag countryCode={lang.code} svg style={{ width: "3em", height: "3em", borderRadius: "4px" }} />
                <p className="mt-3 text-sm font-medium">{lang.label}</p>
              </button>
            )
          })}
        </div>
      </div>
      <Toaster position="top-center" reverseOrder={false} />
    </Layout>
  )
}
/*Đối với người chưa chọn ngôn ngữ bao giờ: Luôn hiện trang chọn ngôn ngữ khi mới vào web, nó có thể bấm các
chức năng khác nhưng bấm vào học tập thì vẫn phải hiện chọn đến khi nó chọn xong thì mới chuyển đến trang học tập. 
Còn nếu người dùng đã chọn rồi thì lần sau vào web nó sẽ không hiện 
trang chọn ngôn ngữ nữa mà vào thẳng trang học tập luôn.
*/ 
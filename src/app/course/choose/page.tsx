"use client"
import { useState, useEffect } from "react"
import Layout from "@/components/layout"
import ReactCountryFlag from "react-country-flag"
import toast, { Toaster } from "react-hot-toast"
import { useRouter } from "next/navigation"
import  Loading  from "@/components/loading"

type Language = {
  ma_ngon_ngu: number
  ten_ngon_ngu: string
  mo_ta?: string | null
}

export default function ChooseLanguagePage() {
  const router = useRouter()
  const [languages, setLanguages] = useState<Language[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLanguages() {
      try {
        const res = await fetch("/api/language")
        if (!res.ok) throw new Error("Không thể lấy danh sách ngôn ngữ")
        const data = await res.json()
        setLanguages(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error(err)
        toast.error("Không thể tải danh sách ngôn ngữ")
        setLanguages([])
      }
        finally {
        setLoading(false) 
      }
    }
    fetchLanguages()
  }, [])
  const handleSelect = async (lang: Language) => {
    setSelected(lang.ma_ngon_ngu)
    try {
      const res = await fetch("/api/user-language", {
        method: "POST",
        credentials: "include", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          languageId: lang.ma_ngon_ngu,
        }),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Lưu ngôn ngữ thất bại")

      const t = toast.success("Đã chọn " + lang.ten_ngon_ngu, { duration: 2000 })
      setTimeout(() => {
        toast.dismiss(t)
        router.push(`/course?lang=${lang.ma_ngon_ngu}`)
      }, 1000)
    } catch (error) {
      console.error(error)
      toast.error("Không thể lưu ngôn ngữ đã chọn")
    }
  }
 if (loading) return <Loading />
 
  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-6 text-center text-pink-500">
          Chọn một ngôn ngữ bạn muốn học
        </h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-items-center">
          { languages.map((lang) => {
            const isActive = selected === lang.ma_ngon_ngu
            return (
              <button
                key={lang.ma_ngon_ngu}
                onClick={() => handleSelect(lang)}
                className={`relative w-40 h-40 flex flex-col items-center justify-center rounded-2xl shadow transition hover:-translate-y-1 focus:outline-none bg-white cursor-pointer ${
                  isActive ? "ring-2 ring-pink-400" : ""
                }`}
              >
                <span
                  className={`absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full ${
                    isActive ? "bg-pink-500 text-white" : "bg-gray-200 text-gray-400"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M20.03 7.47a1 1 0 0 1 .05 1.41l-8.5 9a1 1 0 0 1-1.42.02l-4.5-4.3a1 1 0 1 1 1.4-1.43l3.79 3.62 7.79-8.25a1 1 0 0 1 1.39-.07z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <ReactCountryFlag
                  countryCode={lang.mo_ta ?? "UN"} 
                  svg
                  style={{ width: "3em", height: "3em", borderRadius: "4px" }}
                />
                <p className="mt-3 text-sm font-medium">{lang.ten_ngon_ngu}</p>
              </button>
            )
          })}
        </div>
      </div>
      <Toaster position="top-center" reverseOrder={false} />
    </Layout>
  )
}
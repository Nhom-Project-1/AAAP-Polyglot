"use client"

import Layout from "@/components/layout"
import { motion } from "framer-motion"
import { CheckCircle, ArrowRight } from "lucide-react"
import UserProgress from "@/components/user-progress"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useAuthStore } from "@/lib/store"
import Loading from "@/components/ui/loading"

type MucTieu = {
  ma_muc_tieu: number;
  diem_can_dat: number;
  hoan_thanh: boolean;
  phan_tram_hoan_thanh: number;
  ten_muc_tieu: string;
}

export default function GoalPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [mucTieuList, setMucTieuList] = useState<MucTieu[]>([])
  // const [tongXP, setTongXP] = useState(0) // Không cần state này nữa
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        const goalsRes = await fetch("/api/goal");

        if (!goalsRes.ok) throw new Error("Không thể tải danh sách mục tiêu.")

        const goalsDataFromApi: any[] = await goalsRes.json();

        // API đã trả về dữ liệu phẳng, chỉ cần tạo thêm tên mục tiêu
        const goalsData = goalsDataFromApi.map(goal => ({
          ...goal,
          ten_muc_tieu: `Kiếm được ${goal.diem_can_dat} XP`,
        }))
        setMucTieuList(goalsData)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?.id])

  return (
    <Layout>
      <div className="flex flex-col items-center min-h-screen py-8 gap-6 relative">
        <div className="flex justify-between items-start w-full px-8 relative">
          <div className="flex-1 flex flex-col gap-4 ml-20 mt-6">
            <h1 className="text-3xl font-semibold text-pink-500">Mục tiêu</h1>

            {loading ? (
              <p className="text-lg text-gray-500">Đang tải...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              mucTieuList.map(goal => {
                // Sử dụng trực tiếp trạng thái 'hoan_thanh' từ API
                const completed = goal.hoan_thanh;
                const progress = goal.phan_tram_hoan_thanh;


                return (
                  <div
                    key={goal.ma_muc_tieu}
                    className="flex flex-col gap-2 mb-8 transition-all"
                  >
                    {/* tên mục tiêu */}
                    <div className="text-gray-700 font-medium">
                      {goal.ten_muc_tieu}
                    </div>

                    {/* thanh tiến độ */}
                    <div className="relative w-full max-w-[500px]">
                      <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-pink-500"
                          animate={{ width: `${progress * 100}%` }}
                          transition={{ duration: 0.4, ease: "easeInOut" }}
                        />
                      </div>

                      {/* biểu tượng hoàn thành hoặc nút tiếp tục */}
                      {completed ? (
                        <CheckCircle className="absolute -right-8 top-[-4px] text-pink-500 h-6 w-6" />
                      ) : (
                        <div
                          className="absolute top-full right-0 mt-2 flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
                          onClick={async () => {
                            try {
                              const res = await fetch('/api/user-language')
                              const data = await res.json()
                              if (data.current) {
                                router.push(`/course?lang=${data.current.id}`)
                              } else {
                                router.push('/course/choose')
                              }
                            } catch {
                              router.push('/course/choose')
                            }
                          }}
                        >
                          <span className="text-pink-500 text-sm font-medium">
                            Tiếp tục học
                          </span>
                          <ArrowRight className="text-pink-500 h-5 w-5" />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* thanh tiến độ tổng */}
          <div className="flex-shrink-0 relative -top-6 -right-2">
            <UserProgress />
          </div>
        </div>
      </div>
    </Layout>
  )
}
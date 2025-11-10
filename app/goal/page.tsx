"use client"

import Layout from "@/components/layout"
import { motion } from "framer-motion"
import { CheckCircle, ArrowRight } from "lucide-react"
import UserProgress from "@/components/user-progress"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

type MucTieu = {
  ma_muc_tieu: number
  ten_muc_tieu: string
  diem_can_dat: number
  trang_thai: string
}

export default function GoalPage() {
  const router = useRouter()
  const [mucTieuList, setMucTieuList] = useState<MucTieu[]>([])
  const [tongXP, setTongXP] = useState(0)

  const mockMucTieu: MucTieu[] = [
    { ma_muc_tieu: 1, ten_muc_tieu: "Kiếm được 30XP", diem_can_dat: 30, trang_thai: "" },
    { ma_muc_tieu: 2, ten_muc_tieu: "Kiếm được 50XP", diem_can_dat: 50, trang_thai: "" },
    { ma_muc_tieu: 3, ten_muc_tieu: "Kiếm được 80XP", diem_can_dat: 80, trang_thai: "" },
    { ma_muc_tieu: 4, ten_muc_tieu: "Kiếm được 100XP", diem_can_dat: 100, trang_thai: "" },
  ]

  useEffect(() => {
    const savedXP = localStorage.getItem("userXP")
    const tong = savedXP ? parseInt(savedXP) : 0
    setTongXP(tong)

    const updatedGoals = mockMucTieu.map(goal => ({
      ...goal,
      trang_thai: tong >= goal.diem_can_dat ? "hoan thanh" : "dang hoc",
    }))
    setMucTieuList(updatedGoals)
  }, [])

  return (
    <Layout>
      <div className="flex flex-col items-center min-h-screen py-8 gap-6 relative">
        <div className="flex justify-between items-start w-full px-8 relative">
          <div className="flex-1 flex flex-col gap-4 ml-20 mt-6">
            <h1 className="text-3xl font-semibold text-pink-500">Mục tiêu</h1>

            {mucTieuList.map(goal => {
              const progress = Math.min(tongXP / goal.diem_can_dat, 1)
              const completed = goal.trang_thai === "hoan thanh"

              return (
                <div key={goal.ma_muc_tieu} className="flex flex-col gap-1 mb-8">
                  <div className="text-gray-700 font-medium">{goal.ten_muc_tieu}</div>

                  <div className="relative w-full max-w-[500px]">
                    <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-pink-500"
                        animate={{ width: `${progress * 100}%` }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                      />
                    </div>

                    {completed ? (
                      <CheckCircle className="absolute -right-8 top-[-4px] text-pink-500 h-6 w-6" />
                    ) : (
                      <div
                        className="absolute top-full right-0 mt-2 flex items-center gap-2 cursor-pointer"
                        onClick={() => {
                          const langData = localStorage.getItem("selectedLang")
                          if (langData) {
                            const langId = JSON.parse(langData).id
                            router.push(`/course?lang=${langId}`)
                          } else {
                            router.push("/course/choose")
                          }
                        }}
                      >
                        <span className="text-pink-500 text-sm font-medium">Tiếp tục học</span>
                        <ArrowRight className="text-pink-500 h-6 w-6" />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex-shrink-0 relative -top-6 -right-2">
            <UserProgress />
          </div>
        </div>
      </div>
    </Layout>
  )
}
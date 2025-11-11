"use client"

import { useState, useEffect } from "react"
import Layout from "@/components/layout"
import { motion } from "framer-motion"
import { Crown } from "lucide-react"
import { useAuthStore } from "@/lib/store"
import  Crying  from "@/components/ui/crying"
import { Skeleton } from "@/components/ui/skeleton"

interface RankingUser {
  ten_dang_nhap: string;
  tong_diem_xp: number;
}

interface RankingData {
  topRanking: RankingUser[];
  myRank: number | null;
  myScore: number | null;
}

// Component Skeleton cho một hàng trong bảng xếp hạng
const RankingRowSkeleton = () => (
  <div className="flex items-center py-3 px-3 border-b border-gray-200">
    {/* Hạng */}
    <Skeleton className="h-8 w-8 rounded-full mr-4" />
    {/* Tên người dùng */}
    <Skeleton className="h-5 w-32 rounded flex-grow" />
    {/* Điểm */}
    <Skeleton className="h-5 w-16 rounded ml-auto" />
  </div>
);

// Component Skeleton cho toàn bộ bảng xếp hạng
const RankingSkeleton = () => (
  <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-md animate-pulse">
    {/* Tiêu đề */}
    <Skeleton className="h-8 w-64 mx-auto mb-6" />

    {/* Header bảng */}
    <div className="flex items-center py-3 px-3 bg-pink-100 rounded-lg mb-2">
      <Skeleton className="h-4 w-12 mr-4" />
      <Skeleton className="h-4 w-24 flex-grow" />
      <Skeleton className="h-4 w-12 ml-auto" />
    </div>

    {/* Các hàng dữ liệu */}
    <RankingRowSkeleton />
    <RankingRowSkeleton />
    <RankingRowSkeleton />
    <RankingRowSkeleton />
    <RankingRowSkeleton />
  </div>
);

export default function RankingPage() {
  const { user } = useAuthStore()
  const [rankingData, setRankingData] = useState<RankingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const fetchRanking = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/ranking/top_ranking", {
          method: "GET",
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Không thể tải bảng xếp hạng.")
        setRankingData(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchRanking()
  }, [user?.id])

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center min-h-screen px-4 py-12">
          <RankingSkeleton />
        </div>
      </Layout>
    );
  }
  if (error) return <Layout><div className="text-center mt-10"><Crying /><p className="mt-4">{error}</p></div></Layout>
  if (!rankingData) return <Layout><p className="text-center mt-10">Không có dữ liệu xếp hạng.</p></Layout>

  const { topRanking, myRank, myScore } = rankingData
  const currentUser = user?.username || ""

  const isInTop = myRank !== null && myRank <= 10
  const showExtraRow = !isInTop
  const crownColors = ["text-yellow-400", "text-gray-400", "text-orange-400"]

  return (
    <Layout>
      <div className="flex justify-center min-h-screen px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-md"
        >
          <h1 className="text-3xl font-bold text-center mb-6 text-pink-500">
            Bảng xếp hạng
          </h1>

          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-pink-100 text-left text-sm uppercase text-gray-700">
                <th className="p-3 rounded-l-lg">Hạng</th>
                <th className="p-3">Người dùng</th>
                <th className="p-3 text-right rounded-r-lg">Điểm</th>
              </tr>
            </thead>
            <tbody>
              {topRanking.map((user, index) => (
                <motion.tr
                  key={user.ten_dang_nhap}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`border-b transition duration-300 ${
                    user.ten_dang_nhap === currentUser ? "bg-pink-100 font-semibold" : "hover:bg-pink-50"
                  } ${ index < 3 && user.ten_dang_nhap !== currentUser ? "font-semibold" : "" }`}
                >
                  <td className="p-3 w-16 text-center">
                    {index < 3 ? (
                      <motion.div
                        animate={{ y: [0, -4, 0] }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="relative flex justify-center items-center"
                      >
                        <Crown className={`h-10 w-10 ${crownColors[index]}`} />
                        <span
                          className={`absolute text-lg font-bold ${crownColors[index]}`}
                        >
                          {index + 1}
                        </span>
                      </motion.div>
                    ) : (
                      <span className="text-gray-700 text-base">{index + 1}</span>
                    )}
                  </td>
                  <td
                    className={`p-3 ${user.ten_dang_nhap === currentUser ? "text-pink-500" : ""}`}
                  >
                    {user.ten_dang_nhap}
                  </td>
                  <td
                    className={`p-3 text-right ${user.ten_dang_nhap === currentUser ? "text-pink-500" : "text-gray-800"
                      }`}
                  >
                    {user.tong_diem_xp}
                  </td>
                </motion.tr>
              ))}

              {showExtraRow && myRank && myScore !== null && (
                <>
                  <tr>
                    <td
                      colSpan={3}
                      className="h-10 text-center text-gray-400 text-lg"
                    >
                      ...
                    </td>
                  </tr>
                  <motion.tr
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-pink-100 font-semibold border-t-2 border-pink-200"
                  >
                    <td className="p-3 text-center text-pink-500">{myRank}</td>
                    <td className="p-3 text-pink-500 ">{currentUser}</td>
                    <td className="p-3 text-right text-pink-500 ">{myScore}</td>
                  </motion.tr>
                </>
              )}
            </tbody>
          </table>
        </motion.div>
      </div>
    </Layout>
  )
}
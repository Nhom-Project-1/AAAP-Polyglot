"use client"

import Layout from "@/components/layout"
import { motion } from "framer-motion"
import { Crown } from "lucide-react"

export default function RankingPage() {
  const mockResponse = {
    topRanking: [
      { ma_nguoi_dung: "nguyenvana", tong_diem_xp: 950 },
      { ma_nguoi_dung: "lethib", tong_diem_xp: 880 },
      { ma_nguoi_dung: "tranquoc", tong_diem_xp: 860 },
      { ma_nguoi_dung: "phamlinh", tong_diem_xp: 830 },
      { ma_nguoi_dung: "ngocmai", tong_diem_xp: 800 },
      { ma_nguoi_dung: "minhduc", tong_diem_xp: 770 },
      { ma_nguoi_dung: "hoangnam", tong_diem_xp: 750 },
      { ma_nguoi_dung: "lananh", tong_diem_xp: 730 },
      { ma_nguoi_dung: "phuong", tong_diem_xp: 710 },
      { ma_nguoi_dung: "tuan", tong_diem_xp: 700 },
    ],
    myRank: 19,
    myScore: 50,
  }

  const { topRanking, myRank, myScore } = mockResponse
  const currentUser = "phuonganh"

  const isInTop = topRanking.some(u => u.ma_nguoi_dung === currentUser)
  const showExtraRow = !isInTop
  const crownColors = ["text-yellow-400", "text-gray-400", "text-orange-400"]

  return (
    <Layout>
      <div className="flex justify-center items-center min-h-screen px-4">
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
                  key={user.ma_nguoi_dung}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`border-b hover:bg-pink-50 transition duration-300 ${
                    index < 3 ? "font-semibold" : ""
                  }`}
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
                    className={`p-3 ${
                      user.ma_nguoi_dung === currentUser
                        ? "text-pink-500 font-semibold"
                        : ""
                    }`}
                  >
                    {user.ma_nguoi_dung}
                  </td>
                  <td
                    className={`p-3 text-right ${
                      user.ma_nguoi_dung === currentUser
                        ? "text-pink-500 font-semibold"
                        : "text-gray-800"
                    }`}
                  >
                    {user.tong_diem_xp}
                  </td>
                </motion.tr>
              ))}

              {showExtraRow && (
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
                    className="bg-pink-50 font-medium border-t-2 border-pink-200"
                  >
                    <td className="p-3 text-center text-gray-700">{myRank}</td>
                    <td className="p-3 text-pink-500">{currentUser}</td>
                    <td className="p-3 text-right text-pink-500">{myScore}</td>
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

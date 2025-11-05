"use client"

import Layout from "@/components/layout"
import { motion } from "framer-motion"
import { Crown } from "lucide-react"

export default function RankingPage() {
  const users = [
    { username: "nguyenvana", score: 950 },
    { username: "lethib", score: 880 },
    { username: "tranquoc", score: 860 },
    { username: "phamlinh", score: 830 },
    { username: "ngocmai", score: 800 },
    { username: "minhduc", score: 770 },
    { username: "hoangnam", score: 750 },
    { username: "lananh", score: 730 },
    { username: "vuongtuan", score: 710 },
    { username: "buiha", score: 700 },
  ]

  const currentUser = { username: "phuonganh", score: 450 }

  const crownColors = ["text-yellow-400", "text-gray-400", "text-orange-400"]

  const allUsers = [...users]
  if (!allUsers.some(u => u.username === currentUser.username)) {
    allUsers.push(currentUser)
  }
  allUsers.sort((a, b) => b.score - a.score)

  const top10 = allUsers.slice(0, 10)
  const isInTop = top10.some(u => u.username === currentUser.username)
  const showExtraRow = !isInTop && allUsers.length > 10

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
                <th className="p-3">Tên đăng nhập</th>
                <th className="p-3 text-right rounded-r-lg">Điểm</th>
              </tr>
            </thead>
            <tbody>
              {top10.map((user, index) => (
                <motion.tr
                  key={user.username}
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
                      user.username === currentUser.username
                        ? "text-pink-500 font-semibold"
                        : ""
                    }`}
                  >
                    {user.username}
                  </td>
                  <td
                    className={`p-3 text-right ${
                      user.username === currentUser.username
                        ? "text-pink-500 font-semibold"
                        : "text-gray-800"
                    }`}
                  >
                    {user.score}
                  </td>
                </motion.tr>
              ))}

              {showExtraRow && (
                <>
                  <tr>
                    <td colSpan={3} className="h-10 text-center text-gray-400 text-lg">
                      ...
                    </td>
                  </tr>
                  <motion.tr
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-pink-50 font-medium border-t-2 border-pink-200"
                  >
                    <td className="p-3 text-center text-gray-500">–</td>
                    <td className="p-3 text-pink-500">{currentUser.username}</td>
                    <td className="p-3 text-right text-pink-500">{currentUser.score}</td>
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

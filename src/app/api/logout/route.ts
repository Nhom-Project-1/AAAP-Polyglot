import { NextResponse } from "next/server"

export async function POST() {
  const res = NextResponse.json({ message: "Đã đăng xuất" })
  res.cookies.delete("token") // Xóa JWT cookie
  return res
}

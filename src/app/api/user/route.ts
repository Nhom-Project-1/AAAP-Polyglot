import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import db, { schema } from "../../../../db/drizzle"
import { eq } from "drizzle-orm"

const JWT_SECRET = process.env.JWT_SECRET!

export async function GET(req: NextRequest) {
  try {
    // 🔒 1. Lấy token từ cookie
    const token = req.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

    // 🧩 2. Giải mã JWT
    let decoded: string | jwt.JwtPayload
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (err) {
      return NextResponse.json({ error: "Token không hợp lệ hoặc đã hết hạn" }, { status: 401 })
    }

    console.log("🍪 Token lấy từ cookie:", token)
    console.log("📦 Decoded token:", decoded)
    
    const maNguoiDung = (decoded as jwt.JwtPayload)?.ma_nguoi_dung || (decoded as jwt.JwtPayload)?.userId
    if (!maNguoiDung) {
      return NextResponse.json({ error: "Thiếu thông tin người dùng trong token" }, { status: 400 })
    }



    // 🗄️ 3. Lấy thông tin từ database
    const user = await db.query.nguoi_dung.findFirst({
      where: (nguoi_dung, { eq }) => eq(nguoi_dung.ma_nguoi_dung, maNguoiDung),
    })

    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 })
    }

    // ✅ 4. Trả thông tin user về FE
    return NextResponse.json({
      id: user.ma_nguoi_dung,
      fullName: user.ho_ten,
      username: user.ten_dang_nhap,
      email: user.email,
    })
  } catch (err) {
    console.error("❌ Lỗi khi lấy thông tin người dùng:", err)
    return NextResponse.json({ error: "Không thể lấy thông tin người dùng" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { auth, clerkClient } from "@clerk/nextjs/server"
import db, { schema } from "../../../../db/drizzle"
import { eq } from "drizzle-orm"

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

    const client = await clerkClient()
    const user = await client.users.getUser(userId)

    const email = user.primaryEmailAddress?.emailAddress?.toLowerCase()
    if (!email) {
      return NextResponse.json({ error: "Không tìm thấy email người dùng" }, { status: 400 })
    }

    // lấy từ DB
    const rows = await db
      .select({
        id: schema.nguoi_dung.ma_nguoi_dung,
        ten_dang_nhap: schema.nguoi_dung.ten_dang_nhap,
        email: schema.nguoi_dung.email,
        ngay_tao: schema.nguoi_dung.ngay_tao,
        ngay_cap_nhat: schema.nguoi_dung.ngay_cap_nhat,
      })
      .from(schema.nguoi_dung)
      .where(eq(schema.nguoi_dung.email, email))
      .limit(1)

    const dbUser = rows[0]
    if (!dbUser) {
      return NextResponse.json({ error: "Không tìm thấy người dùng trong DB" }, { status: 404 })
    }

    // lấy họ tên từ Clerk (vì DB không có cột họ tên)
    const fullName = (user.publicMetadata?.fullName as string | undefined) || ""

    return NextResponse.json({
      id: dbUser.id,
      fullName,
      username: dbUser.ten_dang_nhap,
      email: dbUser.email,
      createdAt: dbUser.ngay_tao,
      updatedAt: dbUser.ngay_cap_nhat,
    })
  } catch (err) {
    console.error("Lỗi khi lấy thông tin người dùng:", err)
    return NextResponse.json({ error: "Không thể lấy thông tin người dùng" }, { status: 500 })
  }
}
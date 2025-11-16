import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import db from "../../../../db/drizzle"
import { nguoi_dung } from "../../../../db/schema"
import { assertAdmin } from "../../../../lib/auth"
import { eq, and, ne } from "drizzle-orm"
import bcrypt from "bcryptjs"

const JWT_SECRET = process.env.JWT_SECRET!

// -------------------- GET --------------------
export async function GET(req: NextRequest) {
  try {
    const sp = new URL(req.url).searchParams
    const isAdminView = sp.get("admin") === "true"

    if (isAdminView) {
      // 🔒 chỉ admin được phép xem toàn bộ danh sách
      await assertAdmin()
      const users = await db.select().from(nguoi_dung)
      return NextResponse.json(users)
    }

    // 👤 lấy token từ cookie (user thường)
    const token = req.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
    }

    let decoded: jwt.JwtPayload
    try {
      decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload
    } catch {
      return NextResponse.json({ error: "Token không hợp lệ hoặc hết hạn" }, { status: 401 })
    }

    const maNguoiDung = decoded?.ma_nguoi_dung || decoded?.userId
    if (!maNguoiDung) {
      return NextResponse.json({ error: "Thiếu thông tin người dùng trong token" }, { status: 400 })
    }

    const user = await db.query.nguoi_dung.findFirst({
      columns: {
        ma_nguoi_dung: true,
        ho_ten: true,
        ten_dang_nhap: true,
        email: true,
      },
      where: (nguoi_dung, { eq }) => eq(nguoi_dung.ma_nguoi_dung, Number(maNguoiDung)),
    })

    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 })
    }

    return NextResponse.json({
      id: user.ma_nguoi_dung,
      fullName: user.ho_ten,
      username: user.ten_dang_nhap,
      email: user.email,
    })
  } catch (err: any) {
    console.error("❌ Lỗi khi GET người dùng:", err)
    return NextResponse.json(
      { error: err.message || "Không thể lấy thông tin người dùng" },
      { status: 500 }
    )
  }
}

// -------------------- DELETE --------------------
export async function DELETE(req: NextRequest) {
  try {
    await assertAdmin()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Thiếu mã người dùng cần xóa." }, { status: 400 })
    }

    const existingUser = await db.query.nguoi_dung.findFirst({
      where: (nguoi_dung, { eq }) => eq(nguoi_dung.ma_nguoi_dung, Number(id)),
    })

    if (!existingUser) {
      return NextResponse.json({ error: "Người dùng không tồn tại." }, { status: 404 })
    }

    await db.delete(nguoi_dung).where(eq(nguoi_dung.ma_nguoi_dung, Number(id)))
    return NextResponse.json({ message: `Đã xóa '${existingUser.ten_dang_nhap}' thành công.` })
  } catch (err: any) {
    console.error("❌ Lỗi khi xóa người dùng:", err)
    return NextResponse.json(
      { error: err.message || "Không thể xóa người dùng." },
      { status: err.status || 500 }
    )
  }
}

// -------------------- PUT --------------------
export async function PUT(req: NextRequest) {
  try {
    await assertAdmin()
    const { id, ho_ten, ten_dang_nhap } = await req.json()

    if (!id) {
      return NextResponse.json({ error: "Thiếu mã người dùng cần cập nhật." }, { status: 400 })
    }

    const existingUser = await db.query.nguoi_dung.findFirst({
      where: (nguoi_dung, { eq }) => eq(nguoi_dung.ma_nguoi_dung, Number(id)),
    })
    if (!existingUser) {
      return NextResponse.json({ error: "Người dùng không tồn tại." }, { status: 404 })
    }

    const updateData: Record<string, any> = {}

    if (ho_ten && ho_ten !== existingUser.ho_ten) updateData.ho_ten = ho_ten

    if (ten_dang_nhap && ten_dang_nhap !== existingUser.ten_dang_nhap) {
      const usernameExists = await db.query.nguoi_dung.findFirst({
        where: (nguoi_dung, { eq, and, ne }) =>
          and(eq(nguoi_dung.ten_dang_nhap, ten_dang_nhap), ne(nguoi_dung.ma_nguoi_dung, Number(id))),
      })
      if (usernameExists) {
        return NextResponse.json({ error: "Tên đăng nhập đã tồn tại." }, { status: 400 })
      }
      updateData.ten_dang_nhap = ten_dang_nhap
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "Không có thay đổi nào được thực hiện." })
    }

    await db.update(nguoi_dung).set(updateData).where(eq(nguoi_dung.ma_nguoi_dung, Number(id)))

    return NextResponse.json({ message: "Cập nhật người dùng thành công." })
  } catch (err: any) {
    console.error("❌ Lỗi khi cập nhật người dùng:", err)
    return NextResponse.json(
      { error: err.message || "Không thể cập nhật người dùng." },
      { status: err.status || 500 }
    )
  }
}
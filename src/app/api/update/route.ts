import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import db, { schema } from "../../../../db/drizzle"
import { eq, and, ne } from "drizzle-orm"

const JWT_SECRET = process.env.JWT_SECRET!

type Body = {
  fullName?: string
  username?: string
  currentPassword?: string
  newPassword?: string
}

export async function PATCH(req: NextRequest) {
  try {
    // 🔹 Lấy token từ cookie và giải mã
    const token = req.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 })
    }

    const decoded: string | jwt.JwtPayload = jwt.verify(token, JWT_SECRET)
    const maNguoiDung = (decoded as jwt.JwtPayload).userId

    // 🔹 Parse body
    const { fullName, username, currentPassword, newPassword } =
      (await req.json()) as Body

    if (!fullName && !username && !newPassword) {
      return NextResponse.json(
        { error: "Không có dữ liệu để cập nhật." },
        { status: 400 }
      )
    }

    // 🔹 Lấy thông tin user hiện tại
    const user = await db.query.nguoi_dung.findFirst({
      where: (nguoi_dung, { eq }) => eq(nguoi_dung.ma_nguoi_dung, maNguoiDung),
    })

    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy người dùng." }, { status: 404 })
    }

    // 🔹 Kiểm tra username trùng
    if (username && username !== user.ten_dang_nhap) {
      const dup = await db.query.nguoi_dung.findFirst({
        where: (nguoi_dung, { eq, ne }) =>
          and(
            eq(nguoi_dung.ten_dang_nhap, username),
            ne(nguoi_dung.ma_nguoi_dung, maNguoiDung)
          ),
      })
      if (dup) {
        return NextResponse.json({ error: "Tên đăng nhập đã tồn tại." }, { status: 409 })
      }
    }

    // 🔹 Kiểm tra mật khẩu cũ nếu đổi mật khẩu
    let nextHash: string | undefined
    if (currentPassword && !newPassword) {
      // Người dùng nhập currentPassword nhưng không nhập newPassword → báo lỗi
      return NextResponse.json(
        { error: "Vui lòng nhập mật khẩu mới hoặc để trống mật khẩu hiện tại để thực hiện những thay đổi khác." },
        { status: 400 }
      )
    }
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Cần nhập mật khẩu hiện tại." }, { status: 400 })
      }

      const ok = await bcrypt.compare(currentPassword, user.mat_khau_hash)
      if (!ok) {
        return NextResponse.json({ error: "Mật khẩu hiện tại không đúng." }, { status: 400 })
      }

      const sameAsOld = await bcrypt.compare(newPassword, user.mat_khau_hash)
      if (sameAsOld) {
        return NextResponse.json(
          { error: "Mật khẩu mới bị trùng mật khẩu hiện tại." },
          { status: 400 }
        )
      }

      if (newPassword.length < 8) {
        return NextResponse.json({ error: "Mật khẩu mới phải từ 8 ký tự trở lên." },{ status: 400 })}
      if (newPassword.includes(" ")) {
        return NextResponse.json({ error: "Mật khẩu không được chứa khoảng trắng." }, { status: 400 });
      }
      if (!/[A-Z]/.test(newPassword)) {
        return NextResponse.json({ error: "Mật khẩu cần ít nhất 1 chữ in hoa." }, { status: 400 });
      }
      if (!/[0-9]/.test(newPassword)) {
        return NextResponse.json({ error: "Mật khẩu cần ít nhất 1 chữ số." }, { status: 400 });
      }
      const specialChars = newPassword.match(/[!@#$%^&*(),.?":{}|<>]/g)
      if (!specialChars || specialChars.length < 2) {
        return NextResponse.json({ error: "Mật khẩu cần ít nhất 2 ký tự đặc biệt." }, { status: 400 })
      }

      nextHash = await bcrypt.hash(newPassword, 10)
    }

    // 🔹 Tạo object cập nhật
    const updates: Partial<typeof schema.nguoi_dung.$inferInsert> = {}
    if (fullName && fullName.trim() !== user.ho_ten) updates.ho_ten = fullName.trim()
    if (username && username.trim() !== user.ten_dang_nhap)
      updates.ten_dang_nhap = username.trim()
    if (nextHash) updates.mat_khau_hash = nextHash
    

    // 🔹 Nếu không có thay đổi thật sự
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Không có thay đổi nào để cập nhật." }, { status: 400 })
    }

    updates.ngay_cap_nhat = new Date()
    // 🔹 Thực hiện cập nhật
    const updated = await db
      .update(schema.nguoi_dung)
      .set(updates)
      .where(eq(schema.nguoi_dung.ma_nguoi_dung, maNguoiDung))
      .returning({
        ma_nguoi_dung: schema.nguoi_dung.ma_nguoi_dung,
        ho_ten: schema.nguoi_dung.ho_ten,
        ten_dang_nhap: schema.nguoi_dung.ten_dang_nhap,
        email: schema.nguoi_dung.email,
        ngay_cap_nhat: schema.nguoi_dung.ngay_cap_nhat,
      })

    return NextResponse.json({ message: "Cập nhật thành công!", user: updated[0] },{ status: 200 })
  } catch (err) {
    console.error("❌ Lỗi update:", err)
    return NextResponse.json({ error: "Có lỗi xảy ra khi cập nhật!" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Update API OK",
    expects: {
      username: "Tùy chọn",
      fullName: "Tùy chọn",
      currentPassword: "Bắt buộc nếu đổi mật khẩu",
      newPassword: "Tùy chọn",
    },
  })
}

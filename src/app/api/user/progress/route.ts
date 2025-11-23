import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import db from "../../../../../db/drizzle";
import { bai_hoc_hoan_thanh } from "../../../../../db/schema";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    let decoded: jwt.JwtPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    } catch {
      return NextResponse.json({ error: "Token không hợp lệ" }, { status: 401 });
    }

    const maNguoiDung = decoded?.ma_nguoi_dung || decoded?.userId;
    if (!maNguoiDung) {
      return NextResponse.json({ error: "Lỗi xác thực người dùng" }, { status: 400 });
    }

    const { ma_bai_hoc } = await req.json();
    if (!ma_bai_hoc) {
      return NextResponse.json({ error: "Thiếu mã bài học" }, { status: 400 });
    }

    // Insert completion record, ignore if already exists (due to unique constraint)
    await db
      .insert(bai_hoc_hoan_thanh)
      .values({
        ma_nguoi_dung: Number(maNguoiDung),
        ma_bai_hoc: Number(ma_bai_hoc),
      })
      .onConflictDoNothing();

    return NextResponse.json({ message: "Đã ghi nhận hoàn thành bài học" });
  } catch (error: any) {
    console.error("Error marking lesson complete:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi server" },
      { status: 500 }
    );
  }
}

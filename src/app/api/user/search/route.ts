import { NextRequest, NextResponse } from "next/server";
import db from "../../../../../db/drizzle";
import { nguoi_dung } from "../../../../../db/schema";
import { assertAdmin } from "../../../../../lib/auth";
import { sql, or } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    await assertAdmin();

    const sp = new URL(req.url).searchParams;
    const q = sp.get("q")?.trim() || "";

    let users;

    if (q) {
      users = await db
        .select({
          ma_nguoi_dung: nguoi_dung.ma_nguoi_dung,
          ten_dang_nhap: nguoi_dung.ten_dang_nhap,
          email: nguoi_dung.email,
          ho_ten: nguoi_dung.ho_ten,
          ngay_tao: nguoi_dung.ngay_tao,
        })
        .from(nguoi_dung)
        .where(
          or(
            sql`${nguoi_dung.ho_ten} LIKE ${'%' + q + '%'}`,
            sql`${nguoi_dung.ten_dang_nhap} LIKE ${'%' + q + '%'}`,
            sql`${nguoi_dung.email} LIKE ${'%' + q + '%'}`
          )
        );
    } else {
      users = await db
        .select({
          ma_nguoi_dung: nguoi_dung.ma_nguoi_dung,
          ten_dang_nhap: nguoi_dung.ten_dang_nhap,
          email: nguoi_dung.email,
          ho_ten: nguoi_dung.ho_ten,
          ngay_tao: nguoi_dung.ngay_tao,
        })
        .from(nguoi_dung);
    }

    return NextResponse.json(users);
  } catch (error: any) {
    console.error("❌ Lỗi khi tìm kiếm người dùng:", error);
    return NextResponse.json(
      { message: error.message || "Không thể lấy danh sách người dùng" },
      { status: 500 }
    );
  }
}

import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "../../../../db/drizzle";
import { bang_xep_hang, tien_do } from "../../../../db/schema";

export async function POST() {
  try {
    const tongXPTheoNguoiDung = await db
      .select({
        ma_nguoi_dung: tien_do.ma_nguoi_dung,
        tong_diem_xp: sql<number>`SUM(${tien_do.diem_kinh_nghiem})`,
      })
      .from(tien_do)
      .groupBy(tien_do.ma_nguoi_dung);

    // Filter out null user IDs and prepare data for bulk upsert
    const validUsers = tongXPTheoNguoiDung
      .filter(row => row.ma_nguoi_dung !== null)
      .map(row => ({
        ma_nguoi_dung: row.ma_nguoi_dung!,
        tong_diem_xp: row.tong_diem_xp,
      }));

    if (validUsers.length === 0) {
      return NextResponse.json({
        message: "Không có dữ liệu để cập nhật",
        so_nguoi: 0,
      });
    }

    // Bulk upsert - 1 query instead of 2N queries!
    await db.insert(bang_xep_hang)
      .values(validUsers)
      .onConflictDoUpdate({
        target: bang_xep_hang.ma_nguoi_dung,
        set: { tong_diem_xp: sql`excluded.tong_diem_xp` }
      });

    return NextResponse.json({
      message: "Cập nhật bảng xếp hạng thành công!",
      so_nguoi: validUsers.length,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật bảng xếp hạng:", error);
    return NextResponse.json(
      { error: "Lỗi khi cập nhật bảng xếp hạng" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const topRanking = await db
      .select()
      .from(bang_xep_hang)
      .orderBy(sql`${bang_xep_hang.tong_diem_xp} DESC`)
      .limit(10);

    return NextResponse.json(topRanking);
  } catch (error) {
    console.error("Lỗi khi lấy bảng xếp hạng:", error);
    return NextResponse.json(
      { error: "Lỗi khi lấy bảng xếp hạng" },
      { status: 500 }
    );
  }
}
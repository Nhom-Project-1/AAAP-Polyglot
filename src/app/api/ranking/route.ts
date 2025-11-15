import { NextResponse } from "next/server";
import { db } from "../../../../db/drizzle";
import { bang_xep_hang, tien_do } from "../../../../db/schema";
import { sql, eq } from "drizzle-orm";

export async function POST() {
  try {
    const tongXPTheoNguoiDung = await db
      .select({
        ma_nguoi_dung: tien_do.ma_nguoi_dung,
        tong_diem_xp: sql<number>`SUM(${tien_do.diem_kinh_nghiem})`,
      })
      .from(tien_do)
      .groupBy(tien_do.ma_nguoi_dung);


      for (const row of tongXPTheoNguoiDung) {
      const { ma_nguoi_dung, tong_diem_xp } = row;

      if(!ma_nguoi_dung) continue;

      const existing = await db.query.bang_xep_hang.findFirst({
        where: eq(bang_xep_hang.ma_nguoi_dung, ma_nguoi_dung),
      });

      if (existing) {
        await db
          .update(bang_xep_hang)
          .set({ tong_diem_xp })
          .where(eq(bang_xep_hang.ma_nguoi_dung, ma_nguoi_dung));
      } else {
        await db.insert(bang_xep_hang).values({
          ma_nguoi_dung,
          tong_diem_xp,
        });
      }
    }

    return NextResponse.json({
      message: "Cập nhật bảng xếp hạng thành công!",
      so_nguoi: tongXPTheoNguoiDung.length,
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

import { NextResponse } from "next/server";
import { db } from "../../../../../../db/drizzle";
import { tien_do_muc_tieu, muc_tieu, tien_do } from "../../../../../../db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function PATCH(request: Request) {
  try {
    const { ma_nguoi_dung, ma_muc_tieu } = await request.json();

    const [goal] = await db
      .select()
      .from(muc_tieu)
      .where(eq(muc_tieu.ma_muc_tieu, ma_muc_tieu));

    if (!goal) return NextResponse.json({ error: "Không tìm thấy mục tiêu" });

    const totalXPResult = await db
      .select({
        tong_xp: sql<number>`COALESCE(SUM(${tien_do.diem_kinh_nghiem}), 0)`.mapWith(Number),
      })
      .from(tien_do)
      .where(eq(tien_do.ma_nguoi_dung, ma_nguoi_dung));

    const tongXP = totalXPResult[0]?.tong_xp ?? 0;

    const [progress] = await db
      .select()
      .from(tien_do_muc_tieu)
      .where(
        and(
          eq(tien_do_muc_tieu.ma_nguoi_dung, ma_nguoi_dung),
          eq(tien_do_muc_tieu.ma_muc_tieu, ma_muc_tieu)
        )
      );

    const completed = tongXP >= goal.diem_can_dat;

    if (progress) {
      await db
        .update(tien_do_muc_tieu)
        .set({ diem_hien_tai: tongXP, hoan_thanh: completed })
        .where(
          and(
            eq(tien_do_muc_tieu.ma_nguoi_dung, ma_nguoi_dung),
            eq(tien_do_muc_tieu.ma_muc_tieu, ma_muc_tieu)
          )
        );
    } else {
      await db.insert(tien_do_muc_tieu).values({
        ma_nguoi_dung,
        ma_muc_tieu,
        diem_hien_tai: tongXP,
        hoan_thanh: completed,
      });
    }

    return NextResponse.json({
      message: "Cập nhật tiến độ mục tiêu thành công",
      tong_xp: tongXP,
      hoan_thanh: completed,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật tiến độ:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

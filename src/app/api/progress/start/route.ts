import { NextResponse } from "next/server";
import { db } from "../../../../../db/drizzle";
import { nguoi_dung_ngon_ngu, bai_hoc, unit, tien_do } from "../../../../../db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { ma_nguoi_dung, ma_ngon_ngu } = await req.json();

    if (!ma_nguoi_dung || !ma_ngon_ngu) {
      return NextResponse.json({ error: "Thiếu tham số" }, { status: 400 });
    }

    await db.insert(nguoi_dung_ngon_ngu).values({
      ma_nguoi_dung,
      ma_ngon_ngu,
      is_active: true,
    }).onConflictDoUpdate({
      target: [nguoi_dung_ngon_ngu.ma_nguoi_dung, nguoi_dung_ngon_ngu.ma_ngon_ngu],
      set: { is_active: true },
    });

    const lessons = await db
      .select({ ma_bai_hoc: bai_hoc.ma_bai_hoc })
      .from(bai_hoc)
      .innerJoin(unit, eq(unit.ma_don_vi, bai_hoc.ma_don_vi))
      .where(eq(unit.ma_ngon_ngu, ma_ngon_ngu));

    if (lessons.length === 0) {
      return NextResponse.json({ error: "Ngôn ngữ này chưa có bài học nào" }, { status: 404 });
    }

    // 3️⃣ Kiểm tra tiến độ đã tồn tại chưa
    const existingProgress = await db
      .select()
      .from(tien_do)
      .where(eq(tien_do.ma_nguoi_dung, ma_nguoi_dung));

    const existingLessonIds = new Set(
      existingProgress.map((p: any) => p.ma_bai_hoc)
    );

    const newProgress = lessons
      .filter((l) => !existingLessonIds.has(l.ma_bai_hoc))
      .map((l) => ({
        ma_nguoi_dung,
        ma_bai_hoc: l.ma_bai_hoc,
        diem_kinh_nghiem: 0,
        so_tim_con_lai: 5,
        trang_thai: "dang_hoc",
      }));

    if (newProgress.length === 0) {
      return NextResponse.json({ message: "Tiến độ đã tồn tại" });
    }

    await db.insert(tien_do).values(newProgress);

    return NextResponse.json({
      message: "Đã khởi tạo tiến độ học thành công",
      so_bai_hoc: newProgress.length,
    });
  } catch (error) {
    console.error("Lỗi khi khởi tạo tiến độ:", error);
    return NextResponse.json({ error: "Không thể khởi tạo tiến độ" }, { status: 500 });
  }
}

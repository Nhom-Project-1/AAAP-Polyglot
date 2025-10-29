import { NextResponse } from "next/server";
import { db } from "../../../../../db/drizzle";
import { lua_chon_thu_thach, thu_thach, tien_do } from "../../../../../db/schema";
import { and, eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { ma_nguoi_dung, ma_bai_hoc, ma_lua_chon } = await req.json();

    if (!ma_nguoi_dung || !ma_bai_hoc || !ma_lua_chon) {
      return NextResponse.json({ error: "Thiếu tham số cần thiết" }, { status: 400 });
    }

    const dapAn = await db.query.lua_chon_thu_thach.findFirst({
      where: eq(lua_chon_thu_thach.ma_lua_chon, ma_lua_chon),
      columns: { dung: true },
    });

    if (!dapAn)
      return NextResponse.json({ error: "Không tìm thấy lựa chọn" }, { status: 404 });

    const progress = await db.query.tien_do.findFirst({
      where: and(
        eq(tien_do.ma_nguoi_dung, ma_nguoi_dung),
        eq(tien_do.ma_bai_hoc, ma_bai_hoc)
      ),
    });

    if (!progress)
      return NextResponse.json(
        { error: "Người dùng chưa có tiến độ học cho bài này" },
        { status: 404 }
      );

    if (dapAn.dung) {
      const newXP = progress.diem_kinh_nghiem + 10;

      await db
        .update(tien_do)
        .set({
          diem_kinh_nghiem: newXP,
          trang_thai: "dang_hoc",
        })
        .where(eq(tien_do.ma_tien_do, progress.ma_tien_do));

      const totalChallenges = await db
        .select({ count: thu_thach.ma_thu_thach })
        .from(thu_thach)
        .where(eq(thu_thach.ma_bai_hoc, ma_bai_hoc));

      const xpNeeded = (totalChallenges[0]?.count ?? 0) * 10;

      if (newXP >= xpNeeded && progress.so_tim_con_lai > 0) {
        await db
          .update(tien_do)
          .set({ trang_thai: "hoan_thanh" })
          .where(eq(tien_do.ma_tien_do, progress.ma_tien_do));

        return NextResponse.json({
          correct: true,
          message: "Chính xác! 🎉 Bạn đã hoàn thành toàn bộ bài học!",
          diem_moi: newXP,
          hoan_thanh: true,
        });
      }

      return NextResponse.json({
        correct: true,
        message: "Chính xác! +10 điểm 🎯",
        diem_moi: newXP,
      });
    }

    const newHeart = Math.max(progress.so_tim_con_lai - 1, 0);

    if (newHeart === 0) {
      await db
        .update(tien_do)
        .set({
          diem_kinh_nghiem: 0,
          so_tim_con_lai: 5,
          trang_thai: "that_bai",
        })
        .where(eq(tien_do.ma_tien_do, progress.ma_tien_do));

      return NextResponse.json({
        correct: false,
        message: "Hết tim rồi. Bài học sẽ được làm lại!",
        so_tim_con_lai: 5,
        reset: true,
      });
    }

    await db
      .update(tien_do)
      .set({
        so_tim_con_lai: newHeart,
        trang_thai: "dang_hoc",
      })
      .where(eq(tien_do.ma_tien_do, progress.ma_tien_do));

    return NextResponse.json({
      correct: false,
      message: "Sai mất rồi. Bạn bị -1 tim",
      so_tim_con_lai: newHeart,
    });
  } catch (error) {
    console.error("Lỗi khi xử lý câu trả lời:", error);
    return NextResponse.json({ error: "Lỗi khi xử lý câu trả lời" }, { status: 500 });
  }
}

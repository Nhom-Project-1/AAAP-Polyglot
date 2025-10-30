import { NextResponse } from "next/server";
import { db } from "../../../../../db/drizzle";
import {
  lua_chon_thu_thach,
  thu_thach,
  tien_do,
  cau_tra_loi_nguoi_dung,
} from "../../../../../db/schema";
import { and, eq, count, sql } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { ma_nguoi_dung, ma_bai_hoc, ma_lua_chon, ma_thu_thach } = await req.json();

    if (!ma_nguoi_dung || !ma_bai_hoc || !ma_lua_chon || !ma_thu_thach) {
      return NextResponse.json({ error: "Thiếu tham số cần thiết" }, { status: 400 });
    }

    const dapAn = await db.query.lua_chon_thu_thach.findFirst({
      where: and(
        eq(lua_chon_thu_thach.ma_lua_chon, ma_lua_chon),
        eq(lua_chon_thu_thach.ma_thu_thach, ma_thu_thach) 
      ),
      columns: { dung: true },
    });
    if (!dapAn) return NextResponse.json({ error: "Không tìm thấy lựa chọn" }, { status: 404 });

    let progress = await db.query.tien_do.findFirst({
      where: and(eq(tien_do.ma_nguoi_dung, ma_nguoi_dung), eq(tien_do.ma_bai_hoc, ma_bai_hoc)),
      columns: { ma_tien_do: true, diem_kinh_nghiem: true, so_tim_con_lai: true, trang_thai: true },
    });
    if (!progress) {
      const inserted = await db
        .insert(tien_do)
        .values({
          ma_nguoi_dung,
          ma_bai_hoc,
          diem_kinh_nghiem: 0,
          so_tim_con_lai: 5,
          trang_thai: "dang_hoc",
        })
        .returning({
          ma_tien_do: tien_do.ma_tien_do,
          diem_kinh_nghiem: tien_do.diem_kinh_nghiem,
          so_tim_con_lai: tien_do.so_tim_con_lai,
          trang_thai: tien_do.trang_thai,
        });
      progress = inserted[0];
    }

    const totalChallenges = await db
      .select({ total: count(thu_thach.ma_thu_thach) })
      .from(thu_thach)
      .where(eq(thu_thach.ma_bai_hoc, ma_bai_hoc));
    const total = totalChallenges[0]?.total ?? 0;

    const maxLanLamRow = await db
      .select({ max_lan: sql<number>`COALESCE(MAX(${cau_tra_loi_nguoi_dung.lan_lam}), 0)` })
      .from(cau_tra_loi_nguoi_dung)
      .where(and(eq(cau_tra_loi_nguoi_dung.ma_bai_hoc, ma_bai_hoc), eq(cau_tra_loi_nguoi_dung.ma_nguoi_dung, ma_nguoi_dung)));
    const maxLan = maxLanLamRow[0]?.max_lan ?? 0;

    let lan_lam_hien_tai = maxLan === 0 ? 1 : maxLan;

    let daLamTrongLanMax = 0;
    if (maxLan > 0) {
      const daLamCountMax = await db
        .select({ da_lam: count(cau_tra_loi_nguoi_dung.id) })
        .from(cau_tra_loi_nguoi_dung)
        .where(
          and(
            eq(cau_tra_loi_nguoi_dung.ma_bai_hoc, ma_bai_hoc),
            eq(cau_tra_loi_nguoi_dung.ma_nguoi_dung, ma_nguoi_dung),
            eq(cau_tra_loi_nguoi_dung.lan_lam, maxLan)
          )
        );
      daLamTrongLanMax = daLamCountMax[0]?.da_lam ?? 0;
    }

    if ((maxLan > 0 && daLamTrongLanMax >= total) || (progress.trang_thai === "that_bai" && progress.so_tim_con_lai === 5)) {
      lan_lam_hien_tai = (maxLan || 1) + 1;
    }

    const daLamCauNay = await db.query.cau_tra_loi_nguoi_dung.findFirst({
      where: and(
        eq(cau_tra_loi_nguoi_dung.ma_nguoi_dung, ma_nguoi_dung),
        eq(cau_tra_loi_nguoi_dung.ma_bai_hoc, ma_bai_hoc),
        eq(cau_tra_loi_nguoi_dung.ma_thu_thach, ma_thu_thach),
        eq(cau_tra_loi_nguoi_dung.lan_lam, lan_lam_hien_tai)
      ),
      columns: { id: true, dung: true },
    });

    if (daLamCauNay?.dung === true) {
      return NextResponse.json({
        correct: true,
        message: "✅ Bạn đã trả lời đúng câu này trước đó, không tính thêm điểm.",
        lan_lam: lan_lam_hien_tai,
      });
    }

    if (daLamCauNay) {
      return NextResponse.json({
        correct: dapAn.dung,
        message: daLamCauNay.dung
          ? "✅ Bạn đã đúng câu này trước đó, không tính lại XP."
          : "❌ Bạn đã trả lời sai câu này trước đó, không tính XP khi nộp lại.",
        lan_lam: lan_lam_hien_tai,
      });
    }

    await db.insert(cau_tra_loi_nguoi_dung).values({
      ma_nguoi_dung,
      ma_bai_hoc,
      ma_thu_thach,
      ma_lua_chon,
      dung: dapAn.dung,
      lan_lam: lan_lam_hien_tai,
    });

    const daLamCount = await db
      .select({ da_lam: count(cau_tra_loi_nguoi_dung.id) })
      .from(cau_tra_loi_nguoi_dung)
      .where(
        and(
          eq(cau_tra_loi_nguoi_dung.ma_bai_hoc, ma_bai_hoc),
          eq(cau_tra_loi_nguoi_dung.ma_nguoi_dung, ma_nguoi_dung),
          eq(cau_tra_loi_nguoi_dung.lan_lam, lan_lam_hien_tai)
        )
      );
    const soDaLamHienTai = daLamCount[0]?.da_lam ?? 0;

    const dungCount = await db
      .select({ so_dung: count(cau_tra_loi_nguoi_dung.id) })
      .from(cau_tra_loi_nguoi_dung)
      .where(
        and(
          eq(cau_tra_loi_nguoi_dung.ma_bai_hoc, ma_bai_hoc),
          eq(cau_tra_loi_nguoi_dung.ma_nguoi_dung, ma_nguoi_dung),
          eq(cau_tra_loi_nguoi_dung.lan_lam, lan_lam_hien_tai),
          eq(cau_tra_loi_nguoi_dung.dung, true)
        )
      );
    const soCauDung = dungCount[0]?.so_dung ?? 0;

    if (soDaLamHienTai >= total) {
      const newXP = soCauDung * 10;

      const maxXPQuery = await db
        .select({ max_xp: sql<number>`MAX(sub.so_dung * 10)`.mapWith(Number) })
        .from(
          db
            .select({
              so_dung: count(cau_tra_loi_nguoi_dung.id).as("so_dung"),
              lan_lam: cau_tra_loi_nguoi_dung.lan_lam,
            })
            .from(cau_tra_loi_nguoi_dung)
            .where(
              and(
                eq(cau_tra_loi_nguoi_dung.ma_bai_hoc, ma_bai_hoc),
                eq(cau_tra_loi_nguoi_dung.ma_nguoi_dung, ma_nguoi_dung),
                eq(cau_tra_loi_nguoi_dung.dung, true)
              )
            )
            .groupBy(cau_tra_loi_nguoi_dung.lan_lam)
            .as("sub")
        );

      const maxXP = Number(maxXPQuery[0]?.max_xp ?? newXP);

      await db
        .update(tien_do)
        .set({ diem_kinh_nghiem: maxXP, trang_thai: "hoan_thanh", so_tim_con_lai: 5 })
        .where(eq(tien_do.ma_tien_do, progress.ma_tien_do));

      const percent = total > 0 ? ((soCauDung / total) * 100).toFixed(0) : "0";

      return NextResponse.json({
        correct: dapAn.dung,
        message: ` Hoàn thành lượt ${lan_lam_hien_tai}! Bạn đúng ${soCauDung}/${total} câu (${percent}%) bạn được +${newXP} XP. ❤️ Tim đã reset.`,
        lan_lam: lan_lam_hien_tai,
        hoan_thanh: true,
        diem_moi: maxXP,
        so_tim_con_lai: 5,
        lan_tiep_theo: lan_lam_hien_tai + 1, 
      });
    }

    if (dapAn.dung) {
      return NextResponse.json({
        correct: true,
        message: ` Chính xác! Bạn đã làm ${soDaLamHienTai}/${total}.`,
        lan_lam: lan_lam_hien_tai,
      });
    }

    const newHeart = Math.max(progress.so_tim_con_lai - 1, 0);
    if (newHeart === 0) {
      await db
        .update(tien_do)
        .set({ so_tim_con_lai: 5, trang_thai: "that_bai" })
        .where(eq(tien_do.ma_tien_do, progress.ma_tien_do));

      return NextResponse.json({
        correct: false,
        message: `Hết tim! Bắt đầu lượt mới với 5 tim.`,
        lan_lam_moi: (maxLan || 1) + 1, 
        so_tim_con_lai: 5,
        reset: true,
      });
    }

    await db
      .update(tien_do)
      .set({ so_tim_con_lai: newHeart, trang_thai: "dang_hoc" })
      .where(eq(tien_do.ma_tien_do, progress.ma_tien_do));

    return NextResponse.json({
      correct: false,
      message: "Sai mất rồi. Bạn bị -1 tim.",
      so_tim_con_lai: newHeart,
      lan_lam: lan_lam_hien_tai,
    });
  } catch (error) {
    console.error("Lỗi khi xử lý câu trả lời:", error);
    return NextResponse.json({ error: "Lỗi khi xử lý câu trả lời" }, { status: 500 });
  }
}

import { and, count, eq, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '../../../../../db/drizzle';
import {
  cau_tra_loi_nguoi_dung,
  lua_chon_thu_thach,
  thu_thach,
  tien_do,
} from '../../../../../db/schema';

export async function POST(req: Request) {
  try {
    const { ma_nguoi_dung, ma_bai_hoc, ma_lua_chon, ma_thu_thach } =
      await req.json();

    if (!ma_nguoi_dung || !ma_bai_hoc || !ma_lua_chon || !ma_thu_thach) {
      return NextResponse.json(
        { error: 'Thiếu tham số cần thiết' },
        { status: 400 },
      );
    }

    const dapAn = await db.query.lua_chon_thu_thach.findFirst({
      where: and(
        eq(lua_chon_thu_thach.ma_lua_chon, ma_lua_chon),
        eq(lua_chon_thu_thach.ma_thu_thach, ma_thu_thach),
      ),
      columns: { dung: true },
    });
    if (!dapAn)
      return NextResponse.json(
        { error: 'Không tìm thấy lựa chọn' },
        { status: 404 },
      );

    const progress = await db.query.tien_do.findFirst({
      where: and(
        eq(tien_do.ma_nguoi_dung, ma_nguoi_dung),
        eq(tien_do.ma_bai_hoc, ma_bai_hoc),
      ),
      columns: {
        ma_tien_do: true,
        diem_kinh_nghiem: true,
        so_tim_con_lai: true,
        trang_thai: true,
      },
    });

    if (!progress) {
      return NextResponse.json(
        { error: 'Người dùng chưa có tiến độ học cho bài này.' },
        { status: 403 },
      );
    }

    const totalChallenges = await db
      .select({ total: count(thu_thach.ma_thu_thach) })
      .from(thu_thach)
      .where(eq(thu_thach.ma_bai_hoc, ma_bai_hoc));
    const total = totalChallenges[0]?.total ?? 0;

    const maxLanLamRow = await db
      .select({
        max_lan: sql<number>`COALESCE(MAX(${cau_tra_loi_nguoi_dung.lan_lam}), 0)`,
      })
      .from(cau_tra_loi_nguoi_dung)
      .where(
        and(
          eq(cau_tra_loi_nguoi_dung.ma_bai_hoc, ma_bai_hoc),
          eq(cau_tra_loi_nguoi_dung.ma_nguoi_dung, ma_nguoi_dung),
        ),
      );
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
            eq(cau_tra_loi_nguoi_dung.lan_lam, maxLan),
          ),
        );
      daLamTrongLanMax = daLamCountMax[0]?.da_lam ?? 0;
    }

    if (maxLan > 0 && daLamTrongLanMax >= total) {
      lan_lam_hien_tai = (maxLan || 1) + 1;
    }

    const daLamCauNay = await db.query.cau_tra_loi_nguoi_dung.findFirst({
      where: and(
        eq(cau_tra_loi_nguoi_dung.ma_nguoi_dung, ma_nguoi_dung),
        eq(cau_tra_loi_nguoi_dung.ma_bai_hoc, ma_bai_hoc),
        eq(cau_tra_loi_nguoi_dung.ma_thu_thach, ma_thu_thach),
        eq(cau_tra_loi_nguoi_dung.lan_lam, lan_lam_hien_tai),
      ),
      columns: { id: true, dung: true },
    });

    if (daLamCauNay?.dung === true) {
      return NextResponse.json({
        correct: true,
        message: 'Bạn đã trả lời đúng câu này trước đó, không tính thêm điểm.',
        lan_lam: lan_lam_hien_tai,
      });
    }

    if (daLamCauNay) {
      if (daLamCauNay.dung) {
        return NextResponse.json({
          correct: true,
          message:
            'Bạn đã trả lời đúng câu này trước đó, không tính thêm điểm.',
          lan_lam: lan_lam_hien_tai,
        });
      }

      if (!dapAn.dung) {
        const newHeart = Math.max(progress.so_tim_con_lai - 1, 0);

        if (newHeart === 0) {
          const lanLamMoi = (maxLan || 1) + 1;

          await db
            .update(tien_do)
            .set({ so_tim_con_lai: 5, trang_thai: 'that_bai' })
            .where(eq(tien_do.ma_tien_do, progress.ma_tien_do));

          await db.insert(cau_tra_loi_nguoi_dung).values({
            ma_nguoi_dung,
            ma_bai_hoc,
            ma_thu_thach,
            ma_lua_chon,
            dung: false,
            lan_lam: lanLamMoi,
          });

          return NextResponse.json({
            correct: false,
            message: `Hết tim! Bắt đầu lượt mới với 5 tim.`,
            lan_lam_moi: lanLamMoi,
            so_tim_con_lai: 5,
            trang_thai: 'that_bai',
            reset: true,
          });
        }

        await db
          .update(tien_do)
          .set({ so_tim_con_lai: newHeart, trang_thai: 'dang_hoc' })
          .where(eq(tien_do.ma_tien_do, progress.ma_tien_do));

        return NextResponse.json({
          correct: false,
          message: '❌ Sai mất rồi. Bạn bị -1 tim.',
          so_tim_con_lai: newHeart,
          lan_lam: lan_lam_hien_tai,
        });
      }

      await db
        .update(cau_tra_loi_nguoi_dung)
        .set({ dung: true, ma_lua_chon })
        .where(eq(cau_tra_loi_nguoi_dung.id, daLamCauNay.id));

      return NextResponse.json({
        correct: true,
        message: '✅ Bạn đã sửa lại và trả lời đúng!',
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
          eq(cau_tra_loi_nguoi_dung.lan_lam, lan_lam_hien_tai),
        ),
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
          eq(cau_tra_loi_nguoi_dung.dung, true),
        ),
      );
    const soCauDung = dungCount[0]?.so_dung ?? 0;

    if (soDaLamHienTai >= total) {
      const newXP = soCauDung * 10;
      const isSuccess = soCauDung > 0;

      const maxXPQuery = await db
        .select({
          max_xp: sql<number>`MAX(sub.so_dung * 10)`.mapWith(Number),
        })
        .from(
          db
            .select({
              so_dung: count(cau_tra_loi_nguoi_dung.id).as('so_dung'),
              lan_lam: cau_tra_loi_nguoi_dung.lan_lam,
            })
            .from(cau_tra_loi_nguoi_dung)
            .where(
              and(
                eq(cau_tra_loi_nguoi_dung.ma_bai_hoc, ma_bai_hoc),
                eq(cau_tra_loi_nguoi_dung.ma_nguoi_dung, ma_nguoi_dung),
                eq(cau_tra_loi_nguoi_dung.dung, true),
              ),
            )
            .groupBy(cau_tra_loi_nguoi_dung.lan_lam)
            .as('sub'),
        );

      const maxXP = Number(maxXPQuery[0]?.max_xp ?? newXP);

      await db
        .update(tien_do)
        .set({
          diem_kinh_nghiem: isSuccess ? maxXP : progress.diem_kinh_nghiem,
          trang_thai: isSuccess ? 'hoan_thanh' : 'that_bai',
          so_tim_con_lai: 5,
        })
        .where(eq(tien_do.ma_tien_do, progress.ma_tien_do));

      const percent = total > 0 ? ((soCauDung / total) * 100).toFixed(0) : '0';

      return NextResponse.json({
        correct: dapAn.dung,
        message: isSuccess
          ? `Hoàn thành lượt ${lan_lam_hien_tai}! Đúng ${soCauDung}/${total} câu (${percent}%) → +${newXP} XP.`
          : `Bạn sai hết ${total} câu → thất bại, không được XP.`,
        lan_lam: lan_lam_hien_tai,
        hoan_thanh: isSuccess,
        diem_moi: isSuccess ? maxXP : progress.diem_kinh_nghiem,
        so_tim_con_lai: 5,
        lan_tiep_theo: lan_lam_hien_tai + 1,
      });
    }

    if (dapAn.dung) {
      if (progress.trang_thai === 'that_bai') {
        await db
          .update(tien_do)
          .set({ trang_thai: 'dang_hoc' })
          .where(eq(tien_do.ma_tien_do, progress.ma_tien_do));
      }

      return NextResponse.json({
        correct: true,
        message: `Chính xác! Bạn đã làm ${soDaLamHienTai}/${total}.`,
        lan_lam: lan_lam_hien_tai,
      });
    }

    const newHeart = Math.max(progress.so_tim_con_lai - 1, 0);
    if (newHeart === 0) {
      const lanLamMoi = (maxLan || 1) + 1;

      await db
        .update(tien_do)
        .set({ so_tim_con_lai: 5, trang_thai: 'that_bai' })
        .where(eq(tien_do.ma_tien_do, progress.ma_tien_do));

      await db.insert(cau_tra_loi_nguoi_dung).values({
        ma_nguoi_dung,
        ma_bai_hoc,
        ma_thu_thach,
        ma_lua_chon,
        dung: false,
        lan_lam: lanLamMoi,
      });

      return NextResponse.json({
        correct: false,
        message: `Hết tim! Bắt đầu lượt mới với 5 tim.`,
        lan_lam_moi: lanLamMoi,
        so_tim_con_lai: 5,
        trang_thai: 'that_bai',
        reset: true,
      });
    }

    await db
      .update(tien_do)
      .set({ so_tim_con_lai: newHeart, trang_thai: 'dang_hoc' })
      .where(eq(tien_do.ma_tien_do, progress.ma_tien_do));

    return NextResponse.json({
      correct: false,
      message: 'Sai mất rồi. Bạn bị -1 tim.',
      so_tim_con_lai: newHeart,
      lan_lam: lan_lam_hien_tai,
    });
  } catch (error) {
    console.error('Lỗi khi xử lý câu trả lời:', error);
    return NextResponse.json(
      { error: 'Lỗi khi xử lý câu trả lời' },
      { status: 500 },
    );
  }
}

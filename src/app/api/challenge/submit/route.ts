import { and, count, eq, sql, sum, inArray } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { db } from "../../../../../db/drizzle"
import {
  bang_xep_hang,
  cau_tra_loi_nguoi_dung,
  lua_chon_thu_thach,
  thu_thach,
  muc_tieu,
  tien_do_muc_tieu,
  tien_do,
} from "../../../../../db/schema"

const JWT_SECRET = process.env.JWT_SECRET!

export async function POST(req: NextRequest) {
  try {
    const { ma_bai_hoc, ma_lua_chon, ma_thu_thach, isExiting } = await req.json()

    // 1. Lấy token từ cookie và giải mã để lấy mã người dùng
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 });
    }
    const decoded: string | jwt.JwtPayload = jwt.verify(token, JWT_SECRET);
    const ma_nguoi_dung = (decoded as jwt.JwtPayload).userId

    // Xử lý logic thoát giữa chừng
    if (isExiting) {
      if (!ma_nguoi_dung || !ma_bai_hoc) {
        return NextResponse.json({ error: 'Thiếu thông tin để hủy tiến độ' }, { status: 400 });
      }

      // Khi thoát, set trạng thái là thất bại và reset tim về 5 cho lần sau
      await db.update(tien_do).set({
        trang_thai: 'that_bai',
        so_tim_con_lai: 5
      }).where(and(
        eq(tien_do.ma_nguoi_dung, ma_nguoi_dung),
        eq(tien_do.ma_bai_hoc, ma_bai_hoc)
      ));

      return NextResponse.json({ message: "Tiến độ đã được hủy." }, { status: 200 });
    }

    if (!ma_nguoi_dung || !ma_bai_hoc || !ma_lua_chon || !ma_thu_thach) {
      return NextResponse.json(
        { error: 'Thiếu tham số cần thiết' },
        { status: 400 },
      )
    }
    // --- 1. Lấy thông tin cơ bản ---

    const dapAn = await db.query.lua_chon_thu_thach.findFirst({
      where: and(
        eq(lua_chon_thu_thach.ma_lua_chon, ma_lua_chon),
        eq(lua_chon_thu_thach.ma_thu_thach, ma_thu_thach),
      ),
      columns: { dung: true },
    });
    if (!dapAn) {
      return NextResponse.json(
        { error: 'Không tìm thấy lựa chọn' },
        { status: 404 },
      )
    }

    let progress = await db.query.tien_do.findFirst({
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
      const newProgress = await db.insert(tien_do).values({
        ma_nguoi_dung: ma_nguoi_dung,
        ma_bai_hoc: ma_bai_hoc,
        diem_kinh_nghiem: 0,
        so_tim_con_lai: 5,
        trang_thai: 'dang_hoc' // Bắt đầu với trạng thái 'đang học'
      }).returning({
        ma_tien_do: tien_do.ma_tien_do,
        diem_kinh_nghiem: tien_do.diem_kinh_nghiem,
        so_tim_con_lai: tien_do.so_tim_con_lai,
        trang_thai: tien_do.trang_thai,
      });
      progress = newProgress[0];
    }
    if (!progress) {
      return NextResponse.json({ error: 'Không thể tạo hoặc tìm tiến độ học.' }, { status: 500 });
    }

    const totalChallenges = await db
      .select({ total: count(thu_thach.ma_thu_thach) })
      .from(thu_thach)
      .where(eq(thu_thach.ma_bai_hoc, ma_bai_hoc));
    const total = totalChallenges[0]?.total ?? 0;

    // --- 2. Xác định lần làm bài hiện tại ---

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
    const maxLan = maxLanLamRow[0]?.max_lan ?? 0

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
      daLamTrongLanMax = daLamCountMax[0]?.da_lam ?? 0
    }

    // Nếu lần làm bài trước đã hoàn thành HOẶC đã thất bại, hãy bắt đầu một lần mới.
    if (
      (maxLan > 0 && daLamTrongLanMax >= total) || progress.trang_thai === 'that_bai'
    ) {
      lan_lam_hien_tai = maxLan + 1

      // CẬP NHẬT QUAN TRỌNG: Chuyển trạng thái sang 'dang_hoc' ngay khi bắt đầu lượt mới
      // và cập nhật lại biến progress để các logic sau sử dụng đúng trạng thái.
      if (progress.trang_thai !== 'dang_hoc') {
        await db.update(tien_do).set({ trang_thai: 'dang_hoc' }).where(eq(tien_do.ma_tien_do, progress.ma_tien_do));
        progress.trang_thai = 'dang_hoc';
      }
    }

    // --- 3. Ghi nhận câu trả lời của người dùng ---

    const daLamCauNay = await db.query.cau_tra_loi_nguoi_dung.findFirst({
      where: and(
        eq(cau_tra_loi_nguoi_dung.ma_nguoi_dung, ma_nguoi_dung),
        eq(cau_tra_loi_nguoi_dung.ma_thu_thach, ma_thu_thach),
        eq(cau_tra_loi_nguoi_dung.lan_lam, lan_lam_hien_tai),
      ),
      columns: { id: true, dung: true },
    });

    if (daLamCauNay) {
      // Nếu đã trả lời câu này trong lượt hiện tại -> cập nhật lại đáp án
      await db
        .update(cau_tra_loi_nguoi_dung)
        .set({ dung: dapAn.dung, ma_lua_chon })
        .where(eq(cau_tra_loi_nguoi_dung.id, daLamCauNay.id))
    } else {
      // Nếu chưa trả lời -> thêm mới
      await db.insert(cau_tra_loi_nguoi_dung).values({
        ma_nguoi_dung,
        ma_bai_hoc,
        ma_thu_thach,
        ma_lua_chon,
        dung: dapAn.dung,
        lan_lam: lan_lam_hien_tai,
      })
    }

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
    const soDaLamHienTai = daLamCount[0]?.da_lam ?? 0

    // --- 4. Xử lý logic dựa trên kết quả và tiến độ ---

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
    const soCauDung = dungCount[0]?.so_dung ?? 0

    // Kịch bản 1: Đã hoàn thành tất cả các câu hỏi trong lượt
    if (soDaLamHienTai >= total) {
      let finalHearts = progress.so_tim_con_lai;
      if (!dapAn.dung && !daLamCauNay) { 
        finalHearts = Math.max(progress.so_tim_con_lai - 1, 0);
      }

      if (finalHearts === 0) {
        // Nếu hết tim ở câu cuối -> Thất bại
        await db.update(tien_do).set({
          trang_thai: 'that_bai',
          so_tim_con_lai: 5, // Reset tim cho lần sau
        }).where(eq(tien_do.ma_tien_do, progress.ma_tien_do));

        return NextResponse.json({
          correct: false,
          message: "Sai mất rồi. Bạn đã hết tim!",
          so_tim_con_lai: 0,
          hoan_thanh: false,
          reset: true,
          lan_lam_moi: (maxLan || 1) + 1,
        })
      }

      // Nếu còn tim -> Hoàn thành
      await db.update(tien_do).set({
        trang_thai: 'hoan_thanh',
        so_tim_con_lai: 5, // Reset tim cho lần sau
      }).where(eq(tien_do.ma_tien_do, progress.ma_tien_do));

      const prevMaxXPQuery = await db
        .select({ lan_lam: cau_tra_loi_nguoi_dung.lan_lam })
        .from(cau_tra_loi_nguoi_dung)
        .where(
          and(
            eq(cau_tra_loi_nguoi_dung.ma_bai_hoc, ma_bai_hoc),
            eq(cau_tra_loi_nguoi_dung.ma_nguoi_dung, ma_nguoi_dung),
            eq(cau_tra_loi_nguoi_dung.dung, true),
            sql`${cau_tra_loi_nguoi_dung.lan_lam} <> ${lan_lam_hien_tai}`
          )
        )
        .groupBy(cau_tra_loi_nguoi_dung.lan_lam)
        .orderBy(sql`count(${cau_tra_loi_nguoi_dung.id}) DESC`)
        .limit(1)

      const prevMaxCorrectCount =
        prevMaxXPQuery.length > 0
          ? (
              await db
                .select({ count: count() })
                .from(cau_tra_loi_nguoi_dung)
                .where(
                  and(
                    eq(cau_tra_loi_nguoi_dung.lan_lam, prevMaxXPQuery[0].lan_lam),
                    eq(cau_tra_loi_nguoi_dung.dung, true),
                    eq(cau_tra_loi_nguoi_dung.ma_nguoi_dung, ma_nguoi_dung),
                    eq(cau_tra_loi_nguoi_dung.ma_bai_hoc, ma_bai_hoc),
                  ),
                )
            )[0].count
          : 0
      const prevMaxXP = prevMaxCorrectCount * 10
      const finalXP = soCauDung * 10
      const isNewMax = finalXP > prevMaxXP

      // Cập nhật điểm kinh nghiệm trong bảng tien_do NẾU phá kỷ lục
      if (isNewMax) {
        await db.update(tien_do)
          .set({ diem_kinh_nghiem: finalXP })
          .where(eq(tien_do.ma_tien_do, progress.ma_tien_do));
      }
      // --- CẬP NHẬT TIẾN ĐỘ MỤC TIÊU VÀ BẢNG XẾP HẠNG (NẾU CÓ KỶ LỤC MỚI) ---
      if (isNewMax) {
          const totalXpResult = await db
            .select({ total: sum(tien_do.diem_kinh_nghiem) })
            .from(tien_do)
            .where(eq(tien_do.ma_nguoi_dung, ma_nguoi_dung));
          
          const newTotalXp = Number(totalXpResult[0]?.total ?? 0);
          // Lấy các mục tiêu mà người dùng có thể đã đạt được
          const achievableGoals = await db.select({ ma_muc_tieu: muc_tieu.ma_muc_tieu })
            .from(muc_tieu)
            .where(sql`${muc_tieu.diem_can_dat} <= ${newTotalXp}`);

        if (achievableGoals.length > 0) {
          const achievableGoalIds = achievableGoals.map(g => g.ma_muc_tieu);
          // Cập nhật trạng thái 'hoan_thanh' cho các mục tiêu đã đạt được
          await db.update(tien_do_muc_tieu)
            .set({ hoan_thanh: true })
            .where(and(eq(tien_do_muc_tieu.ma_nguoi_dung, ma_nguoi_dung), inArray(tien_do_muc_tieu.ma_muc_tieu, achievableGoalIds)));
        }
        await db.update(tien_do_muc_tieu)
          .set({ diem_hien_tai: newTotalXp })
          .where(eq(tien_do_muc_tieu.ma_nguoi_dung, ma_nguoi_dung));

        await db.insert(bang_xep_hang)
          .values({ ma_nguoi_dung: ma_nguoi_dung, tong_diem_xp: newTotalXp })
          .onConflictDoUpdate({ target: bang_xep_hang.ma_nguoi_dung, set: { tong_diem_xp: newTotalXp } });
      }
      
      let summaryMessage = "";
      
      // Nếu đây là lần làm đầu tiên, HOẶC kỷ lục trước đó là 0 -> Đây là kỷ lục đầu tiên.
      if (lan_lam_hien_tai === 1 || (isNewMax && prevMaxXP === 0)) {
        summaryMessage = `Kỉ lục mới! Bạn làm đúng ${soCauDung}/${total} câu và được cộng ${finalXP} XP.`;
      } else if (isNewMax) {
        summaryMessage = `Kỉ lục mới! Bạn làm đúng ${soCauDung}/${total} câu và được cộng thêm ${finalXP - prevMaxXP} XP.`;
      } else {
        if (finalXP === prevMaxXP && soCauDung === total) {
          summaryMessage = `Bạn làm đúng ${soCauDung}/${total} câu. Hãy giữ vững phong độ nhé!`;
        } else {
          summaryMessage = `Làm tốt lắm! Bạn đúng ${soCauDung}/${total}. Hãy luyện tập lại để phá kỉ lục nhé!`;
        }
      }

      return NextResponse.json({
        correct: dapAn.dung,
        message: dapAn.dung ? 'Chính xác!' : 'Sai mất rồi. Bạn bị -1 tim.',
        summaryMessage: summaryMessage,
        hoan_thanh: true,
        so_tim_con_lai: finalHearts,
        lan_tiep_theo: lan_lam_hien_tai + 1,
      })
    }

    // Kịch bản 2: Trả lời đúng và vẫn còn câu hỏi
    if (dapAn.dung) {
      // Nếu trả lời đúng, và bài học chưa được hoàn thành, set trạng thái là 'đang học'
      if (progress.trang_thai !== 'hoan_thanh') {
        await db
          .update(tien_do)
          .set({ trang_thai: 'dang_hoc' })
          .where(eq(tien_do.ma_tien_do, progress.ma_tien_do));
      }

      return NextResponse.json({
        correct: true,
        message: `Chính xác! Hãy cố gắng ở câu tiếp theo nhé.`,
        lan_lam: lan_lam_hien_tai,
        so_tim_con_lai: progress.so_tim_con_lai,
      });
    }

    // Kịch bản 3: Trả lời sai và vẫn còn câu hỏi
    const newHeart = Math.max(progress.so_tim_con_lai - 1, 0);

    if (newHeart === 0) {
      const lanLamMoi = (maxLan || 1) + 1;
      // Khi hết tim, set trạng thái là thất bại và reset tim về 5 cho lần sau
      await db.update(tien_do).set({
        trang_thai: 'that_bai',
        so_tim_con_lai: 5
      }).where(eq(tien_do.ma_tien_do, progress.ma_tien_do));

      return NextResponse.json({ 
        correct: false,
        message: `Bạn đã hết tim. Hãy bắt đầu lại thử thách với 5 tim.`,
        lan_lam_moi: lanLamMoi, 
        so_tim_con_lai: 0,
        trang_thai: 'that_bai',
        reset: true,
      })
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
    })
  } catch (error) {
    console.error('Lỗi khi xử lý câu trả lời:', error);
    return NextResponse.json(
      { error: 'Lỗi khi xử lý câu trả lời' },
      { status: 500 },
    )
  }
}
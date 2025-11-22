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
        return NextResponse.json(
          { error: 'Thiếu thông tin để hủy tiến độ' },
          { status: 400 },
        )
      }
      // Đánh dấu lần làm bài hiện tại là thất bại để lần sau bắt đầu lại
      await db
        .update(tien_do)
        .set({ trang_thai: 'that_bai', so_tim_con_lai: 5 })
        .where(
          and(
            eq(tien_do.ma_nguoi_dung, ma_nguoi_dung),
            eq(tien_do.ma_bai_hoc, ma_bai_hoc),
          ),
        )
      return NextResponse.json({ message: "Tiến độ đã được hủy." }, { status: 200 })
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
      )
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

    // Tối ưu hóa: Gộp 2 truy vấn count() thành 1 để giảm tải DB
    const currentAttemptStats = await db
      .select({
        soDaLam: count(cau_tra_loi_nguoi_dung.id),
        soDung: sql<number>`COUNT(CASE WHEN ${cau_tra_loi_nguoi_dung.dung} = true THEN 1 END)`.mapWith(Number),
      })
      .from(cau_tra_loi_nguoi_dung)
      .where(
        and(
          eq(cau_tra_loi_nguoi_dung.ma_bai_hoc, ma_bai_hoc),
          eq(cau_tra_loi_nguoi_dung.ma_nguoi_dung, ma_nguoi_dung),
          eq(cau_tra_loi_nguoi_dung.lan_lam, lan_lam_hien_tai),
        ),
      );
    const { soDaLam: soDaLamHienTai, soDung: soCauDung } = currentAttemptStats[0] ?? { soDaLam: 0, soDung: 0 };

    // Kịch bản 1: Đã hoàn thành tất cả các câu hỏi trong lượt
    if (soDaLamHienTai >= total) {
      let finalHearts = progress.so_tim_con_lai;
      if (!dapAn.dung && !daLamCauNay) { // Chỉ trừ tim nếu đây là lần đầu trả lời sai câu này
        finalHearts = Math.max(progress.so_tim_con_lai - 1, 0);
      }

      // Nếu hết tim ở câu cuối cùng -> vẫn tính là thất bại.
      if (finalHearts === 0) {
        const lanLamMoi = (maxLan || 1) + 1;
        await db
          .update(tien_do)
          .set({ trang_thai: 'that_bai', so_tim_con_lai: 5 }) // Reset tim cho lần mới
          .where(eq(tien_do.ma_tien_do, progress.ma_tien_do))

        // Trả về response thất bại, yêu cầu client reset
        return NextResponse.json({
          correct: false,
          message: "Sai mất rồi. Bạn đã hết tim!💔",
          so_tim_con_lai: 0,
          hoan_thanh: false,
          reset: true,
          lan_lam_moi: lanLamMoi,
        })
      }

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

      // Chỉ cập nhật DB nếu có thành công (đúng ít nhất 1 câu)
      if (soCauDung > 0) {
        const updateData: {
          trang_thai: 'hoan_thanh';
          diem_kinh_nghiem?: number;
          so_tim_con_lai: number;
        } = {
          trang_thai: 'hoan_thanh',
          so_tim_con_lai: 5,
        }
        if (isNewMax) {
          updateData.diem_kinh_nghiem = finalXP
        }
        await db
          .update(tien_do)
          .set(updateData)
          .where(eq(tien_do.ma_tien_do, progress.ma_tien_do))

        // --- CẬP NHẬT TIẾN ĐỘ MỤC TIÊU ---
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
        // Cập nhật 'diem_hien_tai' cho TẤT CẢ các mục tiêu của người dùng
        await db.update(tien_do_muc_tieu)
          .set({ diem_hien_tai: newTotalXp })
          .where(eq(tien_do_muc_tieu.ma_nguoi_dung, ma_nguoi_dung));

        // CẬP NHẬT BẢNG XẾP HẠNG (CHỈ CHO NGƯỜI DÙNG HIỆN TẠI)
        // Thao tác này rất nhanh vì chỉ cập nhật 1 hàng.
        await db.insert(bang_xep_hang)
          .values({ ma_nguoi_dung: ma_nguoi_dung, tong_diem_xp: newTotalXp })
          .onConflictDoUpdate({ target: bang_xep_hang.ma_nguoi_dung, set: { tong_diem_xp: newTotalXp } });
      }
      let summaryMessage = ""

      if (isNewMax) {
        summaryMessage = `Kỷ lục mới!😍🤩🥳 Bạn đúng ${soCauDung}/${total} câu và đạt ${finalXP} XP.`;
      } else {
        // Nếu không phá kỷ lục nhưng vẫn đạt điểm tuyệt đối
        if (soCauDung === total && total > 0) {
          summaryMessage = `Phong độ đỉnh cao!😍🤩🥳 Bạn đã duy trì thành tích tuyệt đối ${soCauDung}/${total} câu đúng.`;
        } else if (lan_lam_hien_tai > 1) {
          if (soCauDung < total / 2) {
            summaryMessage = `Đừng nản lòng! Mỗi lần luyện tập là một bước tiến.🐾🦾😉 Bạn đúng ${soCauDung}/${total} câu. Hãy thử lại nhé!`;
          } else { // làm lại và đúng > 50%
            summaryMessage = `Bạn đã luyện tập lại lần thứ ${lan_lam_hien_tai} và đúng ${soCauDung}/${total} câu. Hãy cố gắng phá kỉ lục ${prevMaxXP} XP ở lần sau nhé!🐾🦾😘`;
          }
        } else { // Trường hợp làm lần đầu nhưng không phá kỷ lục
          summaryMessage = `Hoàn thành! Bạn đúng ${soCauDung}/${total} câu. Điểm cao nhất của bạn vẫn là ${prevMaxXP} XP.🦾🫡🥰`;
        }
      }

      return NextResponse.json({
        correct: dapAn.dung,
        message: dapAn.dung ? 'Chính xác!🥳🥳🥳' : 'Sai mất rồi.🥺🥺🥺',
        summaryMessage: summaryMessage,
        hoan_thanh: true,
        diem_moi: isNewMax ? finalXP - prevMaxXP : 0,
        so_tim_con_lai: finalHearts,
        lan_tiep_theo: lan_lam_hien_tai + 1,
      })
    }

    // Kịch bản 2: Trả lời đúng và vẫn còn câu hỏi
    if (dapAn.dung) {
      // Nếu trạng thái trước đó là 'that_bai', chuyển lại thành 'dang_hoc'
      if (progress.trang_thai === 'that_bai') {
        await db
          .update(tien_do)
          .set({ trang_thai: 'dang_hoc' })
          .where(eq(tien_do.ma_tien_do, progress.ma_tien_do))
      }

      return NextResponse.json({
        correct: true,
        message: `Chính xác! Tiếp tục phát huy câu sau nha.🥳🥳🥳`,
        lan_lam: lan_lam_hien_tai,
        so_tim_con_lai: progress.so_tim_con_lai, // Luôn trả về số tim hiện tại
      });
    }

    // Kịch bản 3: Trả lời sai và vẫn còn câu hỏi
    const newHeart = Math.max(progress.so_tim_con_lai - 1, 0);

    // Nếu câu trả lời sai này làm hết tim
    if (newHeart === 0) {
      const lanLamMoi = (maxLan || 1) + 1;
      await db
        .update(tien_do)
        .set({ so_tim_con_lai: 5, trang_thai: 'that_bai' })
        .where(eq(tien_do.ma_tien_do, progress.ma_tien_do))

      return NextResponse.json({ // Báo cho client reset
        correct: false,
        message: `Bạn đã hết tim. Hãy bắt đầu lại thử thách với 5 tim.💔🫂😉`,
        lan_lam_moi: lanLamMoi, // Giữ lại để client biết chuyển lượt
        so_tim_con_lai: 0,
        trang_thai: 'that_bai',
        reset: true,
      })
    }

    // Nếu trả lời sai nhưng vẫn còn tim
    await db
      .update(tien_do)
      .set({ so_tim_con_lai: newHeart, trang_thai: 'dang_hoc' })
      .where(eq(tien_do.ma_tien_do, progress.ma_tien_do))

    return NextResponse.json({
      correct: false,
      message: 'Sai mất rồi! Bạn bị -1 tim.🥺🥺🥺',
      so_tim_con_lai: newHeart,
    })
  } catch (error) {
    console.error('Lỗi khi xử lý câu trả lời:', error);
    return NextResponse.json(
      { error: 'Lỗi khi xử lý câu trả lời' },
      { status: 500 },
    )
  }
}
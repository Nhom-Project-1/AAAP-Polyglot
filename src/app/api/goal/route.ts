import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../db/drizzle";
import { muc_tieu, tien_do, tien_do_muc_tieu } from "../../../../db/schema";
import { asc, eq, and, sum } from "drizzle-orm";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 });
    }
    const decoded: string | jwt.JwtPayload = jwt.verify(token, JWT_SECRET);
    const ma_nguoi_dung = (decoded as jwt.JwtPayload).userId;

    // 1. Lấy tổng điểm XP hiện tại của người dùng
    const totalXpResult = await db
      .select({ total: sum(tien_do.diem_kinh_nghiem) })
      .from(tien_do)
      .where(eq(tien_do.ma_nguoi_dung, ma_nguoi_dung));
    const tongXP = Number(totalXpResult[0]?.total ?? 0);

    // 2. Lấy tất cả các mục tiêu có sẵn
    const allGoals = await db.query.muc_tieu.findMany();
    if (allGoals.length === 0) {
      return NextResponse.json([]);
    }

    // 2. Lấy tất cả tiến độ mục tiêu hiện có của người dùng
    const userProgress = await db.query.tien_do_muc_tieu.findMany({
      where: eq(tien_do_muc_tieu.ma_nguoi_dung, ma_nguoi_dung),
    });

    const existingProgressGoalIds = new Set(userProgress.map(p => p.ma_muc_tieu));

    // 3. Tìm những mục tiêu mà người dùng chưa có tiến độ
    const missingProgressGoals = allGoals.filter(goal => !existingProgressGoalIds.has(goal.ma_muc_tieu));

    // 4. Nếu có mục tiêu bị thiếu, tạo bản ghi tiến độ mới cho chúng
    if (missingProgressGoals.length > 0) {
      const newProgressRecords = missingProgressGoals.map(goal => ({
        ma_nguoi_dung: ma_nguoi_dung,
        ma_muc_tieu: goal.ma_muc_tieu,
        hoan_thanh: tongXP >= goal.diem_can_dat,
      }));
      await db.insert(tien_do_muc_tieu).values(newProgressRecords);
    }

    // 5. Lấy lại toàn bộ tiến độ (bao gồm cả bản ghi mới tạo) và join với mục tiêu
    const finalUserProgress = await db
      .select()
      .from(muc_tieu)
      .leftJoin(tien_do_muc_tieu, and(eq(muc_tieu.ma_muc_tieu, tien_do_muc_tieu.ma_muc_tieu), eq(tien_do_muc_tieu.ma_nguoi_dung, ma_nguoi_dung)))
      .orderBy(asc(muc_tieu.diem_can_dat));

    // 6. Xử lý kết quả, tính toán phần trăm và trả về
    const responseData = finalUserProgress.map(item => ({
      ma_muc_tieu: item.muc_tieu.ma_muc_tieu,
      diem_can_dat: item.muc_tieu.diem_can_dat,
      hoan_thanh: item.tien_do_muc_tieu?.hoan_thanh ?? false,
      // Tính toán phần trăm ở backend
      phan_tram_hoan_thanh: (item.tien_do_muc_tieu?.hoan_thanh ?? false)
        ? 1 
        : Math.min(tongXP / item.muc_tieu.diem_can_dat, 1)
    }));

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Lỗi khi lấy danh sách mục tiêu:", error);
    return NextResponse.json(
      { error: "Lỗi khi lấy danh sách mục tiêu" },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { db } from "../../../../../db/drizzle";
import { muc_tieu, tien_do_muc_tieu } from "../../../../../db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = Number(searchParams.get("userId"));

    if (!userId) {
      return NextResponse.json({ error: "Thiếu mã người dùng" }, { status: 400 });
    }

    const goals = await db.select().from(muc_tieu).orderBy(asc(muc_tieu.diem_can_dat));

    const progresses = await db
      .select()
      .from(tien_do_muc_tieu)
      .where(eq(tien_do_muc_tieu.ma_nguoi_dung, userId));

    const result = goals.map((goal) => {
      const progress = progresses.find(
        (p) => p.ma_muc_tieu === goal.ma_muc_tieu
      );

      const diemHienTai = progress?.diem_hien_tai ?? 0;
      const tiLe = Math.min(
        Math.round((diemHienTai / goal.diem_can_dat) * 100),
        100
      );

      return {
        ma_muc_tieu: goal.ma_muc_tieu,
        diem_can_dat: goal.diem_can_dat,
        diem_hien_tai: diemHienTai,
        tien_do: tiLe, 
        hoan_thanh: tiLe >= 100,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(" Lỗi khi lấy tiến độ mục tiêu:", error);
    return NextResponse.json(
      { error: "Không thể lấy tiến độ mục tiêu" },
      { status: 500 }
    );
  }
}

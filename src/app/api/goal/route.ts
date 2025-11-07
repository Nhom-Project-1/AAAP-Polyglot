import { NextResponse } from "next/server";
import { db } from "../../../../db/drizzle";
import { muc_tieu } from "../../../../db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  try {
    const goals = await db.select().from(muc_tieu).orderBy(asc(muc_tieu.diem_can_dat));

    const result = goals.map((goal) => ({
      ma_muc_tieu: goal.ma_muc_tieu,
      diem_can_dat: goal.diem_can_dat,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách mục tiêu:", error);
    return NextResponse.json(
      { error: "Không thể lấy danh sách mục tiêu" },
      { status: 500 }
    );
  }
}

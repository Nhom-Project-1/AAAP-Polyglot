import { NextResponse } from "next/server";
import { db } from "../../../../../db/drizzle";
import { bang_xep_hang, nguoi_dung } from "../../../../../db/schema";
import { eq, sql } from "drizzle-orm";


export async function POST(req: Request) {
  try {
    const { ma_nguoi_dung } = await req.json();

    if (!ma_nguoi_dung) {
      return NextResponse.json(
        { error: "Thiếu mã người dùng." },
        { status: 400 }
      );
    }

    const userExists = await db.query.nguoi_dung.findFirst({
      where: eq(nguoi_dung.ma_nguoi_dung, ma_nguoi_dung as number),
      columns: { ma_nguoi_dung: true },
    });

    if (!userExists) {
      return NextResponse.json(
        { error: "Người dùng không tồn tại trong hệ thống." },
        { status: 404 }
      );
    }

    const topRanking = await db
      .select()
      .from(bang_xep_hang)
      .orderBy(sql`${bang_xep_hang.tong_diem_xp} DESC`)
      .limit(10);

    let myRank: number | null = null;
    let myScore: number | null = null;

    if (ma_nguoi_dung) {
      const myInfo = await db
        .select({ tong_diem_xp: bang_xep_hang.tong_diem_xp })
        .from(bang_xep_hang)
        .where(sql`${bang_xep_hang.ma_nguoi_dung} = ${ma_nguoi_dung}`);

      if (myInfo.length > 0) {
        myScore = myInfo[0].tong_diem_xp;

        const higherCount = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(bang_xep_hang)
          .where(sql`${bang_xep_hang.tong_diem_xp} > ${myScore}`);

        const countHigher = Number(higherCount[0]?.count ?? 0);
        myRank = countHigher + 1; 
      }
    }

    return NextResponse.json({
      topRanking,
      myRank,
      myScore,
    });
  } catch (error) {
    console.error("Lỗi khi lấy bảng xếp hạng:", error);
    return NextResponse.json(
      { error: "Lỗi khi lấy bảng xếp hạng" },
      { status: 500 }
    );
  }
}

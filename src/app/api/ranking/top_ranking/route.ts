import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../db/drizzle";
import { bang_xep_hang, nguoi_dung, tien_do } from "../../../../../db/schema";
import { eq, sql, sum, desc } from "drizzle-orm";
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

    // API giờ sẽ chỉ đọc từ bảng xếp hạng đã được tính toán sẵn, giúp phản hồi nhanh hơn rất nhiều.
    const topRanking = await db
      .select({
        ten_dang_nhap: nguoi_dung.ten_dang_nhap,
        tong_diem_xp: bang_xep_hang.tong_diem_xp,
      })
      .from(bang_xep_hang)
      .innerJoin(nguoi_dung, eq(bang_xep_hang.ma_nguoi_dung, nguoi_dung.ma_nguoi_dung))
      .orderBy(desc(bang_xep_hang.tong_diem_xp))
      .limit(10);

    // Tối ưu: Lấy điểm và thứ hạng của người dùng trong cùng một lúc
    const myInfoQuery = db.select({ tong_diem_xp: bang_xep_hang.tong_diem_xp }).from(bang_xep_hang).where(eq(bang_xep_hang.ma_nguoi_dung, ma_nguoi_dung as number));

    const myRankQuery = db.select({ count: sql<number>`count(*)` }).from(bang_xep_hang).where(sql`${bang_xep_hang.tong_diem_xp} > (SELECT tong_diem_xp FROM ${bang_xep_hang} WHERE ${bang_xep_hang.ma_nguoi_dung} = ${ma_nguoi_dung})`);

    // Thực thi các truy vấn song song để tăng tốc độ
    const [myInfoResult, myRankResult] = await Promise.all([myInfoQuery, myRankQuery]);

    const myInfo = myInfoResult[0];
    const myScore = myInfo?.tong_diem_xp ?? 0; // Nếu không có thông tin, điểm là 0

    // Nếu người dùng có trong bảng xếp hạng, myRankResult sẽ chứa số người có điểm cao hơn.
    // Nếu không, truy vấn con sẽ trả về NULL, và so sánh `> NULL` sẽ không trả về hàng nào, count là 0.
    // Chúng ta cần một truy vấn khác cho trường hợp người dùng chưa có điểm.
    const higherRankCount = myInfo
      ? Number(myRankResult[0].count)
      : (await db.select({ count: sql<number>`count(*)` }).from(bang_xep_hang).where(sql`${bang_xep_hang.tong_diem_xp} > 0`))[0].count;

    const myRank = Number(higherRankCount) + 1;

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

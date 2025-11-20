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

    let myRank: number | null = null;
    let myScore: number = 0; // Mặc định điểm là 0
    
    // Đảm bảo người dùng hiện tại có trong bảng xếp hạng, nếu chưa có thì thêm vào với 0 điểm.
    // Thao tác này an toàn và hiệu quả, không làm gì nếu người dùng đã tồn tại.
    await db.insert(bang_xep_hang)
      .values({ ma_nguoi_dung: ma_nguoi_dung as number, tong_diem_xp: 0 })
      .onConflictDoNothing({ target: bang_xep_hang.ma_nguoi_dung });

    // Tìm thông tin của người dùng hiện tại trong bảng xếp hạng
    const myInfoResult = await db.select({ tong_diem_xp: bang_xep_hang.tong_diem_xp }).from(bang_xep_hang).where(eq(bang_xep_hang.ma_nguoi_dung, ma_nguoi_dung as number));
    const myInfo = myInfoResult[0];

    if (myInfo) {
      myScore = myInfo.tong_diem_xp;
      // Đếm số người có điểm cao hơn để xác định thứ hạng
      const higherRankCountResult = await db.select({ count: sql<number>`count(*)` }).from(bang_xep_hang).where(sql`${bang_xep_hang.tong_diem_xp} > ${myScore}`);
      myRank = Number(higherRankCountResult[0].count) + 1;
    } else {
      // Trường hợp này rất khó xảy ra sau khi đã thêm logic insert ở trên, nhưng vẫn để dự phòng.
      // Đếm tất cả người dùng để xác định hạng cuối.
      const totalUsersCountResult = await db.select({ count: sql<number>`count(*)` }).from(bang_xep_hang);
      myRank = Number(totalUsersCountResult[0].count);
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
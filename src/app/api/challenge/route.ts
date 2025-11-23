import { and, eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { db } from '../../../../db/drizzle';
import { thu_thach, tien_do } from '../../../../db/schema';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const ma_bai_hoc = url.searchParams.get('ma_bai_hoc');

    if (!ma_bai_hoc) {
      return NextResponse.json(
        { error: 'Thiếu tham số ma_bai_hoc' },
        { status: 400 },
      );
    }

    // Lấy toàn bộ dữ liệu thử thách, bao gồm cả các lựa chọn
    const challenges = await db.query.thu_thach.findMany({
      where: eq(thu_thach.ma_bai_hoc, Number(ma_bai_hoc)),
      with: {
        lua_chon_thu_thach: {
        }
      },
    });

    // Lấy số tim của user nếu đã đăng nhập
    let hearts = 5;
    const token = request.cookies.get('token')?.value;
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
        const ma_nguoi_dung = decoded.userId || decoded.ma_nguoi_dung;
        
        if (ma_nguoi_dung) {
          const userProgress = await db.query.tien_do.findFirst({
            where: and(
              eq(tien_do.ma_nguoi_dung, ma_nguoi_dung),
              eq(tien_do.ma_bai_hoc, Number(ma_bai_hoc))
            )
          });
          if (userProgress) {
            hearts = userProgress.so_tim_con_lai;
          }
        }
      } catch (e) {
        // Token invalid or expired, ignore
      }
    }

    return NextResponse.json({
      challenges,
      hearts
    });
  } catch (error) {
    console.error('Lỗi khi lấy thử thách:', error);
    return NextResponse.json(
      { error: 'Lỗi khi lấy thử thách' },
      { status: 500 },
    );
  }
}

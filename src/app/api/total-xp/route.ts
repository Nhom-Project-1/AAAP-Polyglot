import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../db/drizzle';
import { tien_do } from '../../../../db/schema';
import { eq, sum } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(req: NextRequest) {
  try {
    // Lấy token từ cookie và giải mã để lấy mã người dùng
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    const maNguoiDung = decoded.userId;

    if (!maNguoiDung) {
      return NextResponse.json({ error: 'Token không hợp lệ.' }, { status: 401 });
    }

    // Truy vấn để tính tổng điểm kinh nghiệm
    const result = await db
      .select({
        totalXP: sum(tien_do.diem_kinh_nghiem).mapWith(Number),
      })
      .from(tien_do)
      .where(eq(tien_do.ma_nguoi_dung, maNguoiDung));

    const totalXP = result[0]?.totalXP ?? 0;

    return NextResponse.json({ totalXP });
  } catch (error) {
    console.error('Lỗi khi lấy tổng điểm kinh nghiệm:', error);
    return NextResponse.json(
      { error: 'Lỗi từ phía server khi lấy tổng điểm.' },
      { status: 500 },
    );
  }
}
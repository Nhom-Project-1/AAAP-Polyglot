import bcrypt from 'bcryptjs';
import { eq, or } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import db, { schema } from '../../../../db/drizzle';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Vui lòng nhập đầy đủ thông tin.' },
        { status: 400 },
      );
    }

    const users = await db
      .select({
        ma_nguoi_dung: schema.nguoi_dung.ma_nguoi_dung,
        ho_ten: schema.nguoi_dung.ho_ten,
        email: schema.nguoi_dung.email,
        ten_dang_nhap: schema.nguoi_dung.ten_dang_nhap,
        mat_khau_hash: schema.nguoi_dung.mat_khau_hash,
      })
      .from(schema.nguoi_dung)
      .where(
        or(
          eq(schema.nguoi_dung.email, identifier),
          eq(schema.nguoi_dung.ten_dang_nhap, identifier),
        ),
      )
      .limit(1);

    const dbUser = users[0];
    const role = 'user';

    if (!dbUser) {
      return NextResponse.json(
        { error: 'Tên đăng nhập hoặc email không tồn tại.' },
        { status: 404 },
      );
    }

    const valid = await bcrypt.compare(password, dbUser.mat_khau_hash);
    if (!valid) {
      return NextResponse.json(
        { error: 'Thông tin đăng nhập không chính xác.' },
        { status: 401 },
      );
    }

    // Đảm bảo người dùng luôn có bản ghi trong bảng xếp hạng khi đăng nhập
    // Nếu đã tồn tại, lệnh onConflictDoNothing sẽ bỏ qua và không làm gì cả.
    await db.insert(schema.bang_xep_hang).values({
      ma_nguoi_dung: dbUser.ma_nguoi_dung,
      tong_diem_xp: 0,
    }).onConflictDoNothing();

    const token = jwt.sign(
      {
        userId: dbUser.ma_nguoi_dung,
        username: dbUser.ten_dang_nhap,
        email: dbUser.email,
        role,
      },
      JWT_SECRET,
      { expiresIn: '7d' },
    );

    const response = NextResponse.json({
      message: 'Đăng nhập thành công!',
      user: {
        id: dbUser.ma_nguoi_dung,
        fullName: dbUser.ho_ten,
        username: dbUser.ten_dang_nhap,
        email: dbUser.email,
        role,
      },
    });

    console.log('🔑 Token payload:', {
      ma_nguoi_dung: dbUser.ma_nguoi_dung,
      username: dbUser.ten_dang_nhap,
      email: dbUser.email,
      role,
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 ngày
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}

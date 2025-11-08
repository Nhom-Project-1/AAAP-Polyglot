import db, { schema } from '../../../../../db/drizzle';
import bcrypt from 'bcryptjs';
import { eq, or } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

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

    const admins = await db
      .select({
        ma_admin: schema.admin.ma_admin,
        email: schema.admin.email,
        ten_dang_nhap: schema.admin.ten_dang_nhap,
        mat_khau_hash: schema.admin.mat_khau_hash,
      })
      .from(schema.admin)
      .where(
        or(
          eq(schema.admin.email, identifier),
          eq(schema.admin.ten_dang_nhap, identifier),
        ),
      )
      .limit(1);
    
    const dbUser = admins[0];

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

    const token = jwt.sign(
      {
        userId: dbUser.ma_admin,
        username: dbUser.ten_dang_nhap,
        email: dbUser.email,
        role: 'admin',
      },
      JWT_SECRET,
      { expiresIn: '7d' },
    );

    const response = NextResponse.json({
      message: 'Đăng nhập thành công!',
      token,
      user: {
        id: dbUser.ma_admin,
        fullName: 'Admin',
        username: dbUser.ten_dang_nhap,
        email: dbUser.email,
        role: 'admin',
      },
    });

    console.log('🔑 Token payload:', {
      ma_nguoi_dung: dbUser.ma_admin,
      username: dbUser.ten_dang_nhap,
      email: dbUser.email,
      role: 'admin',
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

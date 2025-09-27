import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import bcrypt from 'bcryptjs';
import pool from '../../../db';

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName, username } = await req.json() as {
      email: string;
      password: string;
      fullName: string;
      username: string;
    };

    if (!email || !password || !fullName || !username) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ thông tin." },
        { status: 400 }
      );
    }

    if (username.length > 20) {
      return NextResponse.json(
        { error: "Tên đăng nhập tối đa 20 ký tự." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Mật khẩu phải từ 8 ký tự trở lên." },
        { status: 400 }
      );
    }

    if (password.includes(" ")) {
      return NextResponse.json(
        { error: "Mật khẩu không được chứa khoảng trắng." },
        { status: 400 }
      );
    }

    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        { error: "Mật khẩu cần ít nhất 1 chữ in hoa." },
        { status: 400 }
      );
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return NextResponse.json(
        { error: "Mật khẩu cần ít nhất 1 ký tự đặc biệt." },
        { status: 400 }
      );
    }

    if(!email.includes("@gmail.com")){
      return NextResponse.json(
        { error: "email phải có đuôi @gmail.com" },
        { status: 400 }
      );
    }

    const client = await clerkClient();
    const existingUsers = await client.users.getUserList({
      emailAddress: [email],
    });

    if (existingUsers.data.length > 0) {
      return NextResponse.json(
        { error: 'Email đã tồn tại.' },
        { status: 400 }
      );
    }

    const user = await client.users.createUser({
      emailAddress: [email],
      password,
      username,
      firstName: fullName.split(" ")[0] || fullName,
      lastName: fullName.split(" ").slice(1).join(" ") || "",
      publicMetadata: { fullName, username },
    });

    // ===== Hash mật khẩu & lưu DB (cột mat_khau_hash) =====
    const saltRounds = 10; // có thể lấy từ env
    const hashed = await bcrypt.hash(password, saltRounds);

    await pool.query(
      `INSERT INTO nguoi_dung (ten_dang_nhap, email, mat_khau_hash)
       VALUES ($1, $2, $3)`,
      [username, email, hashed]
    );


    return NextResponse.json({
      message: "Đăng ký thành công!",
      userId: user.id,
      timestamp: new Date().toISOString(),
    });

  } catch (err: any) {
    console.error("Lỗi signup:", err);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi đăng ký." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Signup API đang hoạt động!",
    timestamp: new Date().toISOString(),
    endpoints: {
      signup: "POST /api/signup",
      test: "GET /api/signup"
    }
  });
}
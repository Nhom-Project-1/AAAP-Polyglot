import { NextRequest, NextResponse } from "next/server";
import {auth, clerkClient } from "@clerk/nextjs/server";
import bcrypt from "bcryptjs";
import db, { schema } from "../../../../db/drizzle"; 

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName, username } = (await req.json()) as {
      email: string;
      password: string;
      fullName: string;
      username: string;
    };

    if (!email || !password || !fullName || !username) {
      return NextResponse.json({ error: "Vui lòng nhập đầy đủ thông tin." }, { status: 400 });
    }
    if (username.length > 20) {
      return NextResponse.json({ error: "Tên đăng nhập tối đa 20 ký tự." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Mật khẩu phải từ 8 ký tự trở lên." }, { status: 400 });
    }
    if (password.includes(" ")) {
      return NextResponse.json({ error: "Mật khẩu không được chứa khoảng trắng." }, { status: 400 });
    }
    if (!/[A-Z]/.test(password)) {
      return NextResponse.json({ error: "Mật khẩu cần ít nhất 1 chữ in hoa." }, { status: 400 });
    }
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
      return NextResponse.json({ error: "Mật khẩu cần ít nhất 1 ký tự đặc biệt." }, { status: 400 });
    }
    if (!email.endsWith("@gmail.com")) {
      return NextResponse.json({ error: "Email phải có đuôi @gmail.com" }, { status: 400 });
    }

    const client = await clerkClient();
    const existingUsers = await client.users.getUserList({ emailAddress: [email] });
    if (existingUsers.data.length > 0) {
      return NextResponse.json({ error: "Email đã tồn tại trg clerk." }, { status: 400 });
    }

    const existedemailDb = await db.query.nguoi_dung.findFirst({
      where: (t, { eq }) => eq(t.email, email),
      columns: { ma_nguoi_dung: true },
    });
    if (existedemailDb) {
      return NextResponse.json({ error: "Email đã tồn tại trong hệ thống." }, { status: 400 });
    }

    const usernameHit = await client.users.getUserList({ username: [username], limit: 1 });
    if (usernameHit.data.length > 0) {
      return NextResponse.json({ error: "Tên đăng nhập đã tồn tại trong clerk" }, { status: 400 });
    }

    const existeduserDb = await db.query.nguoi_dung.findFirst({
      where: (t, { eq }) => eq(t.ten_dang_nhap, username),
      columns: { ma_nguoi_dung: true },
    });
    if (existeduserDb) {
      return NextResponse.json({ error: "Tên đăng nhập đã tồn tại trong hệ thống." }, { status: 400 });
    }

    const firstName = fullName.split(" ")[0] || fullName;
    const lastName = fullName.split(" ").slice(1).join(" ") || "";

    const user = await client.users.createUser({
      emailAddress: [email],
      password,
      username,
      firstName,
      lastName,
      publicMetadata: { fullName, username },
    });

    const saltRounds = 10;
    const hashed = await bcrypt.hash(password, saltRounds);

    await db.insert(schema.nguoi_dung).values({
      ten_dang_nhap: username,
      email,
      mat_khau_hash: hashed,
    });

    return NextResponse.json({
      message: "Đăng ký thành công!",
      userId: user.id,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Lỗi signup:", err);
    if (err?.errors) {
      return NextResponse.json({ error: err.errors }, { status: 422 });
    }
    return NextResponse.json({ error: "Có lỗi xảy ra khi đăng ký." }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Signup API đang hoạt động!",
    timestamp: new Date().toISOString(),
    endpoints: {
      signup: "POST /api/signup", 
      test: "GET /api/signup",
    },
  });
}

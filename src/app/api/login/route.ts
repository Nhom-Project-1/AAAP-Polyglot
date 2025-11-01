import { NextRequest, NextResponse } from "next/server";
import { createClerkClient } from "@clerk/backend";
import bcrypt from "bcryptjs";
import db, { schema } from "../../../../db/drizzle";
import { or, eq } from "drizzle-orm";

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json({ error: "Thiếu thông tin đăng nhập" }, { status: 400 });
    }

    const users = await db
      .select({
        id: schema.nguoi_dung.ma_nguoi_dung,
        email: schema.nguoi_dung.email,
        username: schema.nguoi_dung.ten_dang_nhap,
        hash: schema.nguoi_dung.mat_khau_hash,
      })
      .from(schema.nguoi_dung)
      .where(
        or(
          eq(schema.nguoi_dung.email, identifier),
          eq(schema.nguoi_dung.ten_dang_nhap, identifier)
        )
      )
      .limit(1);

    const dbUser = users[0];
    if (!dbUser) {
      return NextResponse.json({ error: "Tài khoản không tồn tại" }, { status: 404 });
    }

    const valid = await bcrypt.compare(password, dbUser.hash);
    if (!valid) {
      return NextResponse.json({ error: "Sai mật khẩu" }, { status: 401 });
    }

    const clerkUsers = await clerk.users.getUserList({ emailAddress: [dbUser.email] });
    const clerkUser = clerkUsers?.data?.[0];
    if (!clerkUser) {
      return NextResponse.json({ error: "Không tìm thấy user trên Clerk" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Đăng nhập thành công!",
      user: {
        id: dbUser.id,
        email: dbUser.email,
        username: dbUser.username,
        clerkId: clerkUser.id,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}

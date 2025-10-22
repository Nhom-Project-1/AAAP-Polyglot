import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { clerkClient } from "@clerk/nextjs/server";
import db, { schema } from "../../../../../db/drizzle";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const { token, code: userCode } = (await req.json()) as {
      token: string;
      code: string;
    };

    if (!token || !userCode)
      return NextResponse.json({ error: "Thiếu token hoặc mã xác thực." }, { status: 400 });

    let decoded: any;
     try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch (err: any) {
      if (err.name === "TokenExpiredError") {
        return NextResponse.json(
          { error: "Mã xác thực đã hết hạn. Vui lòng đăng ký lại." },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Token không hợp lệ." },
        { status: 400 }
      );
    }

    const { email, password, fullName, username, code } = decoded;

     if (code !== userCode) {
      return NextResponse.json({ error: "Mã xác thực không đúng." }, { status: 400 });
    }

    const existing = await db.query.nguoi_dung.findFirst({
      where: (nguoi_dung, { eq, or }) =>
        or(eq(nguoi_dung.email, email), eq(nguoi_dung.ten_dang_nhap, username)),
    });
    if (existing) {
      return NextResponse.json(
        { error: "Email hoặc tên đăng nhập đã tồn tại." },
        { status: 400 }
      );
    }
    
    const client = await clerkClient();
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

    const hashed = await bcrypt.hash(password, 10);
    await db.insert(schema.nguoi_dung).values({
      ten_dang_nhap: username,
      email,
      mat_khau_hash: hashed,
    });

    const existingUser = await db.query.nguoi_dung.findFirst({
    where: (nguoi_dung, { eq }) =>
      eq(nguoi_dung.email, user.emailAddresses?.[0]?.emailAddress),
  })
    if (!existingUser)
      return NextResponse.json({ error: "Không tìm thấy người dùng trong DB" }, { status: 404 })

    const authToken = jwt.sign({
      userId: user.id,
      ma_nguoi_dung: existingUser.ma_nguoi_dung
    }, JWT_SECRET, { expiresIn: "7d" })

    const response = NextResponse.json({
      message: "Đăng ký thành công!",
      userId: user.id,
      timestamp: new Date().toISOString(),
    });
    response.cookies.set("token", authToken, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", 
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, 
    });
    return response;
  } catch (err: any) {
    console.error("❌ Lỗi verify:", err);
    if (err.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Mã xác thực đã hết hạn. Vui lòng đăng ký lại." }, { status: 400 });
    }
    return NextResponse.json({ error: "Có lỗi xảy ra khi xác thực tài khoản." }, { status: 500 });
  }
}
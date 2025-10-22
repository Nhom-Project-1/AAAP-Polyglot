import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import jwt from "jsonwebtoken";
import db from "../../../../db/drizzle"; 

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json() as {
      identifier: string; // email hoặc username
      password: string;
    };
    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ thông tin." },
        { status: 400 }
      );
    }

    const client = await clerkClient();

    let userList = await client.users.getUserList({
      emailAddress: [identifier],
      limit: 1,
    });

    if (userList.data.length === 0) {
      userList = await client.users.getUserList({
        username: [identifier],
        limit: 1,
      });
      if (userList.data.length === 0) { 
        return NextResponse.json(
          { error: "Tên đăng nhập hoặc email không tồn tại." },
          { status: 400 }
        );
      }
    }
    
    const user = userList.data[0];
    try{
      await client.users.verifyPassword({
        userId: user.id, 
        password
      });
    }catch{
      return NextResponse.json(
        { error: "Thông tin đăng nhập không chính xác." },
        { status: 400 },
      )};
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
      message: "Đăng nhập thành công!",
      user: {
        id: user.id,
        email: user.emailAddresses?.[0]?.emailAddress ?? null,
        username: user.username ?? null,
        fullName: [user.firstName, user.lastName].filter(Boolean).join(" ") || null,
      },
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
  } catch (err: unknown) {
  console.error("Lỗi login (Clerk):", err);
  return NextResponse.json(
    { error: err instanceof Error ? err.message : "Có lỗi xảy ra khi đăng nhập." },
    { status: 500 }
  );
  }
}   
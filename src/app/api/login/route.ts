import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

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
        limit: 1, // giới hạn 1 kết quả
      });
      if (userList.data.length === 0) { // không tìm thấy user
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

    return NextResponse.json({
      message: "Đăng nhập thành công!",
      user: {
        id: user.id,
        email: user.emailAddresses?.[0]?.emailAddress ?? null,
        username: user.username ?? null,
        fullName: [user.firstName, user.lastName].filter(Boolean).join(" ") || null,
      },
      // Nếu bạn cần JWT riêng của hệ thống, tạo tại đây rồi trả về
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
  console.error("Lỗi login (Clerk):", err);
  return NextResponse.json(
    { error: err instanceof Error ? err.message : "Có lỗi xảy ra khi đăng nhập." },
    { status: 500 }
  );
  }
}   
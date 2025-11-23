import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "../../../../../db/drizzle";
import { nguoi_dung } from "../../../../../db/schema";
import jwt from "jsonwebtoken";
import { assertAdmin } from "../../../../../lib/auth";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

interface DecodedToken extends jwt.JwtPayload {
  email: string;
  password: string;
  fullName: string;
  username: string;
  code: string;
}

export async function POST(req: NextRequest) {
  try {
    await assertAdmin();

    const { token, code: userCode } = (await req.json()) as {
      token: string;
      code: string;
    };

    if (!token || !userCode) {
      return NextResponse.json({ error: "Thiếu token hoặc mã xác thực." }, { status: 400 });
    }

    let decoded: DecodedToken;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    } catch (err: unknown) {
      if ((err as Error).name === "TokenExpiredError") {
        return NextResponse.json(
          { error: "Mã xác thực đã hết hạn. Vui lòng tạo lại." },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: "Token không hợp lệ." }, { status: 400 });
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

    const hashed = await bcrypt.hash(password, 10);

    const [newUser] = await db
      .insert(nguoi_dung)
      .values({
        ten_dang_nhap: username,
        email,
        mat_khau_hash: hashed,
        ho_ten: fullName,
        // XÓA DÒNG role: "user"
      })
      .returning();

    // TRẢ VỀ JSON, KHÔNG SET COOKIE
    return NextResponse.json({
      message: "Tạo người dùng thành công!",
      user: {
        id: newUser.ma_nguoi_dung,
        username,
        email,
        fullName,
      },
    });
  } catch (err: unknown) {
    console.error("Lỗi xác thực admin:", err);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi admin xác thực người dùng." },
      { status: 500 }
    );
  }
}
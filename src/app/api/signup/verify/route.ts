import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db, { schema } from "../../../../../db/drizzle";
import jwt from "jsonwebtoken";

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
    const { token, code: userCode } = (await req.json()) as {
      token: string;
      code: string;
    };

    if (!token || !userCode)
      return NextResponse.json({ error: "Thiếu token hoặc mã xác thực." }, { status: 400 });

    let decoded: DecodedToken;
     try {
      decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    } catch (err: unknown) {
      if ((err as Error).name === "TokenExpiredError") {
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

    const hashed = await bcrypt.hash(password, 10);
    const [newUser] = await db
      .insert(schema.nguoi_dung)
      .values({
        ten_dang_nhap: username,
        email,
        mat_khau_hash: hashed,
        ho_ten: fullName,
      })
      .returning();
    const newUserId = newUser.ma_nguoi_dung;
    try {
      // ✅ Tạo bản ghi bảng xếp hạng (nếu chưa có)
      await db
        .insert(schema.bang_xep_hang)
        .values({
          ma_nguoi_dung: newUserId,
          tong_diem_xp: 0,
        })
        .onConflictDoNothing();

      const goals = await db.select().from(schema.muc_tieu);

      if (goals.length > 0) {
        console.log("🧍 newUserId:", newUserId);
        const insertValues = goals.map(goal => ({
          ma_nguoi_dung: newUserId,
          ma_muc_tieu: goal.ma_muc_tieu,
          diem_hien_tai: 0,
          hoan_thanh: false,
        }));
        console.log("📦 Dữ liệu sắp insert:", insertValues);

        const result = await db
          .insert(schema.tien_do_muc_tieu)
          .values(insertValues)
          .onConflictDoNothing();
      }
      console.log(
        `🎯 Đã khởi tạo bảng xếp hạng & ${goals.length} mục tiêu cho người dùng mới: ${newUserId}`
      );
    } catch (initErr) {
      console.error("⚠️ Lỗi khi khởi tạo bảng xếp hạng hoặc mục tiêu:", initErr);
    }
     const authToken = jwt.sign(
      {
        userId: newUser.ma_nguoi_dung,
        username,
        email,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({
      message: "Đăng ký thành công!",
      user: {
        id: newUser.ma_nguoi_dung,
        username,
        email,
        fullName,
      },
    });

    response.cookies.set("token", authToken, {
      httpOnly: true,
      secure: (process.env.NODE_ENV || "development") === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 ngày
    });

    return response;
  } catch (err: unknown) {
    console.error("❌ Lỗi verify:", err);
    if ((err as Error).name === "TokenExpiredError") {
      return NextResponse.json({ error: "Mã xác thực đã hết hạn. Vui lòng đăng ký lại." }, { status: 400 });
    }
    return NextResponse.json({ error: "Có lỗi xảy ra khi xác thực tài khoản." }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import db from "@/db/drizzle";

const JWT_SECRET = process.env.JWT_SECRET!;

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName, username } = (await req.json()) as {
      email: string;
      password: string;
      fullName: string;
      username: string;
    };

    if (!email || !password || !fullName || !username)
      return NextResponse.json({ error: "Vui lòng nhập đầy đủ thông tin." }, { status: 400 });
    if (username.length > 20) {
      return NextResponse.json({ error: "Tên đăng nhập tối đa 20 ký tự." }, { status: 400 });
    }
    if (!email.endsWith("@gmail.com")) {
      return NextResponse.json({ error: "Email phải có đuôi @gmail.com" }, { status: 400 });
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
    if (!/[0-9]/.test(password)) {
      return NextResponse.json({ error: "Mật khẩu cần ít nhất 1 chữ số." }, { status: 400 });
    }
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
      return NextResponse.json({ error: "Mật khẩu cần ít nhất 1 ký tự đặc biệt." }, { status: 400 });
    }

    const existing = await db.query.nguoi_dung.findFirst({
      where: (nguoi_dung, { eq, or }) =>
        or(eq(nguoi_dung.email, email), eq(nguoi_dung.ten_dang_nhap, username)),
    });
    if (existing) {
      return NextResponse.json({ error: "Email hoặc tên đăng nhập đã tồn tại." }, { status: 400 });
    }

    const code = generateCode();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    try {
      await transporter.sendMail({
        from: `"AAAP Polyglot" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Mã xác thực đăng ký tài khoản",
        text: `Mã xác thực của bạn là: ${code}`,
    });
    } catch (err: any) {
      console.error("❌ Lỗi gửi mail:", err);
      return NextResponse.json({ error: "Email không tồn tại hoặc không gửi được." }, { status: 400 });
    }

    const token = jwt.sign({ fullName, username, email, password, code }, JWT_SECRET, { expiresIn: "10m" });

    console.log(`✅ Gửi mã OTP cho ${email}: ${code}`);

    return NextResponse.json({
      message: "Mã xác thực đã được gửi tới email của bạn!",
      token, 
    });
  } catch (err) {
    console.error("❌ Lỗi signup:", err);
    return NextResponse.json({ error: "Có lỗi xảy ra khi gửi mã xác thực." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import pool from "../../../db";
import bcrypt from "bcryptjs";
import { auth, clerkClient } from "@clerk/nextjs/server";

type Body = {
    fullName?: string;
    username?: string;
    currentPassword?: string;
    newPassword?: string;
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Không tồn tại" }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Body không hợp lệ" }, { status: 400 });
  }

  const { username, fullName, currentPassword, newPassword } = body;

  if (!username && !fullName && !newPassword) {
    return NextResponse.json({ error: "Không có dữ liệu để cập nhật" }, { status: 400 });
  }

  if (username && username.length > 20) {
    return NextResponse.json({ error: "Tên đăng nhập tối đa 20 ký tự." }, { status: 400 });
  }
  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: "Cần nhập mật khẩu hiện tại." }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Mật khẩu mới phải từ 8 ký tự trở lên." }, { status: 400 });
    }
    if (newPassword.includes(" ")) {
      return NextResponse.json({ error: "Mật khẩu không được chứa khoảng trắng." }, { status: 400 });
    }
    if (!/[A-Z]/.test(newPassword)) {
      return NextResponse.json({ error: "Mật khẩu cần ít nhất 1 chữ in hoa." }, { status: 400 });
    }
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(newPassword)) {
      return NextResponse.json({ error: "Mật khẩu cần ít nhất 1 ký tự đặc biệt." }, { status: 400 });
    }
    if (newPassword === currentPassword) {
    return NextResponse.json({ error: "Mật khẩu mới phải khác mật khẩu hiện tại." }, { status: 400 });
    }
  }

  try {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    const email = clerkUser.primaryEmailAddress?.emailAddress?.toLowerCase();
    if (!email) {
      return NextResponse.json({ error: "Không tìm thấy email người dùng." }, { status: 400 });
    }

    const cur = await pool.query(
      `SELECT ma_nguoi_dung, ten_dang_nhap, email, mat_khau_hash
       FROM nguoi_dung
       WHERE LOWER(email) = $1
       LIMIT 1`,
      [email]
    );
    const dbUser = cur.rows[0];
    if (!dbUser) {
      return NextResponse.json({ error: "Không tìm thấy người dùng trong DB." }, { status: 404 });
    }

    if (username && username !== dbUser.ten_dang_nhap) {
      const dup = await pool.query(
        `SELECT 1 FROM nguoi_dung
         WHERE ten_dang_nhap = $1 AND ma_nguoi_dung <> $2`,
        [username, dbUser.ma_nguoi_dung]
      );
      if (dup.rowCount) {
        return NextResponse.json({ error: "Tên đăng nhập đã tồn tại." }, { status: 409 });
      }
    }

    let nextHash: string | undefined;
    if (newPassword) {
      const ok = await bcrypt.compare(currentPassword!, dbUser.mat_khau_hash);
      if (!ok) {
        return NextResponse.json({ error: "Mật khẩu hiện tại không đúng." }, { status: 400 });
      }
      await client.users.updateUser(userId, { password: newPassword });
      nextHash = await bcrypt.hash(newPassword, 10);
    }

    if (username || fullName) {
      const firstName = fullName ? (fullName.split(" ")[0] || fullName) : undefined;
      const lastName =
        fullName ? (fullName.split(" ").slice(1).join(" ") || "") : undefined;

      await client.users.updateUser(userId, {
        ...(username ? { username } : {}),
        ...(firstName !== undefined ? { firstName } : {}),
        ...(lastName !== undefined ? { lastName } : {}),
        ...(fullName ? { publicMetadata: { ...clerkUser.publicMetadata, fullName } } : {}),
      });
    }

    const sets: string[] = [];
    const params: any[] = [];
    let i = 1;

    if (username) {
      sets.push(`ten_dang_nhap = $${i++}`);
      params.push(username);
    }
    if (nextHash) {
      sets.push(`mat_khau_hash = $${i++}`);
      params.push(nextHash);
    }
    sets.push(`ngay_cap_nhat = now()`);
    params.push(dbUser.ma_nguoi_dung);

    const { rows: updated } = await pool.query(
      `UPDATE nguoi_dung
       SET ${sets.join(", ")}
       WHERE ma_nguoi_dung = $${i}
       RETURNING ma_nguoi_dung, ten_dang_nhap, email, ngay_tao, ngay_cap_nhat`,
      params
    );

    return NextResponse.json(
      {
        message: "Cập nhật thành công!",
        user: updated[0],
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Lỗi update:", err);
    if (err?.errors) {
      return NextResponse.json({ error: err.errors }, { status: 422 });
    }
    if (err?.code === "23505") {
      return NextResponse.json({ error: "Giá trị đã tồn tại." }, { status: 409 });
    }
    return NextResponse.json({ error: "Có lỗi xảy ra khi cập nhật." }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Update API OK",
    endpoint: "PATCH /api/update",
    expects: { username: "optional", fullName: "optional", currentPassword: "required if change password", newPassword: "optional" },
  });
}
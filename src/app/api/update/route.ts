import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import bcrypt from "bcryptjs";
import db, { schema } from "../../../../db/drizzle";
import { and, eq, ne } from "drizzle-orm";

type Body = {
  fullName?: string;
  username?: string;
  currentPassword?: string;
  newPassword?: string;
};

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

  const client = await clerkClient();

  if (!username && !fullName && !newPassword) {
    return NextResponse.json({ error: "Không có dữ liệu để cập nhật" }, { status: 400 });
  }
  
  if (body.hasOwnProperty("username") && !username?.trim()) {
    return NextResponse.json({ error: "Tên đăng nhập không được để trống." }, { status: 400 });
  }
  if (body.hasOwnProperty("fullName") && !fullName?.trim()) {
    return NextResponse.json({ error: "Họ tên không được để trống." }, { status: 400 });
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
    const user = await client.users.getUser(userId);
    const email = user.primaryEmailAddress?.emailAddress?.toLowerCase();
    if (!email) {
      return NextResponse.json({ error: "Không tìm thấy email người dùng." }, { status: 400 });
    }

    const rows = await db
      .select({
        id: schema.nguoi_dung.ma_nguoi_dung,
        email: schema.nguoi_dung.email,
        hash: schema.nguoi_dung.mat_khau_hash,
        ten_dn: schema.nguoi_dung.ten_dang_nhap,
      })
      .from(schema.nguoi_dung)
      .where(eq(schema.nguoi_dung.email, email))
      .limit(1);

    const dbUser = rows[0];
    if (!dbUser) {
      return NextResponse.json({ error: "Không tìm thấy người dùng trong DB." }, { status: 404 });
    }


    const currentFullName = (user.publicMetadata?.fullName as string | undefined)?.trim() || "";
    const isSameUsername = username === dbUser.ten_dn || !username;
    const isSameFullName = fullName?.trim() === currentFullName || !fullName;
    const noNewPassword = !newPassword?.trim();

    if (isSameUsername && isSameFullName && noNewPassword) {
      return NextResponse.json({ error: "Không có thay đổi nào để cập nhật." }, { status: 400 });
    }
    //

    let nextHash: string | undefined;
    if (newPassword) {
      const ok = await bcrypt.compare(currentPassword!, dbUser.hash);
      if (!ok) {
        return NextResponse.json({ error: "Mật khẩu hiện tại không đúng." }, { status: 400 });
      }
      await client.users.updateUser(userId, { password: newPassword });
      nextHash = await bcrypt.hash(newPassword, 10);
    }

    if (username) {
      const dup = await db
        .select({ id: schema.nguoi_dung.ma_nguoi_dung })
        .from(schema.nguoi_dung)
        .where(
          and(
            eq(schema.nguoi_dung.ten_dang_nhap, username),
            ne(schema.nguoi_dung.ma_nguoi_dung, dbUser.id)
          )
        )
        .limit(1);

      if (dup.length) {
        return NextResponse.json({ error: "Tên đăng nhập đã tồn tại." }, { status: 409 });
      }
    }
    
    if (username || fullName) {
      if (fullName) {
        const parts = fullName.trim().split(/\s+/);
        const firstName = parts.shift() || "";
        const lastName = parts.join(" ");

        await client.users.updateUser(userId, {
          firstName,
          lastName,
          publicMetadata: { ...user.publicMetadata, fullName },
        });
      }

      if (username) {
        await client.users.updateUser(userId, { username });
      }
    }

    const updates: Partial<typeof schema.nguoi_dung.$inferInsert> = {};
    if (email) updates.email = email;
    if (username) updates.ten_dang_nhap = username;
    if (nextHash) updates.mat_khau_hash = nextHash;
    updates.ngay_cap_nhat = new Date();

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        {
          message: "Cập nhật thành công!",
          user: { ma_nguoi_dung: dbUser.id, email: dbUser.email, ho_ten: dbUser.ten_dn },
        },
        { status: 200 }
      );
    }

    const updated = await db
      .update(schema.nguoi_dung)
      .set(updates)
      .where(eq(schema.nguoi_dung.ma_nguoi_dung, dbUser.id))
      .returning({
        ma_nguoi_dung: schema.nguoi_dung.ma_nguoi_dung,
        email: schema.nguoi_dung.email,
        ten_dang_nhap: schema.nguoi_dung.ten_dang_nhap,
        ngay_tao: schema.nguoi_dung.ngay_tao,
        ngay_cap_nhat: schema.nguoi_dung.ngay_cap_nhat,
      });

    return NextResponse.json(
      { message: "Cập nhật thành công!", user: updated[0] },
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
    expects: {
      username: "đã lưu tren CLerk + db",
      fullName: "đã lưu Clerk",
      currentPassword: "required nếu đổi mật khẩu",
      newPassword: "optional",
    },
  });
}

import { NextRequest, NextResponse } from "next/server";
import db from "../../../../db/drizzle";
import { nguoi_dung } from "../../../../db/schema";
import { assertAdmin } from "../../../../lib/auth";
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  try {
    await assertAdmin();
    const users = await db.select().from(nguoi_dung);
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Không thể lấy danh sách người dùng" }, { status: 500 });
  }
}


export async function DELETE(req: NextRequest) {
  try {
    await assertAdmin(); 

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Thiếu mã người dùng cần xóa." },
        { status: 400 }
      );
    }

    const existingUser = await db.query.nguoi_dung.findFirst({
      where: (nguoi_dung, { eq }) => eq(nguoi_dung.ma_nguoi_dung, Number(id)),
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Người dùng không tồn tại." },
        { status: 404 }
      );
    }
    await db.delete(nguoi_dung).where(eq(nguoi_dung.ma_nguoi_dung, Number(id)));


    return NextResponse.json({
      message: `Xóa người dùng '${existingUser.ten_dang_nhap}' thành công.`,
    });
  } catch (err: any) {
    console.error("❌ Lỗi khi xóa người dùng:", err);
    return NextResponse.json(
      { error: "Không thể xóa người dùng." },
      { status: err.status || 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await assertAdmin();

    const { id, ho_ten, ten_dang_nhap, mat_khau } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Thiếu mã người dùng cần cập nhật." }, { status: 400 });
    }

    const existingUser = await db.query.nguoi_dung.findFirst({
      where: (nguoi_dung, { eq }) => eq(nguoi_dung.ma_nguoi_dung, Number(id)),
    });

    if (!existingUser) {
      return NextResponse.json({ error: "Người dùng không tồn tại." }, { status: 404 });
    }

    const updateData: Record<string, any> = {};

    if (ho_ten && ho_ten !== existingUser.ho_ten) {
      updateData.ho_ten = ho_ten;
    }

    if (ten_dang_nhap && ten_dang_nhap !== existingUser.ten_dang_nhap) {
      const usernameExists = await db.query.nguoi_dung.findFirst({
        where: (nguoi_dung, { eq, and, ne }) =>
          and(eq(nguoi_dung.ten_dang_nhap, ten_dang_nhap), ne(nguoi_dung.ma_nguoi_dung, Number(id))),
      });
      if (usernameExists) {
        return NextResponse.json({ error: "Tên đăng nhập đã tồn tại. Không thể sửa." }, { status: 400 });
      }
      updateData.ten_dang_nhap = ten_dang_nhap;
    }

    if (mat_khau) {
      if (mat_khau.length < 8) {
        return NextResponse.json({ error: "Mật khẩu phải ít nhất 8 ký tự." }, { status: 400 });
      }
      updateData.mat_khau_hash = await bcrypt.hash(mat_khau, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "Không có thay đổi nào được thực hiện." });
    }

    await db.update(nguoi_dung)
      .set(updateData)
      .where(eq(nguoi_dung.ma_nguoi_dung, Number(id)));

    return NextResponse.json({ message: "Cập nhật người dùng thành công." });
  } catch (err: any) {
    console.error("❌ Lỗi khi cập nhật người dùng:", err);
    return NextResponse.json(
      { error: err.message || "Không thể cập nhật người dùng." },
      { status: err.status || 500 }
    );
  }
}
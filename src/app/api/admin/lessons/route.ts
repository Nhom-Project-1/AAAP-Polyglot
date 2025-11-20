import { NextRequest, NextResponse } from "next/server";
import db from "../../../../../db/drizzle";
import { bai_hoc } from "../../../../../db/schema";
import { assertAdmin } from "../../../../../lib/auth";
import { sql, eq, or, ilike } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    await assertAdmin();

    const sp = new URL(req.url).searchParams;
    const q = sp.get("q")?.trim() || "";

    let lessons;

    if (q) {
      lessons = await db
        .select()
        .from(bai_hoc)
        .where(
          or(
            ilike(bai_hoc.ten_bai_hoc, `%${q}%`),
            ilike(bai_hoc.mo_ta, `%${q}%`)
          )
        )
        .orderBy(bai_hoc.ma_bai_hoc);
    } else {
      lessons = await db
        .select()
        .from(bai_hoc)
        .orderBy(bai_hoc.ma_bai_hoc);
    }

    return NextResponse.json({
      message: "Lấy danh sách bài học thành công!",
      count: lessons.length,
      data: lessons,
    });
  } catch (error: any) {
    console.error("❌ Lỗi khi lấy danh sách bài học:", error);
    return NextResponse.json(
      { message: error.message || "Không thể lấy danh sách bài học" },
      { status: error.status || 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await assertAdmin();

    const { ma_don_vi, ten_bai_hoc, mo_ta } = await req.json();

    if (!ma_don_vi || !ten_bai_hoc || !mo_ta) {
      return NextResponse.json(
        { message: "Thiếu mã unit, tên bài học hoặc mô tả" },
        { status: 400 }
      );
    }

    // Kiểm tra xem unit có tồn tại không
    const unitExists = await db.query.unit.findFirst({
      where: (tbl, { eq }) => eq(tbl.ma_don_vi, Number(ma_don_vi)),
      columns: { ma_don_vi: true },
    });

    if (!unitExists) {
      return NextResponse.json(
        { message: `Mã unit '${ma_don_vi}' không tồn tại.` },
        { status: 404 }
      );
    }

    await db.execute(sql`
      SELECT setval(
        pg_get_serial_sequence('bai_hoc', 'ma_bai_hoc'),
        COALESCE((SELECT MAX(ma_bai_hoc) FROM bai_hoc), 0) + 1,
        false
      );
    `);

    await db.insert(bai_hoc).values({
      ma_don_vi: Number(ma_don_vi),
      ten_bai_hoc,
      mo_ta,
    });

    return NextResponse.json({ message: "Thêm bài học thành công!" });
  } catch (error: any) {
    console.error("❌ Lỗi khi thêm bài học:", error);
    return NextResponse.json(
      { message: error.message || "Không thể thêm bài học" },
      { status: error.status || 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await assertAdmin();

    const { ma_bai_hoc, ten_bai_hoc, mo_ta, ma_don_vi } = await req.json();

    if (!ma_bai_hoc) {
      return NextResponse.json(
        { message: "Thiếu mã bài học cần sửa" },
        { status: 400 }
      );
    }

    const updateData: Record<string, any> = {};
    if (ten_bai_hoc) updateData.ten_bai_hoc = ten_bai_hoc;
    if (mo_ta) updateData.mo_ta = mo_ta;
    if (ma_don_vi) updateData.ma_don_vi = Number(ma_don_vi);

    // Nếu có cập nhật mã unit, kiểm tra xem nó có tồn tại không
    if (ma_don_vi) {
      const unitExists = await db.query.unit.findFirst({
        where: (tbl, { eq }) => eq(tbl.ma_don_vi, Number(ma_don_vi)),
        columns: { ma_don_vi: true },
      });
      if (!unitExists) {
        return NextResponse.json(
          { message: `Mã unit '${ma_don_vi}' không tồn tại.` },
          { status: 404 }
        );
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: "Không có dữ liệu để cập nhật" },
        { status: 400 }
      );
    }

    await db
      .update(bai_hoc)
      .set(updateData)
      .where(eq(bai_hoc.ma_bai_hoc, Number(ma_bai_hoc)));

    return NextResponse.json({
      message: "Cập nhật bài học thành công!",
      updated: updateData,
    });
  } catch (error: any) {
    console.error("❌ Lỗi khi cập nhật bài học:", error);
    return NextResponse.json(
      { message: error.message || "Không thể cập nhật bài học" },
      { status: error.status || 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await assertAdmin();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Thiếu mã bài học cần xóa" },
        { status: 400 }
      );
    }

    await db.delete(bai_hoc).where(eq(bai_hoc.ma_bai_hoc, Number(id)));

    return NextResponse.json({ message: "Xóa bài học thành công!" });
  } catch (error: any) {
    console.error("❌ Lỗi khi xóa bài học:", error);
    return NextResponse.json(
      { message: error.message || "Không thể xóa bài học" },
      { status: error.status || 500 }
    );
  }
}

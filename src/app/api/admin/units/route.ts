import { NextRequest, NextResponse } from "next/server";
import db from "../../../../../db/drizzle";
import { unit } from "../../../../../db/schema";
import { assertAdmin } from "../../../../../lib/auth";
import { or, ilike, eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    await assertAdmin();

    const searchParams = new URL(req.url).searchParams;
    const q = searchParams.get("q")?.trim() || "";

    let units;

    if (q) {
      units = await db
        .select()
        .from(unit)
        .where(
          or(
            ilike(unit.ten_don_vi, `%${q}%`),
            ilike(unit.mo_ta, `%${q}%`)
          )
        )
        .orderBy(unit.ma_don_vi);
    } else {
      units = await db.select().from(unit).orderBy(unit.ma_don_vi);
    }

    return NextResponse.json({
      message: "Lấy danh sách đơn vị học thành công",
      count: units.length,
      data: units,
    });
  } catch (error: any) {
    console.error("❌ Lỗi khi lấy danh sách đơn vị học:", error);
    return NextResponse.json(
      { message: error.message || "Không thể lấy danh sách đơn vị học" },
      { status: error.status || 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await assertAdmin();

    const { ma_ngon_ngu, ten_don_vi, mo_ta } = await req.json();

    if (!ma_ngon_ngu || !ten_don_vi) {
      return NextResponse.json(
        { message: "Thiếu mã ngôn ngữ hoặc tên unit" },
        { status: 400 }
      );
    }

    // Kiểm tra xem ngôn ngữ có tồn tại không
    const languageExists = await db.query.ngon_ngu.findFirst({
      where: (tbl, { eq }) => eq(tbl.ma_ngon_ngu, Number(ma_ngon_ngu)),
      columns: { ma_ngon_ngu: true },
    });

    if (!languageExists) {
      return NextResponse.json(
        { message: `Mã ngôn ngữ '${ma_ngon_ngu}' không tồn tại.` },
        { status: 404 }
      );
    }

    await db.insert(unit).values({
      ma_ngon_ngu: Number(ma_ngon_ngu),
      ten_don_vi,
      mo_ta: mo_ta || null,
    });

    return NextResponse.json({ message: "Thêm unit học thành công!" });
  } catch (error: any) {
    console.error("❌ Lỗi khi thêm unit:", error);
    return NextResponse.json(
      { message: error.message || "Không thể thêm unit" },
      { status: error.status || 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await assertAdmin();

    const { ma_don_vi, ten_don_vi, mo_ta, ma_ngon_ngu } = await req.json();

    if (!ma_don_vi) {
      return NextResponse.json(
        { message: "Thiếu mã unit cần sửa" },
        { status: 400 }
      );
    }

    const updateData: Record<string, any> = {};
    if (ten_don_vi) updateData.ten_don_vi = ten_don_vi;
    if (mo_ta) updateData.mo_ta = mo_ta;
    if (ma_ngon_ngu) updateData.ma_ngon_ngu = Number(ma_ngon_ngu);

    // Nếu có cập nhật mã ngôn ngữ, kiểm tra xem nó có tồn tại không
    if (ma_ngon_ngu) {
      const languageExists = await db.query.ngon_ngu.findFirst({
        where: (tbl, { eq }) => eq(tbl.ma_ngon_ngu, Number(ma_ngon_ngu)),
        columns: { ma_ngon_ngu: true },
      });
      if (!languageExists) {
        return NextResponse.json(
          { message: `Mã ngôn ngữ '${ma_ngon_ngu}' không tồn tại.` },
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

    await db.update(unit)
      .set(updateData)
      .where(eq(unit.ma_don_vi, Number(ma_don_vi)));

    return NextResponse.json({
      message: "Cập nhật unit thành công!",
      updated: updateData,
    });
  } catch (error: any) {
    console.error("❌ Lỗi khi cập nhật unit:", error);
    return NextResponse.json(
      { message: error.message || "Không thể cập nhật unit" },
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
        { message: "Thiếu mã unit học cần xóa" },
        { status: 400 }
      );
    }

    await db.delete(unit).where(eq(unit.ma_don_vi, Number(id)));

    return NextResponse.json({ message: "Xóa unit thành công!" });
  } catch (error: any) {
    console.error("❌ Lỗi khi xóa unit:", error);
    return NextResponse.json(
      { message: error.message || "Không thể xóa unit" },
      { status: error.status || 500 }
    );
  }
}
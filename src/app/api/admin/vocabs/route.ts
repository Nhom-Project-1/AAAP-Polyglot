import { NextRequest, NextResponse } from "next/server";
import db from "../../../../../db/drizzle";
import { tu_vung } from "../../../../../db/schema";
import { assertAdmin } from "../../../../../lib/auth";
import { eq, or, ilike, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    await assertAdmin();

    const sp = new URL(req.url).searchParams;
    const q = sp.get("q")?.trim() || "";

    let data;

    if (q) {
      data = await db
        .select()
        .from(tu_vung)
        .where(
          or(
            ilike(tu_vung.tu, `%${q}%`),
            ilike(tu_vung.nghia, `%${q}%`)
          )
        )
        .orderBy(tu_vung.ma_tu);
    } else {
      data = await db.select().from(tu_vung).orderBy(tu_vung.ma_tu);
    }

    return NextResponse.json({
      message: "Lấy danh sách từ vựng thành công!",
      count: data.length,
      data,
    });
  } catch (error: any) {
    console.error("❌ Lỗi khi lấy danh sách từ vựng:", error);
    return NextResponse.json(
      { message: error.message || "Không thể lấy danh sách từ vựng" },
      { status: error.status || 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await assertAdmin();

    const { ma_bai_hoc, tu, phien_am, nghia, lien_ket_am_thanh, vi_du } = await req.json();

    if (!ma_bai_hoc || !tu || !nghia) {
      return NextResponse.json(
        { message: "Thiếu mã bài học, từ hoặc nghĩa" },
        { status: 400 }
      );
    }

    await db.execute(sql`
      SELECT setval(
        pg_get_serial_sequence('tu_vung', 'ma_tu'),
        COALESCE((SELECT MAX(ma_tu) FROM tu_vung), 0) + 1,
        false
      );
    `);

    await db.insert(tu_vung).values({
      ma_bai_hoc: Number(ma_bai_hoc),
      tu,
      phien_am: phien_am || null,
      nghia,
      lien_ket_am_thanh: lien_ket_am_thanh || null,
      vi_du: vi_du || null,
    });

    return NextResponse.json({ message: "Thêm từ vựng thành công!" });
  } catch (error: any) {
    console.error("❌ Lỗi khi thêm từ vựng:", error);
    return NextResponse.json(
      { message: error.message || "Không thể thêm từ vựng" },
      { status: error.status || 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await assertAdmin();

    const { ma_tu, tu, phien_am, nghia, lien_ket_am_thanh, vi_du } = await req.json();

    if (!ma_tu) {
      return NextResponse.json(
        { message: "Thiếu mã từ cần cập nhật" },
        { status: 400 }
      );
    }

    const updateData: Record<string, any> = {};
    if (tu) updateData.tu = tu;
    if (phien_am) updateData.phien_am = phien_am;
    if (nghia) updateData.nghia = nghia;
    if (lien_ket_am_thanh) updateData.lien_ket_am_thanh = lien_ket_am_thanh;
    if (vi_du) updateData.vi_du = vi_du;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: "Không có trường nào để cập nhật" },
        { status: 400 }
      );
    }

    await db.update(tu_vung)
      .set(updateData)
      .where(eq(tu_vung.ma_tu, Number(ma_tu)));

    return NextResponse.json({
      message: "Cập nhật từ vựng thành công!",
      updated: updateData,
    });
  } catch (error: any) {
    console.error("❌ Lỗi khi cập nhật từ vựng:", error);
    return NextResponse.json(
      { message: error.message || "Không thể cập nhật từ vựng" },
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
        { message: "Thiếu mã từ cần xóa" },
        { status: 400 }
      );
    }

    await db.delete(tu_vung).where(eq(tu_vung.ma_tu, Number(id)));

    return NextResponse.json({ message: "Xóa từ vựng thành công!" });
  } catch (error: any) {
    console.error("❌ Lỗi khi xóa từ vựng:", error);
    return NextResponse.json(
      { message: error.message || "Không thể xóa từ vựng" },
      { status: error.status || 500 }
    );
  }
}

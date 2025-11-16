import { NextRequest, NextResponse } from "next/server";
import db from "../../../../../db/drizzle";
import { thu_thach, lua_chon_thu_thach } from "../../../../../db/schema";
import { assertAdmin } from "../../../../../lib/auth";
import { eq, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    await assertAdmin();

    const searchRaw = new URL(req.url).searchParams.get("q");
    const search = searchRaw ? searchRaw.trim() : null;

    let results = [];

    if (search && search.length > 0) {
      const pattern = `%${search.toLowerCase()}%`;

      results = await db
        .select()
        .from(thu_thach)
        .where(
          sql`LOWER(${thu_thach.cau_hoi}) LIKE ${pattern}`
        )
        .orderBy(thu_thach.ma_thu_thach);
    } else {
      results = await db
        .select()
        .from(thu_thach)
        .orderBy(thu_thach.ma_thu_thach);
    }

    return NextResponse.json({ count: results.length, data: results });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Không thể lấy danh sách thử thách" },
      { status: error.status || 500 }
    );
  }
}


export async function POST(req: NextRequest) {
  try {
    await assertAdmin();

    const { ma_bai_hoc, cau_hoi, loai_thu_thach } = await req.json();

    if (!ma_bai_hoc || !cau_hoi || !loai_thu_thach) {
      return NextResponse.json(
        { message: "Thiếu mã bài học / câu hỏi / loại thử thách" },
        { status: 400 }
      );
    }

    await db.insert(thu_thach).values({
      ma_bai_hoc: Number(ma_bai_hoc),
      cau_hoi,
      loai_thu_thach,
    } as any);

    const [created] = await db
      .select()
      .from(thu_thach)
      .where(sql`cau_hoi = ${cau_hoi} AND ma_bai_hoc = ${ma_bai_hoc}`)
      .orderBy(sql`ma_thu_thach desc`)
      .limit(1);

    return NextResponse.json({
      message: "Thêm thử thách thành công",
      id: created?.ma_thu_thach,
    });
  } catch (err: any) {
    console.error("💥 Lỗi khi thêm thử thách:", err);
    return NextResponse.json(
      { message: err.message || "Không thể thêm thử thách" },
      { status: err.status || 500 }
    );
  }
}


export async function PUT(req: NextRequest) {
  try {
    await assertAdmin();
    const { ma_thu_thach, cau_hoi, loai_thu_thach, ma_bai_hoc } = await req.json();
    if (!ma_thu_thach) return NextResponse.json({ message: "Thiếu mã thử thách cần sửa" }, { status: 400 });

    const updateData: Record<string, any> = {};
    if (cau_hoi) updateData.cau_hoi = cau_hoi;
    if (loai_thu_thach) updateData.loai_thu_thach = loai_thu_thach;
    if (ma_bai_hoc !== undefined) updateData.ma_bai_hoc = Number(ma_bai_hoc);
    if (!Object.keys(updateData).length) return NextResponse.json({ message: "Không có trường để cập nhật" }, { status: 400 });

    await db.update(thu_thach).set(updateData).where(eq(thu_thach.ma_thu_thach, Number(ma_thu_thach)));
    return NextResponse.json({ message: "Cập nhật thử thách thành công", updated: updateData });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || "Không thể cập nhật thử thách" }, { status: err.status || 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await assertAdmin();
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ message: "Thiếu id" }, { status: 400 });

    await db.delete(thu_thach).where(eq(thu_thach.ma_thu_thach, Number(id)));
    return NextResponse.json({ message: "Đã xóa thử thách" });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || "Không thể xóa thử thách" }, { status: err.status || 500 });
  }
}

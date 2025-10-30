import { NextRequest, NextResponse } from "next/server";
import db, { schema } from "../../../../db/drizzle";
import { eq, ilike, desc } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ma_nguoi_dung, languageId, languageName } = body;

    if (!ma_nguoi_dung || (!languageId && !languageName)) {
      return NextResponse.json(
        { error: "Thiếu ma_nguoi_dung hoặc languageId/languageName" },
        { status: 400 }
      );
    }

    const user = await db
      .select({ id: schema.nguoi_dung.ma_nguoi_dung })
      .from(schema.nguoi_dung)
      .where(eq(schema.nguoi_dung.ma_nguoi_dung, Number(ma_nguoi_dung)))
      .limit(1);

    if (!user.length)
      return NextResponse.json({ error: "Người dùng không tồn tại" }, { status: 404 });

    let langId: number;
    let langName: string;

    if (languageId != null) {
      const parsed = Number(languageId);
      if (!Number.isFinite(parsed) || parsed <= 0)
        return NextResponse.json({ error: "languageId không hợp lệ" }, { status: 400 });

      const lang = await db
        .select({
          id: schema.ngon_ngu.ma_ngon_ngu,
          name: schema.ngon_ngu.ten_ngon_ngu,
        })
        .from(schema.ngon_ngu)
        .where(eq(schema.ngon_ngu.ma_ngon_ngu, parsed))
        .limit(1);

      if (!lang.length)
        return NextResponse.json({ error: "Ngôn ngữ không tồn tại" }, { status: 404 });

      langId = parsed;
      langName = lang[0].name;
    } else {
      const name = String(languageName ?? "").trim();
      if (!name)
        return NextResponse.json({ error: "languageName không hợp lệ" }, { status: 400 });

      const lang = await db
        .select({
          id: schema.ngon_ngu.ma_ngon_ngu,
          name: schema.ngon_ngu.ten_ngon_ngu,
        })
        .from(schema.ngon_ngu)
        .where(ilike(schema.ngon_ngu.ten_ngon_ngu, name))
        .limit(1);

      if (!lang.length)
        return NextResponse.json({ error: "Ngôn ngữ không tồn tại" }, { status: 404 });

      langId = Number(lang[0].id);
      langName = lang[0].name;
    }

    await db
      .update(schema.nguoi_dung_ngon_ngu)
      .set({ is_active: false })
      .where(eq(schema.nguoi_dung_ngon_ngu.ma_nguoi_dung, Number(ma_nguoi_dung)));

    await db
      .insert(schema.nguoi_dung_ngon_ngu)
      .values({
        ma_nguoi_dung: Number(ma_nguoi_dung),
        ma_ngon_ngu: langId,
        is_active: true,
      })
      .onConflictDoUpdate({
        target: [
          schema.nguoi_dung_ngon_ngu.ma_nguoi_dung,
          schema.nguoi_dung_ngon_ngu.ma_ngon_ngu,
        ],
        set: { is_active: true },
      });

    const lessons = await db
      .select({ ma_bai_hoc: schema.bai_hoc.ma_bai_hoc })
      .from(schema.bai_hoc)
      .innerJoin(
        schema.unit,
        eq(schema.unit.ma_don_vi, schema.bai_hoc.ma_don_vi)
      )
      .where(eq(schema.unit.ma_ngon_ngu, langId));

    const existingProgress = await db
      .select({ ma_bai_hoc: schema.tien_do.ma_bai_hoc })
      .from(schema.tien_do)
      .where(eq(schema.tien_do.ma_nguoi_dung, Number(ma_nguoi_dung)));

    const existingIds = new Set(existingProgress.map((p) => p.ma_bai_hoc));

    const newProgress = lessons
      .filter((l) => !existingIds.has(l.ma_bai_hoc))
      .map((l) => ({
        ma_nguoi_dung: Number(ma_nguoi_dung),
        ma_bai_hoc: l.ma_bai_hoc,
        diem_kinh_nghiem: 0,
        so_tim_con_lai: 5,
        trang_thai: "dang_hoc",
      }));

    if (newProgress.length > 0) {
      await db.insert(schema.tien_do).values(newProgress);
    }

    return NextResponse.json(
      {
        ok: true,
        message: `Đã chọn ngôn ngữ "${langName}" & khởi tạo tiến độ cho ${newProgress.length} bài học.`,
        ma_nguoi_dung: Number(ma_nguoi_dung),
        languageId: langId,
        languageName: langName,
        so_bai_moi: newProgress.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Lỗi khi chọn ngôn ngữ:", error);
    return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const ma_nguoi_dung = Number(url.searchParams.get("ma_nguoi_dung"));
  if (!ma_nguoi_dung)
    return NextResponse.json({ error: "Thiếu ma_nguoi_dung" }, { status: 400 });

  const rows = await db
    .select({
      id: schema.ngon_ngu.ma_ngon_ngu,
      name: schema.ngon_ngu.ten_ngon_ngu,
      description: schema.ngon_ngu.mo_ta,
      is_active: schema.nguoi_dung_ngon_ngu.is_active,
    })
    .from(schema.nguoi_dung_ngon_ngu)
    .innerJoin(
      schema.ngon_ngu,
      eq(schema.ngon_ngu.ma_ngon_ngu, schema.nguoi_dung_ngon_ngu.ma_ngon_ngu)
    )
    .where(eq(schema.nguoi_dung_ngon_ngu.ma_nguoi_dung, ma_nguoi_dung))
    .orderBy(desc(schema.nguoi_dung_ngon_ngu.is_active), schema.ngon_ngu.ten_ngon_ngu);

  const current = rows.find((r) => r.is_active) ?? null;
  return NextResponse.json({ ma_nguoi_dung, current, languages: rows });
}

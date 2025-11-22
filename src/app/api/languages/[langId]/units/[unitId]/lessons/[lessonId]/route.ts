import { NextRequest, NextResponse } from "next/server";
import { db, schema as s } from "../../../../../../../../../db/drizzle";
import { and, eq, ilike, sql } from "drizzle-orm";

type VocabRow = typeof s.tu_vung.$inferSelect;
type Params = { langId: string; unitId: string; lessonId: string };

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<Params> } 
) {
  try {
    const { langId: langIdStr, unitId: unitIdStr, lessonId: lessonIdStr } = await ctx.params;
    const langId = Number(langIdStr);
    const unitId = Number(unitIdStr);
    const lessonId = Number(lessonIdStr);

    if ([langId, unitId, lessonId].some(Number.isNaN)) {
      return NextResponse.json({ error: "langId, unitId hoặc lessonId không hợp lệ" }, { status: 400 });
    }

    const unit = await db.query.unit.findFirst({
      where: and(eq(s.unit.ma_don_vi, unitId), eq(s.unit.ma_ngon_ngu, langId)),
    });
    if (!unit) {
      return NextResponse.json({ error: "Không tìm thấy unit thuộc ngôn ngữ này" }, { status: 404 });
    }

    const lesson = await db.query.bai_hoc.findFirst({
      where: and(eq(s.bai_hoc.ma_bai_hoc, lessonId), eq(s.bai_hoc.ma_don_vi, unitId)),
    });
    if (!lesson) {
      return NextResponse.json({ error: "Không tìm thấy bài học thuộc unit này" }, { status: 404 });
    }

    const sp = new URL(req.url).searchParams;
    const q = sp.get("q") ?? "";                      
    const page = Math.max(1, Number(sp.get("page") ?? 1));
    const limit = Math.min(100, Math.max(1, Number(sp.get("limit") ?? 20)));
    const offset = (page - 1) * limit;

    const where = and(
      eq(s.tu_vung.ma_bai_hoc, lessonId),
      q
        ? ilike(sql`COALESCE(${s.tu_vung.tu}, '') || ' ' || COALESCE(${s.tu_vung.nghia}, '')`, `%${q}%`)
        : undefined,
    );

    const [rows, [{ count }]] = await Promise.all([
      db
        .select()
        .from(s.tu_vung)
        .where(where)
        .orderBy(s.tu_vung.ma_tu)
        .limit(limit)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(s.tu_vung).where(where),
    ]);

    return NextResponse.json({
      data: rows as VocabRow[],
      lesson,
      unit,
      pagination: { page, limit, total: Number(count) },
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Vocabularies-by-lesson failed", detail: String(e) },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { db, schema as s } from "../../../../../../../../db/drizzle";
import { and, eq, ilike, sql } from "drizzle-orm";

type LessonRow = typeof s.bai_hoc.$inferSelect;

export async function GET(req: NextRequest, ctx: { params: Promise<{ langId: string; unitId: string }> }) {
  try {
    const { langId: langIdStr, unitId: unitIdStr } = await ctx.params;      
    const langId = Number(langIdStr);
    const unitId = Number(unitIdStr);
    if (Number.isNaN(langId) || Number.isNaN(unitId)) {
      return NextResponse.json({ error: "langId hoặc unitId không hợp lệ" }, { status: 400 });
    }

    const unit = await db.query.unit.findFirst({
      where: and(eq(s.unit.ma_don_vi, unitId), eq(s.unit.ma_ngon_ngu, langId)),
    });
    if (!unit) {
      return NextResponse.json({ error: "Không tìm thấy unit thuộc ngôn ngữ này" }, { status: 404 });
    }

    const sp = new URL(req.url).searchParams;
    const q = sp.get("q") ?? "";
    const page = Math.max(1, Number(sp.get("page") ?? 1));
    const limit = Math.min(100, Number(sp.get("limit") ?? 20));
    const offset = (page - 1) * limit;

    const where = and(
      eq(s.bai_hoc.ma_don_vi, unitId),
      q ? ilike(s.bai_hoc.ten_bai_hoc, `%${q}%`) : undefined
    );

    const [rows, [{ count }]] = await Promise.all([
      db.select().from(s.bai_hoc).where(where).orderBy(s.bai_hoc.ma_bai_hoc).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(s.bai_hoc).where(where),
    ]);

    return NextResponse.json({
      data: rows as LessonRow[],
      unit, 
      pagination: { page, limit, total: Number(count) },
    });
  } catch (e) {
    return NextResponse.json({ error: "Lessons-by-unit-in-language failed", detail: String(e) }, { status: 500 });
  }
}

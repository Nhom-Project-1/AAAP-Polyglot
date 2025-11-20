import { NextRequest, NextResponse } from "next/server";
import { db, schema as s } from "../../../../../../db/drizzle";
import { and, eq, ilike, inArray } from "drizzle-orm";

type UnitRow   = typeof s.unit.$inferSelect;
type LessonRow = typeof s.bai_hoc.$inferSelect;

type Params = { langId: string };

export async function GET(req: NextRequest, ctx: { params: Promise<Params> }) {
  try {
    const { langId: langIdStr } = await ctx.params;
    const langId = Number(langIdStr);
    if (Number.isNaN(langId)) {
      return NextResponse.json({ error: "langId không hợp lệ" }, { status: 400 });
    }

    const sp = new URL(req.url).searchParams;
    const q = sp.get("q") ?? ""; 

    const whereUnits = and(
      eq(s.unit.ma_ngon_ngu, langId),
      q ? ilike(s.unit.ten_don_vi, `%${q}%`) : undefined
    );

    const units: UnitRow[] = await db
      .select()
      .from(s.unit)
      .where(whereUnits)
      .orderBy(s.unit.ma_don_vi);

    if (units.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const unitIds = units.map(u => u.ma_don_vi as number);
    const lessons: LessonRow[] = await db
      .select()
      .from(s.bai_hoc)
      .where(inArray(s.bai_hoc.ma_don_vi, unitIds))
      .orderBy(s.bai_hoc.ma_bai_hoc);

    const lessonsByUnit = new Map<number, LessonRow[]>();
    for (const id of unitIds) lessonsByUnit.set(id, []);
    for (const l of lessons) {
      (lessonsByUnit.get(l.ma_don_vi as number) ?? []).push(l);
      if (!lessonsByUnit.has(l.ma_don_vi as number)) {
        lessonsByUnit.set(l.ma_don_vi as number, [l]);
      }
    }

    const result = units.map(u => ({
      ma_don_vi: u.ma_don_vi,
      ten_don_vi: u.ten_don_vi,
      mo_ta: u.mo_ta,            
      ma_ngon_ngu: u.ma_ngon_ngu,
      bai_hoc: lessonsByUnit.get(u.ma_don_vi as number) ?? [],
    }))

    return NextResponse.json({ data: result });
  } catch (e) {
    return NextResponse.json({ error: "Units-by-language failed", detail: String(e) }, { status: 500 });
  }
}
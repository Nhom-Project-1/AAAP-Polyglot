import { NextResponse } from "next/server";
import { db, schema as s } from "../../../../../db/drizzle";
import { eq, inArray } from "drizzle-orm";

type UnitRow   = typeof s.unit.$inferSelect;
type LessonRow = typeof s.bai_hoc.$inferSelect;
type VocabRow  = typeof s.tu_vung.$inferSelect;

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const unitId = Number(params.id);
    if (Number.isNaN(unitId)) {
      return NextResponse.json({ error: "id unit khong hop le" }, { status: 400 });
    }

    const unit: UnitRow | undefined = await db.query.unit.findFirst({
      where: eq(s.unit.ma_don_vi, unitId),
    });
    if (!unit) return NextResponse.json({ error: "khong tim thay unit" }, { status: 404 });

    const lessons: LessonRow[] = await db
      .select()
      .from(s.bai_hoc)
      .where(eq(s.bai_hoc.ma_don_vi, unitId));

    let lessonsWithVocabs = lessons.map(l => ({ ...l, tu_vung: [] as VocabRow[] }));

    if (lessons.length > 0) {
      const lessonIds: number[] = lessons.map(l => l.ma_bai_hoc as number);

      const vocabs: VocabRow[] = await db
        .select()
        .from(s.tu_vung)
        .where(inArray(s.tu_vung.ma_bai_hoc, lessonIds));

      const byLesson: Record<number, VocabRow[]> = Object.fromEntries(
        lessonIds.map(id => [id, [] as VocabRow[]])
      );
      for (const v of vocabs) {
        const k = v.ma_bai_hoc as number;
        (byLesson[k] ??= []).push(v);
      }

      lessonsWithVocabs = lessons.map(l => ({
        ...l,
        tu_vung: byLesson[l.ma_bai_hoc as number] ?? [],
      }));
    }

    return NextResponse.json({
      data: {
        ...unit,
        bai_hoc: lessonsWithVocabs,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: "Unit tree failed", detail: String(e) }, { status: 500 });
  }
}

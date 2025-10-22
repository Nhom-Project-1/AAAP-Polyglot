import { NextRequest, NextResponse } from "next/server";
import db, { schema } from "../../../../db/drizzle"; 
import { eq, ilike, desc } from "drizzle-orm";
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET!

export async function POST(req: NextRequest) {
    type PostBody = {
    languageId?: number | string;
    languageName?: string;
  };

  let body: PostBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body không phải JSON hợp lệ" }, { status: 400 });
  }
  const token = req.cookies.get("token")?.value
  if (!token) {
    return NextResponse.json({ error: "Không có token xác thực" }, { status: 401 })
  }
  let decoded: any
  try {
    decoded = jwt.verify(token, JWT_SECRET)
  } catch (err: any) {
    return NextResponse.json({ error: "Token không hợp lệ hoặc đã hết hạn" }, { status: 401 })
  }

  const ma_nguoi_dung = decoded.ma_nguoi_dung
  if (!ma_nguoi_dung) {
    return NextResponse.json({ error: "Không thể xác định người dùng từ token" }, { status: 401 })
  }
  const {  languageId, languageName } = body;
  if (!languageId && !languageName) {
    return NextResponse.json({ error: "Thiếu ma_nguoi_dung hoặc languageId/languageName" }, { status: 400 });
  }

  const user = await db.select({ id: schema.nguoi_dung.ma_nguoi_dung })
    .from(schema.nguoi_dung)
    .where(eq(schema.nguoi_dung.ma_nguoi_dung, Number(ma_nguoi_dung)))
    .limit(1);
  if (!user.length) return NextResponse.json({ error: "Người dùng không tồn tại" }, { status: 404 });

  let langId: number;
  if (languageId != null) {
    const parsed = Number(languageId);
    if (!Number.isFinite(parsed) || parsed <= 0) 
      return NextResponse.json({ error: "languageId không hợp lệ" }, { status: 400 });

    const lang = await db.select({ id: schema.ngon_ngu.ma_ngon_ngu })
      .from(schema.ngon_ngu)
      .where(eq(schema.ngon_ngu.ma_ngon_ngu, parsed)).limit(1);

    if (!lang.length) 
      return NextResponse.json({ error: "Ngôn ngữ không tồn tại" }, { status: 404 });
    langId = parsed;
  } else {
    const name = String(languageName ?? "").trim();
    if (!name) 
      return NextResponse.json({ error: "languageName không hợp lệ" }, { status: 400 });
    const lang = await db.select({ id: schema.ngon_ngu.ma_ngon_ngu })
      .from(schema.ngon_ngu)
      .where(ilike(schema.ngon_ngu.ten_ngon_ngu, name)).limit(1);
    if (!lang.length) 
      return NextResponse.json({ error: "Ngôn ngữ không tồn tại" }, { status: 404 });
    langId = Number(lang[0].id);
  }

  let attempts = 0;
  while (attempts < 2) {
    try {
      await db.update(schema.nguoi_dung_ngon_ngu)
        .set({ is_active: false })
        .where(eq(schema.nguoi_dung_ngon_ngu.ma_nguoi_dung, Number(ma_nguoi_dung)));

      await db.insert(schema.nguoi_dung_ngon_ngu)
        .values({
          ma_nguoi_dung: Number(ma_nguoi_dung),
          ma_ngon_ngu: Number(langId),
          is_active: true,
        })
        .onConflictDoUpdate({
          target: [schema.nguoi_dung_ngon_ngu.ma_nguoi_dung, schema.nguoi_dung_ngon_ngu.ma_ngon_ngu],
          set: { is_active: true },
        });

      break; 
      } catch (e: unknown) {
      console.error("Lỗi đặt ngôn ngữ active:", e);
      attempts++;
      if (attempts >= 2) {
        return NextResponse.json({ error: "Không thể đặt ngôn ngữ active (xung đột)." }, { status: 409 });
      }
    }
  }

  return NextResponse.json({
    ok: true,
    message: "Đã chọn ngôn ngữ và đặt làm ngôn ngữ học hiện tại",
    ma_nguoi_dung: Number(ma_nguoi_dung),
    languageId: Number(langId),
    languageName: languageName ?? null,
  }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value
  if (!token) {
    return NextResponse.json({ error: "Không có token xác thực" }, { status: 401 })
  }
  let decoded: any
  try {
    decoded = jwt.verify(token, JWT_SECRET)
  } catch (err) {
    return NextResponse.json({ error: "Token không hợp lệ hoặc đã hết hạn" }, { status: 401 })
  }
  const ma_nguoi_dung = decoded.ma_nguoi_dung
  if (!ma_nguoi_dung) {
    return NextResponse.json({ error: "Không thể xác định người dùng từ token" }, { status: 401 })
  }

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

  const current = rows.find(r => r.is_active) ?? null;
  return NextResponse.json({ ma_nguoi_dung, current, languages: rows });
}
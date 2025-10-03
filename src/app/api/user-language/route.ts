// src/app/api/user-language/route.ts
import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/node-postgres";
import pool from "../../../db";
import { sql } from "drizzle-orm";

const db = drizzle(pool);

/**
 * POST /api/user-language
 * body: { ma_nguoi_dung: number; languageId?: number; languageName?: string }
 */
export async function POST(req: NextRequest) {
  const { ma_nguoi_dung, languageId, languageName } = await req.json();

  if (!ma_nguoi_dung || (!languageId && !languageName)) {
    return NextResponse.json({ error: "Thiếu ma_nguoi_dung hoặc languageId/languageName" }, { status: 400 });
  }

  // resolve languageId nếu chỉ có tên
  let langId = Number(languageId);
  if (!langId && languageName) {
    const r = await db.execute(
      sql`SELECT ma_ngon_ngu FROM ngon_ngu WHERE ten_ngon_ngu = ${languageName} LIMIT 1`
    );
    if (!r.rows.length) {
      return NextResponse.json({ error: "Ngôn ngữ không tồn tại" }, { status: 404 });
    }
    langId = Number(r.rows[0].ma_ngon_ngu);
  }

  // insert nếu chưa có (unique sẽ chặn trùng)
  await db.execute(
    sql`
      INSERT INTO nguoi_dung_ngon_ngu (ma_nguoi_dung, ma_ngon_ngu)
      VALUES (${ma_nguoi_dung}, ${langId})
      ON CONFLICT (ma_nguoi_dung, ma_ngon_ngu) DO NOTHING
    `
  );

  return NextResponse.json({ ok: true, message: "Đã chọn ngôn ngữ", ma_nguoi_dung, languageId: langId, languageName: languageName || null });
}


/**
 * GET /api/user-language?ma_nguoi_dung=1
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const ma_nguoi_dung = Number(url.searchParams.get("ma_nguoi_dung"));
  if (!ma_nguoi_dung) return NextResponse.json({ error: "Thiếu ma_nguoi_dung" }, { status: 400 });

  const r = await db.execute(sql`
    SELECT l.ma_ngon_ngu AS id, l.ten_ngon_ngu AS name, l.mo_ta AS description
    FROM nguoi_dung_ngon_ngu ul
    JOIN ngon_ngu l ON l.ma_ngon_ngu = ul.ma_ngon_ngu
    WHERE ul.ma_nguoi_dung = ${ma_nguoi_dung}
  `);

  return NextResponse.json({ ma_nguoi_dung, languages: r.rows });
}
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

  const checkUser = await db.execute(
    sql`SELECT 1 FROM nguoi_dung WHERE ma_nguoi_dung = ${ma_nguoi_dung} LIMIT 1`
  );
  if (!checkUser.rows.length) {
    return NextResponse.json(
      { error: "Người dùng không tồn tại" },
      { status: 404 } 
    );
  }

  let langId: number | null = null;

  if (languageId !== undefined && languageId !== null) {
    const parsed = Number(languageId);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return NextResponse.json({ error: "languageId không hợp lệ" }, { status: 400 });
    }

    const checkLang = await db.execute(
      sql`SELECT ma_ngon_ngu FROM ngon_ngu WHERE ma_ngon_ngu = ${parsed} LIMIT 1`
    );
    if (!checkLang.rows.length) {
      return NextResponse.json({ error: "Ngôn ngữ không tồn tại" }, { status: 404 });
    }
    langId = parsed;
  } else if (languageName) {
    const name = (languageName ?? "").trim();
    const checkLang = await db.execute(
      sql`SELECT ma_ngon_ngu FROM ngon_ngu WHERE ten_ngon_ngu ILIKE ${name} LIMIT 1`
    );
    if (!checkLang.rows.length) {
      return NextResponse.json({ error: "Ngôn ngữ không tồn tại" }, { status: 404 });
    }
    langId = Number(checkLang.rows[0].ma_ngon_ngu);
  }

      await db.execute(sql`BEGIN`);
    try {
      // Tắt active cho tất cả ngôn ngữ của user
      await db.execute(sql`
        UPDATE nguoi_dung_ngon_ngu
        SET is_active = FALSE
        WHERE ma_nguoi_dung = ${ma_nguoi_dung}
      `);

      // Đảm bảo có bản ghi cho ngôn ngữ này (nếu chưa có), sau đó bật active
      await db.execute(sql`
        INSERT INTO nguoi_dung_ngon_ngu (ma_nguoi_dung, ma_ngon_ngu, is_active)
        VALUES (${ma_nguoi_dung}, ${langId}, TRUE)
        ON CONFLICT (ma_nguoi_dung, ma_ngon_ngu)
        DO UPDATE SET is_active = EXCLUDED.is_active
      `);

      await db.execute(sql`COMMIT`);
    } catch (e) {
      await db.execute(sql`ROLLBACK`);
      // Các lỗi FK/unique… sẽ được trả 500 có message chung
      return NextResponse.json({ error: "Lỗi khi cập nhật ngôn ngữ hiện tại" }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message: "Đã chọn ngôn ngữ và đặt làm hiện tại",
      ma_nguoi_dung,
      languageId: langId,
      languageName: languageName,
    });
}

/**
 * GET /api/user-language?ma_nguoi_dung=1
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const ma_nguoi_dung = Number(url.searchParams.get("ma_nguoi_dung"));
  if (!ma_nguoi_dung) {
    return NextResponse.json({ error: "Thiếu ma_nguoi_dung" }, { status: 400 });
  }

  const r = await db.execute(sql`
    SELECT l.ma_ngon_ngu   AS id,
           l.ten_ngon_ngu  AS name,
           l.mo_ta         AS description,
           ul.is_active    AS is_active
    FROM nguoi_dung_ngon_ngu ul
    JOIN ngon_ngu l ON l.ma_ngon_ngu = ul.ma_ngon_ngu
    WHERE ul.ma_nguoi_dung = ${ma_nguoi_dung}
    ORDER BY ul.is_active DESC, l.ten_ngon_ngu ASC
  `);

  const languages = r.rows;
  const current = languages.find((x: any) => x.is_active === true) || null;

  return NextResponse.json({
    ma_nguoi_dung,
    current,     
    languages    
  });
}

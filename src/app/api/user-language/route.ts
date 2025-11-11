/* eslint-disable @typescript-eslint/no-explicit-any */
import { desc, eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import db, { schema } from '../../../../db/drizzle';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: NextRequest) {
  try {
    // 🧩 Lấy & giải mã token từ cookie
    const token = req.cookies.get('token')?.value;
    if (!token)
      return NextResponse.json(
        { error: 'Không có token xác thực' },
        { status: 401 },
      );

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json(
        { error: 'Token không hợp lệ hoặc đã hết hạn' },
        { status: 401 },
      );
    }

    // 🔍 Token phải có `userId`
    const ma_nguoi_dung = decoded.userId;
    if (!ma_nguoi_dung)
      return NextResponse.json(
        { error: 'Không thể xác định người dùng từ token' },
        { status: 401 },
      );

    // 📦 Parse body
    const body = await req.json().catch(() => null);
    if (!body)
      return NextResponse.json({ error: 'Body không hợp lệ' }, { status: 400 });

    const { languageId, languageName } = body;
    if (!languageId && !languageName)
      return NextResponse.json(
        { error: 'Thiếu languageId hoặc languageName' },
        { status: 400 },
      );

    // 🧠 Kiểm tra người dùng có tồn tại
    const user = await db.query.nguoi_dung.findFirst({
      columns: { ma_nguoi_dung: true },
      where: (tbl, { eq }) => eq(tbl.ma_nguoi_dung, Number(ma_nguoi_dung)),
    });
    if (!user)
      return NextResponse.json(
        { error: 'Người dùng không tồn tại' },
        { status: 404 },
      );

    // 🔍 Xác định ngôn ngữ
    let langId: number;
    let langName: string;

    if (languageId) {
      const parsed = Number(languageId);
      if (!Number.isFinite(parsed) || parsed <= 0)
        return NextResponse.json(
          { error: 'languageId không hợp lệ' },
          { status: 400 },
        );

      const lang = await db.query.ngon_ngu.findFirst({
        where: (tbl, { eq }) => eq(tbl.ma_ngon_ngu, parsed),
      });
      if (!lang)
        return NextResponse.json(
          { error: 'Ngôn ngữ không tồn tại' },
          { status: 404 },
        );

      langId = lang.ma_ngon_ngu;
      langName = lang.ten_ngon_ngu;
    } else {
      const name = String(languageName ?? '').trim();
      if (!name)
        return NextResponse.json(
          { error: 'languageName không hợp lệ' },
          { status: 400 },
        );

      const lang = await db.query.ngon_ngu.findFirst({
        where: (tbl, { ilike }) => ilike(tbl.ten_ngon_ngu, name),
      });
      if (!lang)
        return NextResponse.json(
          { error: 'Ngôn ngữ không tồn tại' },
          { status: 404 },
        );

      langId = lang.ma_ngon_ngu;
      langName = lang.ten_ngon_ngu;
    }

    // First, set all of the user's languages to inactive
    await db
      .update(schema.nguoi_dung_ngon_ngu)
      .set({ is_active: false })
      .where(eq(schema.nguoi_dung_ngon_ngu.ma_nguoi_dung, ma_nguoi_dung));

    // Then, upsert the new active language
    await db
      .insert(schema.nguoi_dung_ngon_ngu)
      .values({
        ma_nguoi_dung: ma_nguoi_dung,
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

    // ✅ Trả về kết quả
    return NextResponse.json(
      {
        message: `Đã chọn ngôn ngữ "${langName}"`,
        ma_nguoi_dung,
        languageId: langId,
        languageName: langName,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error('❌ Lỗi khi lưu ngôn ngữ:', err);
    return NextResponse.json(
      { error: 'Không thể lưu ngôn ngữ' },
      { status: 500 },
    );
  }
}

// 🔹 Lấy danh sách ngôn ngữ của user (GET)
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token)
      return NextResponse.json(
        { error: 'Không có token xác thực' },
        { status: 401 },
      );

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json(
        { error: 'Token không hợp lệ hoặc đã hết hạn' },
        { status: 401 },
      );
    }

    const ma_nguoi_dung = decoded.userId;
    if (!ma_nguoi_dung)
      return NextResponse.json(
        { error: 'Không thể xác định người dùng từ token' },
        { status: 401 },
      );

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
        eq(schema.ngon_ngu.ma_ngon_ngu, schema.nguoi_dung_ngon_ngu.ma_ngon_ngu),
      )
      .where(eq(schema.nguoi_dung_ngon_ngu.ma_nguoi_dung, ma_nguoi_dung))
      .orderBy(
        desc(schema.nguoi_dung_ngon_ngu.is_active),
        schema.ngon_ngu.ten_ngon_ngu,
      );

    const current = rows.find((r) => r.is_active) ?? null;
    return NextResponse.json({ ma_nguoi_dung, current, languages: rows });
  } catch (err) {
    console.error('❌ Lỗi GET /user-language:', err);
    return NextResponse.json(
      { error: 'Không thể lấy danh sách ngôn ngữ' },
      { status: 500 },
    );
  }
}

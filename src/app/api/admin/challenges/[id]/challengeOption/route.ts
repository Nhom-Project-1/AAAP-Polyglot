import { NextRequest, NextResponse } from "next/server";
import db from "../../../../../../../db/drizzle";
import { thu_thach, lua_chon_thu_thach } from "../../../../../../../db/schema";
import { assertAdmin } from "../../../../../../../lib/auth";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    await assertAdmin();

    const { id } = await ctx.params;
    const challengeId = Number(id);

    if (Number.isNaN(challengeId)) {
      return NextResponse.json({ message: 'id không hợp lệ' }, { status: 400 });
    }

    const challenge = await db.query.thu_thach.findFirst({
      where: (t, { eq }) => eq(t.ma_thu_thach, challengeId),
    });

    if (!challenge)
      return NextResponse.json({ message: 'Không tìm thấy thử thách' }, { status: 404 });

    const answers = await db
      .select()
      .from(lua_chon_thu_thach)
      .where(eq(lua_chon_thu_thach.ma_thu_thach, challengeId));

    return NextResponse.json({ ...challenge, lua_chon: answers });
  } catch (err: any) {
    console.error('Error', err);
    return NextResponse.json(
      { message: err.message || 'Không thể lấy chi tiết' },
      { status: err.status || 500 },
    );
  }
}


export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    await assertAdmin(); 

    const { id } = await ctx.params;
    const challengeId = Number(id);

    if (Number.isNaN(challengeId)) {
      return NextResponse.json({ message: "ID thử thách không hợp lệ" }, { status: 400 });
    }

    const challenge = await db.query.thu_thach.findFirst({
      where: eq(thu_thach.ma_thu_thach, challengeId),
    });

    if (!challenge) {
      return NextResponse.json({ message: "Không tìm thấy thử thách" }, { status: 404 });
    }

    const { answers } = await req.json();

    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ message: "Danh sách đáp án không hợp lệ" }, { status: 400 });
    }

    const newAnswers = await db
      .insert(lua_chon_thu_thach)
      .values(
        answers.map((a) => ({
          ma_thu_thach: challengeId,
          noi_dung: a.noi_dung,
          dung: !!a.dung, 
        }))
      )
      .returning();

    return NextResponse.json({
      message: "Thêm mới đáp án thành công",
      created: newAnswers,
    });
  } catch (err: any) {
    console.error("❌ Lỗi POST /answers:", err);
    return NextResponse.json(
      { message: err.message || "Không thể thêm mới đáp án" },
      { status: err.status || 500 }
    );
  }
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    await assertAdmin();
    const { id } = await ctx.params; 
    const challengeId = Number(id);

    if (Number.isNaN(challengeId)) {
      return NextResponse.json({ message: "ID thử thách không hợp lệ" }, { status: 400 });
    }

    const { answers } = await req.json();

    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ message: "Danh sách đáp án không hợp lệ" }, { status: 400 });
    }

    const updatedAnswers = [];

    for (const ans of answers) {
      if (!ans.ma_lua_chon) {
        continue;
      }

      await db
        .update(lua_chon_thu_thach)
        .set({
          noi_dung: ans.noi_dung,
          dung: ans.dung,
        })
        .where(eq(lua_chon_thu_thach.ma_lua_chon, ans.ma_lua_chon));

      updatedAnswers.push({
        ma_lua_chon: ans.ma_lua_chon,
        noi_dung: ans.noi_dung,
        dung: ans.dung,
      });
    }

    return NextResponse.json({
      message: "Cập nhật đáp án thành công",
      updated: updatedAnswers,
    });
  } catch (err: any) {
    console.error("❌ Lỗi cập nhật đáp án:", err);
    return NextResponse.json(
      { message: err.message || "Không thể cập nhật đáp án" },
      { status: err.status || 500 }
    );
  }
}


export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    await assertAdmin();

    const { id } = await ctx.params;  
    const answerId = Number(id);

    if (Number.isNaN(answerId)) {
      return NextResponse.json({ message: "ID đáp án không hợp lệ" }, { status: 400 });
    }

    const deleted = await db
      .delete(lua_chon_thu_thach)
      .where(eq(lua_chon_thu_thach.ma_lua_chon, answerId))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ message: "Không tìm thấy đáp án để xóa" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Đã xóa đáp án thành công",
      deleted: deleted[0],
    });
  } catch (err: any) {
    console.error("❌ Lỗi xóa đáp án:", err);
    return NextResponse.json(
      { message: err.message || "Không thể xóa đáp án" },
      { status: err.status || 500 }
    );
  }
}
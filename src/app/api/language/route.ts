import { NextRequest, NextResponse } from "next/server"
import db from "../../../../db/drizzle"
import { ngon_ngu } from "../../../../db/schema"
import { assertAdmin } from "../../../../lib/auth"
import { ilike, eq, or } from "drizzle-orm"

export async function GET(req: NextRequest) {
  try {
    const sp = new URL(req.url).searchParams;
    const q = sp.get("q")?.trim() || "";

    let data;

    if (q) {
      data = await db
        .select()
        .from(ngon_ngu)
        .where(
          or(
            ilike(ngon_ngu.ten_ngon_ngu, `%${q}%`),
            ilike(ngon_ngu.mo_ta, `%${q}%`)
          )
        );
    } else {
      data = await db.select().from(ngon_ngu);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Lỗi khi lấy dữ liệu ngôn ngữ:", error);
    return NextResponse.json(
      { message: "Không thể lấy dữ liệu ngôn ngữ" },
      { status: 500 }
    );
  }
}


export async function POST(req: Request) {
  try {
    await assertAdmin()
    const body = await req.json()
    const { ten_ngon_ngu, mo_ta } = body

    if (!ten_ngon_ngu || !mo_ta) {
      return NextResponse.json(
        { message: "Thiếu tên ngôn ngữ hoặc mô tả." },
        { status: 400 }
      )
    }

    const result = await db
      .insert(ngon_ngu)
      .values({ ten_ngon_ngu, mo_ta })
      .returning({ ma_ngon_ngu: ngon_ngu.ma_ngon_ngu });

    return NextResponse.json({ 
      message: "Thêm ngôn ngữ thành công",
      ma_ngon_ngu: result[0].ma_ngon_ngu 
    });

  } catch (error: any) {
    const status = error.status || 500
    return NextResponse.json(
      { message: error.message || "Không thể thêm ngôn ngữ" },
      { status }
    )
  }
}

export async function PUT(req: Request) {
  try {
    await assertAdmin()
    const body = await req.json()
    const { ma_ngon_ngu, ten_ngon_ngu, mo_ta } = body

    const id = parseInt(ma_ngon_ngu, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { message: "Mã ngôn ngữ không hợp lệ." },
        { status: 400 }
      );
    }

    const dataToUpdate: Record<string, any> = {};
    if (ten_ngon_ngu !== undefined) dataToUpdate.ten_ngon_ngu = ten_ngon_ngu;
    if (mo_ta !== undefined) dataToUpdate.mo_ta = mo_ta;

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json(
        { message: "Không có trường nào để cập nhật." },
        { status: 400 }
      );
    }

    await db
      .update(ngon_ngu)
      .set(dataToUpdate)
      .where(eq(ngon_ngu.ma_ngon_ngu, id));

    return NextResponse.json({
      message: "Cập nhật ngôn ngữ thành công!",
      updatedFields: dataToUpdate,
    });
  } catch (error: any) {
    console.error("Lỗi khi cập nhật ngôn ngữ:", error);
    const status = error.status || 500;
    return NextResponse.json(
      { message: error.message || "Không thể cập nhật ngôn ngữ" },
      { status }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await assertAdmin()  
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("ma_ngon_ngu")
    
    const numId = parseInt(id || "", 10)
    if (!id || isNaN(numId)) {
      return NextResponse.json({ message: "Thiếu hoặc sai mã ngôn ngữ" }, { status: 400 })
    }

    await db.delete(ngon_ngu).where(eq(ngon_ngu.ma_ngon_ngu, numId))
    return NextResponse.json({ message: "Xóa thành công" })
  } catch (error: any) {
    const status = error.status || 500
    return NextResponse.json(
      { message: error.message || "Không thể xóa ngôn ngữ" },
      { status }
    )
  }
}
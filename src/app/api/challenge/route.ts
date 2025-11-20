import { and, eq, asc } from "drizzle-orm"
import { NextResponse } from "next/server"
import { db } from '../../../../db/drizzle';
import { thu_thach } from '../../../../db/schema';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const ma_bai_hoc = url.searchParams.get('ma_bai_hoc');

    if (!ma_bai_hoc) {
      return NextResponse.json(
        { error: 'Thiếu tham số ma_bai_hoc' },
        { status: 400 },
      );
    }

    // Lấy toàn bộ dữ liệu thử thách, bao gồm cả các lựa chọn
    const challenges = await db.query.thu_thach.findMany({
      where: eq(thu_thach.ma_bai_hoc, Number(ma_bai_hoc)),
      with: {
        lua_chon_thu_thach: {
        }
      },
    });

    return NextResponse.json({
      challenges,
    });
  } catch (error) {
    console.error('Lỗi khi lấy thử thách:', error);
    return NextResponse.json(
      { error: 'Lỗi khi lấy thử thách' },
      { status: 500 },
    );
  }
}

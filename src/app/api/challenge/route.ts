import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
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

    const challenges = await db.query.thu_thach.findMany({
      where: eq(thu_thach.ma_bai_hoc, Number(ma_bai_hoc)),
    });

    if (!challenges || challenges.length === 0) {
      return NextResponse.json(
        { message: `Không có bài học có mã ${ma_bai_hoc}` },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: `Tìm thấy ${challenges.length} thử thách cho bài học ${ma_bai_hoc}`,
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

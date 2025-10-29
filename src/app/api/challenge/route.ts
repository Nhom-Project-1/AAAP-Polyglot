import { NextResponse } from "next/server";
import {db} from "../../../../db/drizzle";
import {thu_thach } from "../../../../db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
    try{
        const url = new URL(request.url);
        const ma_bai_hoc = url.searchParams.get("ma_bai_hoc");

        if (!ma_bai_hoc) {
            return NextResponse.json({ error: "ma_bai_hoc khong dung" }, { status: 400 });
        }

        const challenges = await db.query.thu_thach.findMany({
            where: eq(thu_thach.ma_bai_hoc, Number(ma_bai_hoc)),
        });

        return NextResponse.json({ challenges });
    }catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Loi khi lay thu thach" }, { status: 500 });
    }

}
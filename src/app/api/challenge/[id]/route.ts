import { NextResponse } from "next/server";
import {db} from "../../../../../db/drizzle";
import {lua_chon_thu_thach, thu_thach} from "../../../../../db/schema";
import { eq } from "drizzle-orm";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
    try{
        const { id } = await context.params;
        const challengeId = Number(id);

        if (Number.isNaN(challengeId)) {
            return NextResponse.json({ error: "id khong hop le" }, { status: 400 });
        }

        const challenge = await db.query.thu_thach.findFirst({
            where: eq(thu_thach.ma_thu_thach, challengeId),
            with: {lua_chon_thu_thach: true},
        });

        if (!challenge) {
            return NextResponse.json({ error: "Khong tim thay thu thach" }, { status: 404 });
        }
        return NextResponse.json({ challenge });
    }catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Loi khi lay chi tiết thu thach" }, { status: 500 });
    }
}
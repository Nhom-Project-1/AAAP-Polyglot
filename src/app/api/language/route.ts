import { NextResponse } from "next/server"
import db from "../../../../db/drizzle"
import { ngon_ngu } from "../../../../db/schema"

export async function GET() {
  try {
    const data = await db.select().from(ngon_ngu)
    return NextResponse.json(data)
  } catch (error) {
    console.error("lỗi khi lấy dữ liệu ngôn ngữ:", error)
    return NextResponse.json(
      { message: "không thể lấy dữ liệu ngôn ngữ" },
      { status: 500 }
    )
  }
}
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "AAAP Polyglot Backend API đang chạy thành công!",
    status: "OK",
    timestamp: new Date().toISOString(),
    endpoints: {
      home: "GET /api",
      health: "GET /api/health",
      signupTest: "GET /api/signup/test",
      register: "POST /api/signup",
    },
  });
}

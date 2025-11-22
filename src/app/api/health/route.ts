import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    endpoints: {
      health: "GET /api/health",
      signup: "POST /api/signup",
      login: "POST /api/login"
    }
  });
}

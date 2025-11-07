/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

// 🟢 Danh sách route public (không cần đăng nhập)
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/api/signup",
  "/api/login",
];

// 🟠 Danh sách route cần bảo vệ
const PROTECTED_ROUTES = [
  "/account",
  "/course",
  "/api/update",
];

const ADMIN_ROUTES = [
  "/admin",
  "/api/admin",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ Cho phép các route public truy cập
  if (PUBLIC_ROUTES.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 🔐 Kiểm tra JWT trong cookie
  const token = req.cookies.get("token")?.value;

  if (!token) {
    // Nếu không có token → redirect về /login
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect_url", req.nextUrl.toString());
    return NextResponse.redirect(loginUrl);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const isAdmin = decoded.role === "admin";

    if (ADMIN_ROUTES.some((path) => pathname.startsWith(path))) {
      if (!isAdmin) {
        const loginUrl = req.nextUrl.clone();
        loginUrl.pathname = "/login";
        loginUrl.searchParams.set("redirect_url", req.nextUrl.toString());
        return NextResponse.redirect(loginUrl);
      }
    }
    // Token hợp lệ → cho phép đi tiếp
    return NextResponse.next();
  } catch (err) {
    console.error("❌ Token không hợp lệ:", err);

    // Token hết hạn hoặc không hợp lệ → xóa cookie + redirect login
    const response =
      pathname.startsWith("/api/")
        ? NextResponse.json({ error: "Token expired or invalid" }, { status: 401 })
        : NextResponse.redirect(new URL("/login", req.url));

    response.cookies.delete("token");
    return response;
  }
}

// ⚙️ Cấu hình matcher để middleware áp dụng cho tất cả route (trừ _next, favicon,...)
export const config = {
  matcher: ["/((?!_next|.*\\..*|favicon.ico).*)"],
};

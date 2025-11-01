import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/signup(.*)",
  "/forgot(.*)",
  "/reset(.*)",
  "/api/public(.*)",
]);

const isProtectedRoute = createRouteMatcher([
  "/account(.*)",
  "/course(.*)",
  "/dashboard(.*)",
  "/api/update(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth(); 
  console.log("🔥 Clerk userId hiện tại:", userId || "Chưa đăng nhập");

  if (isPublicRoute(req)) return NextResponse.next();

  if (isProtectedRoute(req) && !userId) {
    if (req.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect_url", req.nextUrl.toString());
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*|favicon.ico).*)"],
};

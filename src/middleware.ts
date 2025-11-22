export const runtime = 'nodejs';

/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt from 'jsonwebtoken';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET!;

// 🟢 Public routes that do not require authentication
const PUBLIC_ROUTES = ['/', '/login', '/loginAdmin', '/signup', '/api/signup', '/api/login', '/api/admin/login'];

// 🔴 Admin-only routes
const ADMIN_ROUTES = ['/admin', '/api/admin'];

// 🔵 User-only routes that admins should not access
const USER_ONLY_ROUTES = ['/course', '/account', '/api/user-language', '/api/challenge', '/api/update'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow access to public routes
  const isPublic = PUBLIC_ROUTES.some((path) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  });

  if (isPublic) {
    return NextResponse.next();
  }

  // For all other routes, check for a valid token
  const token = req.cookies.get('token')?.value;

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const isAdmin = decoded.role === 'admin';

    const isAdminRoute = ADMIN_ROUTES.some((path) => pathname.startsWith(path));
    const isUserOnlyRoute = USER_ONLY_ROUTES.some((path) => pathname.startsWith(path));

    if (isAdmin) {
      if (isUserOnlyRoute) {
        // Admin trying to access a user-only route
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Forbidden for admin role' }, { status: 403 });
        }
        return NextResponse.redirect(new URL('/admin', req.url));
      }
    } else { // Regular user
      if (isAdminRoute) {
        // User trying to access an admin route
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }

    // If we reach here, access is granted
    return NextResponse.next();
  } catch (err) {
    console.error('❌ Invalid Token:', err);

    // If the token is invalid, delete the cookie and redirect to login
    const response =
      pathname.startsWith('/api/')
        ? NextResponse.json(
            { error: 'Token expired or invalid' },
            { status: 401 },
          )
        : NextResponse.redirect(new URL('/login', req.url));

    response.cookies.delete('token');
    return response;
  }
}

// Match all routes except for static assets and Next.js internals
export const config = {
  matcher: ['/((?!_next|.*\\..*|favicon.ico).*)'],
};

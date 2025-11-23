import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

export async function isAdmin() {
  // Đọc token từ cookie thay vì Authorization header
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return false;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    // Kiểm tra xem người dùng có vai trò 'admin' trong token hay không
    return decoded.role === "admin";
  } catch {
    return false;
  }
}

export async function assertAdmin() {
  const ok = await isAdmin(); 
  if (!ok) {
    const err = new Error("Unauthorized") as Error & { status?: number };
    err.status = 401;
    throw err;
  }
}

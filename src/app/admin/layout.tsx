import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import jwt from 'jsonwebtoken'
import type { ReactNode } from 'react'

const JWT_SECRET = process.env.JWT_SECRET || "default_secret"

interface TokenPayload {
  ma_nguoi_dung: number
  username: string
  email: string
  role: string
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // ❗ thêm await
  const cookieStore = await cookies()
  
  const token = cookieStore.get('token')?.value
  if (!token) redirect('/loginAdmin')

  let decoded: TokenPayload
  try {
    decoded = jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch {
    redirect('/loginAdmin')
  }

  if (decoded.role !== 'admin') redirect('/loginAdmin')

  return <>{children}</>
}
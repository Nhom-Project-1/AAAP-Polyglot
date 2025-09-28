'use client'
import  Layout  from '@/components/layout'
import { useRouter } from 'next/navigation'

export default function CoursePage() {
  const router = useRouter()
  return (
    <div>
      <Layout>
      <main className="p-6">
        <h2>Trang học tập</h2>
        <p>Nội dung khóa học...</p>
      </main>
      </Layout>
    </div>
  )
}

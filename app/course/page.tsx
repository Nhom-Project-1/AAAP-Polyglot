'use client'
import Layout from '@/components/layout'
import { useRouter } from 'next/navigation'
import UserFlag from '@/components/user-flag'
import UserScore from '@/components/user-score'
import UserStrike from '@/components/user-strike'

export default function CoursePage() {
  const router = useRouter()
  return (
    <div>
      <Layout>
        <main className="p-6 relative">
          <div className="absolute top-6 right-6 flex items-center gap-4">
            <button
              className="cursor-pointer transition-transform transform hover:scale-105"
              onClick={() => router.push('/course/choose')}
            >
              <UserFlag />
            </button>
          </div>

          <h2>Trang học tập</h2>
          <p>Nội dung khóa học...</p>
        </main>
      </Layout>
    </div>
  )
}

'use client'

import Layout from '@/components/layout'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from "react"
import UserProgress from '@/components/user-progress'
import UnitLesson from '@/components/unit-lesson'

export default function CoursePage() {
   const router = useRouter()
  const searchParams = useSearchParams()
  const languageId = searchParams.get("lang")

  // nếu chưa chọn ngôn ngữ thì quay lại
  useEffect(() => {
    if (!languageId) {
      router.push("/course/choose")
    }
  }, [languageId, router])

  return (
    <Layout>
      <main className="relative p-6 min-h-screen">
        <div className="absolute top-4 right-6">
          <UserProgress />
        </div>
        <h2 className="text-2xl font-semibold mb-4">{languageId && <UnitLesson languageId={languageId} />}
        </h2>       
      </main>
    </Layout>
  )
}

"use client"

import Layout from "@/components/layout"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import UserProgress from "@/components/user-progress"
import UnitLesson from "@/components/unit-lesson"
import Loading from "@/components/loading"

export default function CoursePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const languageId = searchParams.get("lang") 
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!languageId) {
      router.push("/course/choose")
      return
    }
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [languageId, router])

  if (loading) return <Loading />

  return (
    <Layout>
      <main className="relative p-6 min-h-screen">
        <div className="absolute top-4 right-6">
          <UserProgress />
        </div>

        <h2 className="text-2xl font-semibold mb-4">
          {languageId && <UnitLesson/>}
        </h2>
      </main>
    </Layout>
  )
}
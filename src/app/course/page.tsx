"use client"

import { Suspense } from "react"
import Layout from "@/components/layout"
import UserProgress from "@/components/user-progress"
import UnitLesson from "@/components/unit-lesson"
import Loading from "@/components/loading"

function CoursePageContent() {
  return (
    <>
      <div className="absolute top-4 right-6">
        <UserProgress />
      </div>
      <h2 className="text-2xl font-semibold mb-4">
        <UnitLesson />
      </h2>
    </>
  )
}

export default function CoursePage() {
  return (
    <Layout>
      <main className="relative p-6 min-h-screen">
        <Suspense fallback={<Loading />}>
          <CoursePageContent />
        </Suspense>
      </main>
    </Layout>
  )
}
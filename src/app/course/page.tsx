"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Layout from "@/components/layout";
import UserProgress from "@/components/user-progress";
import UnitLesson from "@/src/app/course/unit-lesson";
import Loading from "@/components/ui/loading";

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
  );
}

export default function CoursePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lang = searchParams.get("lang"); 

  useEffect(() => {
    if (!lang) {
      router.push("/course/choose");
    }
  }, [lang, router]);

  if (!lang) {
    return (
      <Layout>
        <main className="relative p-6 min-h-screen flex items-center justify-center">
          <p className="text-pink-400 font-medium">Đang chuyển hướng...</p>
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="relative p-6 min-h-screen">
        <Suspense fallback={<Loading />}>
          <CoursePageContent />
        </Suspense>
      </main>
    </Layout>
  );
}
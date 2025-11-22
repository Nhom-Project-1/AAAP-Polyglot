'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This component is a temporary fix to resolve a build error.
// It redirects from the old, redundant dashboard page to the new main admin page.
export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin');
  }, [router]);

  // Render a null or a loading component while redirecting
  return null;
}
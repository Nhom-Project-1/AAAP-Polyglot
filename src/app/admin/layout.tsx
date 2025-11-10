'use client';

import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, isLoggedIn } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Nếu chưa đăng nhập hoặc không phải admin, điều hướng về trang đăng nhập admin
    if (!isLoggedIn || !isAdmin) {
      router.push('/loginAdmin');
    }
  }, [isLoggedIn, isAdmin, router]);

  // Trong lúc chờ kiểm tra hoặc nếu không phải admin, hiển thị thông báo
  if (!isLoggedIn || !isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-pink-500 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6">
            You do not have permission to view this page.
          </p>
          <Button onClick={() => router.push('/loginAdmin')}>
            Go to Admin Login
          </Button>
        </div>
      </div>
    );
  }

  // Nếu là admin, hiển thị nội dung trang admin
  return <>{children}</>;
}
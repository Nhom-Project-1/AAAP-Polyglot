"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const Header = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginClick = async () => {
    setIsLoading(true);
    try {
      // Hỏi server xem người dùng đã đăng nhập chưa
      const authRes = await fetch("/api/user", { credentials: "include" });

      if (authRes.ok) {
        // Nếu đã đăng nhập (API trả về 200 OK), lấy ngôn ngữ và điều hướng
        const langRes = await fetch("/api/user-language", { credentials: "include" });
        const langData = await langRes.json();
        if (langData.current) {
          router.push(`/course?lang=${langData.current.id}`);
        } else {
          router.push("/course/choose");
        }
      } else {
        // Nếu chưa đăng nhập (API trả về lỗi 401, etc.), điều hướng đến trang login
        router.push("/login");
      }
    } catch (error) {
      // Nếu có lỗi mạng, vẫn điều hướng đến trang login để xử lý
      console.error("Lỗi khi kiểm tra trạng thái đăng nhập:", error);
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="w-full border-b-2 border-slate-200 px-6">
      <div className="flex items-center justify-between py-4">
        {/* Logo + menu */}
        <div className="flex items-center gap-x-6">
          <div className="flex items-center gap-x-2 select-none cursor-default">
            <Image src="/logo.png" alt="Logo" width={32} height={32} />
            <span className="text-pink-300 font-bold text-4xl">
              AAAP Polyglot
            </span>
          </div>
        </div>

        {/* Đăng nhập, Đăng ký */}
        <div className="flex items-center gap-x-3">
          <Button
            variant="secondaryOutline"
            className="px-6 py-3 text-lg cursor-pointer"
            onClick={handleLoginClick}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-1">
                <span className="sr-only">Đang tải...</span>
                <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="h-2 w-2 bg-current rounded-full animate-bounce"></div>
              </div>
            ) : "Đăng nhập"}
          </Button>
          <Button
            variant="secondary"
            className="px-6 py-3 text-lg cursor-pointer"
            onClick={() => router.push('/signup')}
          >
            Đăng ký
          </Button>
        </div>
      </div>
    </header>
  );
};

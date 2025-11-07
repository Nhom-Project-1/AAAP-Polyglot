"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export const Header = () => {
  const router = useRouter();
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
            onClick={() => router.push('/login')}
          >
            Đăng nhập
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

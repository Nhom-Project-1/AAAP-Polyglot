"use client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export const Header = () => {
  const router = useRouter();
  return (
    <header className="w-full border-b-2 border-slate-200 px-6">
      <div className="flex items-center justify-between py-4">
        {/* Logo + menu */}
        <div className="flex items-center gap-x-6">
          <Link href="/" className="flex items-center gap-x-2 cursor-pointer">
            <Image src="/logo.png" alt="Logo" width={32} height={32} />
            <span className="text-pink-300 font-bold text-4xl hover:text-pink-500 transition-colors">
              AAAP Polyglot
            </span>
          </Link>

          <Link
            href="/course"
            className="text-2xl font-medium text-pink-300 border-b-2 border-pink-300 pb-1 hover:text-pink-500 transition-colors cursor-pointer"
          >
            Học tập
          </Link>
        </div>

        {/* Đăng nhập, Đăng ký */}
        <div className="flex items-center gap-x-3">
          <Button
            variant="secondaryOutline"
            className="px-6 py-3 text-lg"
            onClick={() => router.push("/login")}
          >
            Đăng nhập
          </Button>
          <Button
            variant="secondary"
            className="px-6 py-3 text-lg"
            onClick={() => router.push("/signup")}
          >
            Đăng ký
          </Button>
        </div>
      </div>
    </header>
  );
};

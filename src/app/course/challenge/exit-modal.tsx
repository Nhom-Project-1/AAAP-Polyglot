"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ExitModalProps {
  show: boolean;
  onClose: () => void;
  maBaiHoc: number;
}

export default function ExitModal({ show, onClose, maBaiHoc }: ExitModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  if (!show) return null;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await fetch("/api/challenge/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", "credentials": "include" },
        body: JSON.stringify({ ma_bai_hoc: maBaiHoc, isExiting: true }),
      });
      const res = await fetch("/api/user-language", {
        method: "GET",
        credentials: "include",
      })
      const data = await res.json()

      if (res.ok && data.current?.id) {
        router.push(`/course?lang=${data.current.id}`)
      } else {
        router.push("/login")
      }
    } catch (err) {
      console.error("Lỗi khi lấy ngôn ngữ active:", err)
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-50">
      <div className="bg-white p-10 rounded-xl shadow-xl w-96">
        <p className="mb-6 text-center text-lg font-medium">
          Bạn chắc chắn muốn thoát? Mọi tiến độ chưa lưu sẽ bị mất.
        </p>
        <div className="flex justify-between">
          <Button variant="default" className="px-6 py-3 text-lg rounded-lg cursor-pointer" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="secondary" onClick={handleConfirm} className="px-6 py-3 text-lg rounded-lg cursor-pointer" disabled={loading}>
            Chắc chắn
          </Button>
        </div>
      </div>
    </div>
  );
}
"use client";
import { Button } from "@/components/ui/button";

interface ExitModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ExitModal({ show, onClose, onConfirm }: ExitModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-50">
      <div className="bg-white p-10 rounded-xl shadow-xl w-96">
        <p className="mb-6 text-center text-lg font-medium">
          Bạn chắc chắn muốn thoát?
        </p>
        <div className="flex justify-between">
          <Button variant="default" className="px-6 py-3 text-lg rounded-lg cursor-pointer" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="secondary" className="px-6 py-3 text-lg rounded-lg cursor-pointer" onClick={onConfirm}>
            Chắc chắn
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";
import { Button } from "@/components/ui/button";

interface FooterProps {
  onCheck: () => void;
}

export default function Footer({ onCheck }: FooterProps) {
  return (
    <footer className="flex justify-end px-6 py-7 border-t border-gray-200">
      <Button
        variant="secondary"
        className="px-6 py-4 text-lg rounded-lg ml-auto mr-50 cursor-pointer"
        onClick={onCheck}
      >
        Kiểm tra
      </Button>
    </footer>
  );
}

"use client";
import { Button } from "@/components/ui/button";

interface FooterProps {
  onCheck: () => void;
  onContinue: () => void;
  result: boolean | null;
  checked: boolean;
  hasSelected: boolean; 
}

export default function Footer({ onCheck, onContinue, result, checked, hasSelected }: FooterProps) {
  let footerColor = "bg-white";
  let continueButtonColor = "";
  let message = "";
  let messageColor = "";

  if (result === true){
    footerColor = "bg-green-100";
    continueButtonColor = "bg-green-500 hover:bg-green-600 text-white";
    message = "Chính xác rồi!";
    messageColor = "text-green-700 font-semibold";
  } 
  else if (result === false) {
    footerColor = "bg-red-100";
    continueButtonColor = "bg-red-500 hover:bg-red-600 text-white";
    message = "Sai mất rồi!";
    messageColor = "text-red-700 font-semibold";
  }
  return (
    <footer
      className={`flex justify-end px-6 py-7 border-t border-gray-200 transition-colors duration-300 ${footerColor}`}
    >
      {checked && (
        <p className={`absolute left-20 bottom-10 text-lg ${messageColor} transition-all duration-300`}>
          {message}
        </p>
      )}
      {!checked ? (
        <Button
          aria-disabled={!hasSelected}
          onClick={hasSelected ? onCheck : undefined}
          className={`px-8 py-6 text-lg rounded-lg mr-60 border-0 bg-pink-500 text-white transition-all duration-200
            ${hasSelected ? "hover:bg-pink-600 cursor-pointer" : "cursor-default pointer-events-none"}`}
        >
          Kiểm tra
        </Button>
      ) : (
        <Button
          className={`px-8 py-6 text-lg rounded-lg mr-60 cursor-pointer transition-all duration-200 border-0 ${continueButtonColor}`}
          onClick={onContinue}
        >
          Tiếp tục
        </Button>
      )}
    </footer>
  );
}

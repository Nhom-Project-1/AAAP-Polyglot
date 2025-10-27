"use client";
import { useState } from "react";

interface QuizProps {
  onAnswer: (isCorrect: boolean) => void;
}

export default function Quiz({ onAnswer }: QuizProps) {
  const [selected, setSelected] = useState<number | null>(null);

  const handleSelect = (choice: number) => {
    setSelected(choice);
    // giả lập logic đúng/sai
    const isCorrect = choice === 1; 
    onAnswer(isCorrect);
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center text-xl font-medium gap-4">
      <p>Câu hỏi mẫu: 1+1 = ?</p>
      <div className="flex gap-4">
        {[1, 2, 3, 4].map((choice) => (
          <button
            key={choice}
            onClick={() => handleSelect(choice)}
            className={`px-4 py-2 rounded ${
              selected === choice ? "bg-pink-400 text-white" : "bg-gray-200"
            }`}
          >
            {choice}
          </button>
        ))}
      </div>
    </main>
  );
}
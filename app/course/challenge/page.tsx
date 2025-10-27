"use client";

import { useRouter } from "next/navigation";
import ChallengeLayout from "./challenge-layout";

export default function ChallengePage() {
  const router = useRouter();

  const handleExit = () => {
    router.back(); 
  };

  return (
    <ChallengeLayout onExit={handleExit} />
  );
}

'use client'
export default function UserStrike() {
  const score = 36

  return (
    <div className="flex items-center gap-2 p-3">
      <img src="/fire.png" alt="Score" className="w-6 h-5 bject-contain" /> 
      <span className="relative translate-y-0.5 text-lg font-semibold text-orange-300 leading-none">
        {score}
      </span>
    </div>
  )
}
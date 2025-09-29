'use client'
export default function UserScore() {
  const score = 36

  return (
    <div className="flex items-center gap-2 p-3">
      <img src="/star.png" alt="Score" className="w-6 h-7 object-contain" /> 
      <span className="relative -translate-y-0.5 text-lg font-semibold text-yellow-400 leading-none">
        {score}
      </span>
    </div>
  )
}
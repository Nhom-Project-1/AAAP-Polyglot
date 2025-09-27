"use client"

import React from "react"

export default function LoadingTulip() {
  return (
    <div className="relative flex items-center justify-center h-screen bg-gradient-to-br from-green-100 via-pink-100 to-blue-100 overflow-hidden">
      {/* Chữ Loading */}
      <h1 className="text-4xl font-bold text-pink-600 z-10 animate-pulse">
        Loading...
      </h1>

      {/* Tulip animation */}
      <div className="absolute bottom-0 flex space-x-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="w-10 h-24 origin-bottom animate-tulip"
            style={{ animationDelay: `${i * 0.2}s` }}
          >
            <img src="/logo.png" alt="Tulip" className="w-full h-full object-contain"/>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes tulip-sway {
            0%   { transform: rotate(0deg); }
            20%  { transform: rotate(3deg); }
            40%  { transform: rotate(5deg); }
            60%  { transform: rotate(-3deg); }
            80%  { transform: rotate(-5deg); }
            100% { transform: rotate(0deg); }
        }

        .animate-tulip {
          animation: tulip-sway 2s ease-in-out infinite;
          transform-origin: bottom center;
        }
      `}</style>
    </div>
  )
}
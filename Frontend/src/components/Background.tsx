"use client"

import { useEffect, useState } from "react"

// Function to generate random star positions
function generateStars(count: number): string {
  const shadows = []
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * 2000)
    const y = Math.floor(Math.random() * 2000)
    shadows.push(`${x}px ${y}px #FFF`)
  }
  return shadows.join(", ")
}

const StarryBackground = () => {
  // Generate star shadows only once on client-side
  const [shadows, setShadows] = useState({
    small: "",
    medium: "",
    big: "",
  })

  useEffect(() => {
    setShadows({
      small: generateStars(700),
      medium: generateStars(200),
      big: generateStars(100),
    })
  }, [])

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%)",
      }}
    >
      <style>{`
        @keyframes animStar {
          from {
            transform: translateY(0px);
          }
          to {
            transform: translateY(-2000px);
          }
        }
      `}</style>

      {/* Small stars */}
      <div
        style={{
          width: "1px",
          height: "1px",
          background: "transparent",
          boxShadow: shadows.small,
          animation: "animStar 50s linear infinite",
          position: "absolute",
        }}
      >
        <div
          style={{
            content: '" "',
            position: "absolute",
            top: "2000px",
            width: "1px",
            height: "1px",
            background: "transparent",
            boxShadow: shadows.small,
          }}
        />
      </div>

      {/* Medium stars */}
      <div
        style={{
          width: "2px",
          height: "2px",
          background: "transparent",
          boxShadow: shadows.medium,
          animation: "animStar 100s linear infinite",
          position: "absolute",
        }}
      >
        <div
          style={{
            content: '" "',
            position: "absolute",
            top: "2000px",
            width: "2px",
            height: "2px",
            background: "transparent",
            boxShadow: shadows.medium,
          }}
        />
      </div>

      {/* Big stars */}
      <div
        style={{
          width: "3px",
          height: "3px",
          background: "transparent",
          boxShadow: shadows.big,
          animation: "animStar 150s linear infinite",
          position: "absolute",
        }}
      >
        <div
          style={{
            content: '" "',
            position: "absolute",
            top: "2000px",
            width: "3px",
            height: "3px",
            background: "transparent",
            boxShadow: shadows.big,
          }}
        />
      </div>
    </div>
  )
}

export default StarryBackground;
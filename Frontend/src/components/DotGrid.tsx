
import { useEffect, useRef } from "react"

interface DotGridProps {
  mousePosition: { x: number; y: number }
  dotColor?: string
  dotSpacing?: number
  interactionRadius?: number
}

export const DotGrid = ({
  mousePosition,
  dotColor = "rgba(255, 255, 255, 0.12)",
  dotSpacing = 15,
  interactionRadius = 200,
}: DotGridProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const dots: {
      x: number
      y: number
      size: number
      originalSize: number
      originalX: number
      originalY: number
      vx: number
      vy: number
    }[] = []
    const spacing = dotSpacing // Reduced from 25 to 15 for much higher density
    const rows = Math.ceil(window.innerHeight / spacing) + 10 // Increased buffer
    const cols = Math.ceil(window.innerWidth / spacing) + 10 // Increased buffer

    // Create dots with offset for seamless coverage
    const startX = -spacing * 5
    const startY = -spacing * 5

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        dots.push({
          x: startX + j * spacing,
          y: startY + i * spacing,
          size: 0.8, // Smaller dots for cleaner look with higher density
          originalSize: 0.8,
          originalX: startX + j * spacing,
          originalY: startY + i * spacing,
          vx: 0, // Velocity for more fluid animation
          vy: 0,
        })
      }
    }

    let lastMousePosition = { ...mousePosition }
    let mouseVelocity = { x: 0, y: 0 }

    // Track mouse velocity
    const updateMouseVelocity = () => {
      mouseVelocity = {
        x: mousePosition.x - lastMousePosition.x,
        y: mousePosition.y - lastMousePosition.y,
      }
      lastMousePosition = { ...mousePosition }
      requestAnimationFrame(updateMouseVelocity)
    }
    updateMouseVelocity()

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = dotColor // Slightly reduced opacity for cleaner look with more dots

      dots.forEach((dot) => {
        const distance = Math.sqrt(
          Math.pow(dot.originalX - mousePosition.x, 2) + Math.pow(dot.originalY - mousePosition.y, 2),
        )

        const maxDistance = interactionRadius // Increased from 150 for wider effect area

        if (distance < maxDistance) {
          // Direction vector from mouse to dot
          const dirX = dot.originalX - mousePosition.x
          const dirY = dot.originalY - mousePosition.y

          // Normalize
          const length = Math.sqrt(dirX * dirX + dirY * dirY)
          const normX = dirX / length
          const normY = dirY / length

          // Calculate force based on distance and mouse velocity
          const force = ((maxDistance - distance) / maxDistance) * 40 // Increased from 30
          const velocityInfluence =
            Math.sqrt(mouseVelocity.x * mouseVelocity.x + mouseVelocity.y * mouseVelocity.y) * 0.2

          // Target position with added velocity influence
          const targetX = dot.originalX + normX * (force + velocityInfluence)
          const targetY = dot.originalY + normY * (force + velocityInfluence)

          // Apply spring physics for more natural movement
          const spring = 0.08 // Spring constant (higher = faster return)
          const friction = 0.8 // Friction (lower = more damping)

          // Calculate acceleration
          const ax = (targetX - dot.x) * spring
          const ay = (targetY - dot.y) * spring

          // Update velocity with acceleration and friction
          dot.vx = dot.vx * friction + ax
          dot.vy = dot.vy * friction + ay

          // Update position
          dot.x += dot.vx
          dot.y += dot.vy

          // Size based on distance and velocity
          const velocityMagnitude = Math.sqrt(dot.vx * dot.vx + dot.vy * dot.vy)
          const sizeBoost = Math.min(velocityMagnitude * 0.2, 1.5)
          dot.size = dot.originalSize * (1 + (maxDistance - distance) / maxDistance + sizeBoost)
        } else {
          // Return to original position with spring physics
          const spring = 0.05
          const friction = 0.8

          const ax = (dot.originalX - dot.x) * spring
          const ay = (dot.originalY - dot.y) * spring

          dot.vx = dot.vx * friction + ax
          dot.vy = dot.vy * friction + ay

          dot.x += dot.vx
          dot.y += dot.vy

          // Gradually return to original size
          dot.size += (dot.originalSize - dot.size) * 0.1
        }

        ctx.beginPath()
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2)
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => window.removeEventListener("resize", resizeCanvas)
  }, [mousePosition, dotColor, dotSpacing, interactionRadius])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        background: "linear-gradient(to bottom, #0f1116, #1a1f2c)",
        filter: "drop-shadow(0 0 10px rgba(139, 92, 246, 0.05))",
      }}
    />
  )
}


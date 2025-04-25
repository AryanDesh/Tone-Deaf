import type React from "react"
import { User } from "lucide-react"

interface CustomAvatarProps {
  name: string
  image?: string
  size?: "sm" | "md" | "lg"
}

export const CustomAvatar: React.FC<CustomAvatarProps> = ({ name, image, size = "md" }) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const getRandomColor = (name: string) => {
    const colors = [
      "bg-gradient-to-br from-purple-500 to-indigo-600",
      "bg-gradient-to-br from-pink-500 to-purple-600",
      "bg-gradient-to-br from-blue-500 to-indigo-600",
      "bg-gradient-to-br from-indigo-500 to-purple-600",
      "bg-gradient-to-br from-violet-500 to-purple-600",
    ]

    // Use the name to deterministically select a color
    const index = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
    return colors[index]
  }

  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-medium ${
        image ? "" : getRandomColor(name)
      } shadow-md`}
    >
      {image ? (
        <img src={image || "/placeholder.svg"} alt={name} className="h-full w-full object-cover rounded-full" />
      ) : name === "You" ? (
        <User className="h-5 w-5" />
      ) : (
        getInitials(name)
      )}
    </div>
  )
}

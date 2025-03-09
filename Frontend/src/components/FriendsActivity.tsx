import type React from "react"
import type { Friend } from "../utils/types"

interface FriendsActivityProps {
  friends: Friend[]
}

const FriendsActivity: React.FC<FriendsActivityProps> = ({ friends }) => {
  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Friends Activity</h2>
      <div className="space-y-4">
        {friends.map((friend) => (
          <div key={friend.id} className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={friend.avatar || "/placeholder.svg"}
                alt={friend.name}
                width={40}
                height={40}
                className="rounded-full"
              />
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${
                  friend.online ? "bg-green-500" : "bg-gray-500"
                }`}
              ></span>
            </div>
            <div>
              <h3 className="font-medium">{friend.name}</h3>
              {friend.currentlyPlaying && (
                <p className="text-sm text-gray-400">
                  Listening to {friend.currentlyPlaying.song} by {friend.currentlyPlaying.artist}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FriendsActivity


import type React from "react"
import type { Friend } from "../types/songTypes"

interface FriendsActivityProps {
  friends: Friend[]
}

const FriendsActivity: React.FC<FriendsActivityProps> = ({ friends }) => {
  return (
    <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg p-6 w-full">
      <h2 className="text-2xl font-bold mb-4">Friends Activity</h2>
      <div className="space-y-4">
        {friends.map((friend) => (
          <div key={friend.id} className="flex items-center space-x-4">
            <div className="flex justify-start items-center">
            <span
                className={` w-3 h-3 rounded-full border-2 border-gray-800 ${
                  friend.online ? "bg-green-500" : "bg-gray-500"
                }`}
              ></span>
              <span className="ml-5">
                
              <img
                src={friend.avatar || "/placeholder.svg?height=40&width=40"}
                alt={friend.name}
                width={40}
                height={40}
                className="rounded-full"
                />
            
                </span>
              <span>
              <h3 className="font-medium">{friend.name}</h3>
              {friend.currentlyPlaying && (
                  <p className="text-sm text-gray-400">
                    Listening to {friend.currentlyPlaying.song} by {friend.currentlyPlaying.artist}
                  </p>
              )}
              </span>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  )
}

export default FriendsActivity


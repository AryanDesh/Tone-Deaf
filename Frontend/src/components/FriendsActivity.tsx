import type React from "react";
import type { Friend } from "../types/songTypes";
import { Music } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

interface FriendsActivityProps {
  friends?: Friend[];
}

const FriendsActivity: React.FC<FriendsActivityProps> = ({ friends: propFriends }) => {
  const [friends, setFriends] = useState<Friend[]>(propFriends || []);
  const [loading, setLoading] = useState<boolean>(!propFriends);

  const getFriends = async () => {
    // Only fetch if not provided via props
    if (!propFriends) {
      try {
        setLoading(true);
        const { data } = await axios.get<{ friends: Friend[] }>(
          "http://localhost:5000/api/friends/",
          { withCredentials: true }
        );
        setFriends(data.friends);
      } catch (error) {
        console.error("Error fetching friends for activity:", error);
        setFriends([]);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (propFriends) {
      setFriends(propFriends);
    } else {
      getFriends();
    }
  }, [propFriends]);

  // Update friends when propFriends changes
  useEffect(() => {
    if (propFriends) {
      setFriends(propFriends);
    }
  }, [propFriends]);

  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Friends Activity</h2>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent"></div>
        </div>
      ) : friends.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>No friend activity to show</p>
          <p className="text-sm mt-2">Connect with friends to see what they're listening to</p>
        </div>
      ) : (
        <div className="space-y-4">
          {friends.map((friend) => (
            <div key={friend.id} className="flex items-center space-x-4">
              <div className="flex justify-start items-center">
                <span
                  className={`w-3 h-3 rounded-full border-2 border-gray-800 ${
                    friend.online ? "bg-green-500" : "bg-gray-500"
                  }`}
                ></span>
                <span className="ml-5">
                  <img
                    src={friend.avatar || "/placeholder.svg?height=40&width=40"}
                    alt={friend.username}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                </span>
                <span className="ml-3">
                  <h3 className="font-medium">{friend.username}</h3>
                  {friend.currentlyPlaying ? (
                    <p className="text-sm text-gray-400 flex items-center">
                      <Music size={14} className="mr-1" />
                      Listening to {friend.currentlyPlaying.song} by {friend.currentlyPlaying.artist}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">
                      {friend.online ? "Online" : "Offline"}
                    </p>
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendsActivity;
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { MessageSquare, Music, UserPlus } from "lucide-react";
import { mockFriends, mockFriendSuggestions } from "../utils/mockData";
import { Friend } from "../types/songTypes";
import axios from "axios";

const FriendsPage: React.FC = () => {
  const pageRef = useRef<HTMLDivElement>(null);
  const friendsListRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendSuggestions, setFriendSuggestions] = useState<Friend[]>([]);

  const getFriends = async () => {
    try {
      const { data } = await axios.get<{ friends: Friend[] }>(
        "http://localhost:5000/api/friends/",
        { withCredentials: true }
      );
      setFriends(data.friends);
    } catch (error) {
      setFriends(mockFriends);
    }
  };

  const getFriendSuggestions = async () => {
    try {
      const { data } = await axios.get<{ suggestedFriends: Friend[] }>(
        "http://localhost:5000/api/friends/suggested",
        { withCredentials: true }
      );
      setFriendSuggestions(data.suggestedFriends);
    } catch (error) {
      setFriendSuggestions(mockFriendSuggestions);
    }
  };

  useEffect(() => {
    getFriends();
    getFriendSuggestions();
    const ctx = gsap.context(() => {
      gsap.from(pageRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: "power3.out",
      });

      gsap.from(friendsListRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.2,
        ease: "power3.out",
      });

      gsap.from(suggestionsRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.4,
        ease: "power3.out",
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div ref={pageRef} className="w-full">
        <h1 className="text-3xl font-bold mb-6">Friends</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2" ref={friendsListRef}>
            <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Your Friends</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <img
                          src={friend.avatar || "/placeholder.svg?height=60&width=60"}
                          alt={friend.username}
                          width={60}
                          height={60}
                          className="rounded-full"
                        />
                        <span
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-700 ${
                            friend.online ? "bg-green-500" : "bg-gray-500"
                          }`}
                        ></span>
                      </div>

                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{friend.username}</h3>
                        {friend.currentlyPlaying ? (
                          <p className="text-sm text-gray-300 flex items-center">
                            <Music size={14} className="mr-1" />
                            Listening to {friend.currentlyPlaying.song}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-400">
                            {friend.online ? "Online" : "Offline"}
                          </p>
                        )}
                      </div>

                      <button className="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700">
                        <MessageSquare size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div ref={suggestionsRef}>
            <h2 className="text-xl font-bold mb-4">Friend Suggestions</h2>

            <div className="space-y-4">
              {friendSuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={suggestion.avatar || "/placeholder.svg"}
                      alt={suggestion.username}
                      width={50}
                      height={50}
                      className="rounded-full"
                    />
                    <div>
                      <h3 className="font-medium">{suggestion.username}</h3>
                      <p className="text-xs text-gray-400">
                        {suggestion.mutualFriends} mutual friends
                      </p>
                    </div>
                  </div>

                  <button className="text-purple-400 hover:text-purple-300 flex items-center">
                    <UserPlus size={16} className="mr-1" /> Add
                  </button>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 text-center text-purple-400 hover:text-purple-300 text-sm">
              View More Suggestions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendsPage;

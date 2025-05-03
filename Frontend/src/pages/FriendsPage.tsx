import type React from "react";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { MessageSquare, Music, UserPlus, Check, X, Clock } from "lucide-react";
import { useFriendsContext } from "../context";
import socket from "../utils/socket";

const FriendsPage: React.FC = () => {
  const pageRef = useRef<HTMLDivElement>(null);
  const friendsListRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const pendingRequestsRef = useRef<HTMLDivElement>(null);
  // Track online status of friends with a state object
  const [onlineStatus, setOnlineStatus] = useState<Record<string, boolean>>({});
  
  const {
    friends,
    friendSuggestions,
    pendingRequests,
    sentRequests,
    loading,
    error,
    setError,
    refreshFriends,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    sendFriendRequest,
    removeFriend
  } = useFriendsContext();

  // Socket connection and presence monitoring
  useEffect(() => {
    // Connect to socket if not already connected
    if (!socket.connected) {
      socket.connect();
    }

    // Initial setup of online status from friend data
    const initialOnlineStatus: Record<string, boolean> = {};
    friends.forEach(friend => {
      initialOnlineStatus[friend.id] = friend.online || false;
    });
    setOnlineStatus(initialOnlineStatus);

    // Listen for presence events
    socket.on('user:presence', (data: { userId: string, status: 'online' | 'offline' }) => {
      console.log('Received presence update:', data);
      setOnlineStatus(prev => ({
        ...prev,
        [data.userId]: data.status === 'online'
      }));
    });

    // Add handler for presence response
    socket.on('presence:update', (data: { userIds: string[], status: 'online' | 'offline' }[]) => {
      console.log('Received presence batch update:', data);
      setOnlineStatus(prev => {
        const newStatus = {...prev};
        data.forEach(item => {
          item.userIds.forEach(userId => {
            newStatus[userId] = item.status === 'online';
          });
        });
        return newStatus;
      });
    });

    // Request initial presence data
    if (friends.length > 0) {
      console.log('Requesting presence data for:', friends.map(friend => friend.id));
      socket.emit('get:presence', { userIds: friends.map(friend => friend.id) });
    }

    // Clean up socket listeners
    return () => {
      socket.off('user:presence');
      socket.off('presence:update');
    };
  }, [friends]);

  // Set up a regular interval to refresh presence data
  useEffect(() => {
    const presenceInterval = setInterval(() => {
      if (friends.length > 0) {
        socket.emit('get:presence', { userIds: friends.map(friend => friend.id) });
      }
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(presenceInterval);
  }, [friends]);

  useEffect(() => {
    // Refresh data when component mounts
    refreshFriends();
    
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
      gsap.from(pendingRequestsRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.3,
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
  }, [refreshFriends]);

  // Helper function to get current online status
  const isUserOnline = (userId: string) => {
    return onlineStatus[userId] || false;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div ref={pageRef} className="w-full">
        <h1 className="text-3xl font-bold mb-6">Friends</h1>
        
        {error && (
          <div className="bg-red-500/30 border border-red-600 text-white p-3 rounded-lg mb-6">
            {error}
            <button 
              onClick={() => setError(null)} 
              className="float-right text-white"
            >
              <X size={16} />
            </button>
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent"></div>
            <p className="mt-2 text-gray-300">Loading...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Pending Friend Requests Section */}
              {pendingRequests.length > 0 && (
                <div ref={pendingRequestsRef} className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-lg p-6 mb-6">
                  <h2 className="text-2xl font-bold mb-6">Pending Friend Requests</h2>
                  <div className="space-y-4">
                    {pendingRequests.map((request) => (
                      <div
                        key={request.requestId}
                        className="bg-gray-700/50 rounded-lg p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-4">
                          <img
                            src={`/placeholder.svg?height=50&width=50`}
                            alt={request.user.username}
                            width={50}
                            height={50}
                            className="rounded-full"
                          />
                          <div>
                            <h3 className="font-medium text-lg">{request.user.username}</h3>
                            <p className="text-sm text-gray-400">{request.user.email}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => acceptFriendRequest(request.user.id)}
                            className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700"
                            title="Accept Request"
                          >
                            <Check size={18} />
                          </button>
                          <button 
                            onClick={() => rejectFriendRequest(request.user.id)}
                            className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                            title="Reject Request"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Sent Friend Requests Section */}
              {sentRequests.length > 0 && (
                <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-lg p-6 mb-6">
                  <h2 className="text-2xl font-bold mb-6">Sent Friend Requests</h2>
                  <div className="space-y-4">
                    {sentRequests.map((request) => (
                      <div
                        key={request.requestId}
                        className="bg-gray-700/50 rounded-lg p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-4">
                          <img
                            src={`/placeholder.svg?height=50&width=50`}
                            alt={request.user.username}
                            width={50}
                            height={50}
                            className="rounded-full"
                          />
                          <div>
                            <h3 className="font-medium text-lg">{request.user.username}</h3>
                            <p className="text-sm text-gray-400">{request.user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Clock size={16} className="mr-2 text-yellow-500" />
                          <span className="text-gray-400 mr-4">Pending</span>
                          <button 
                            onClick={() => cancelFriendRequest(request.user.id)}
                            className="bg-gray-600 text-white p-2 rounded-full hover:bg-gray-700"
                            title="Cancel Request"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Friends List Section */}
              <div ref={friendsListRef} className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-6">Your Friends <span className="text-sm text-gray-400">({friends.filter(f => isUserOnline(f.id)).length}/{friends.length} online)</span></h2>
                {friends.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p>You don't have any friends yet</p>
                    <p className="text-sm mt-2">Browse the suggestions to find people to connect with</p>
                  </div>
                ) : (
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
                                isUserOnline(friend.id) ? "bg-green-500" : "bg-gray-500"
                              }`}
                              title={isUserOnline(friend.id) ? "Online" : "Offline"}
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
                              <p className="text-sm text-gray-400 flex items-center">
                                <span className={`inline-block w-2 h-2 mr-2 rounded-full ${isUserOnline(friend.id) ? "bg-green-500" : "bg-gray-500"}`}></span>
                                {isUserOnline(friend.id) ? "Online" : "Offline"}
                              </p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button className="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700">
                              <MessageSquare size={18} />
                            </button>
                            <button 
                              onClick={() => removeFriend(friend.id)}
                              className="bg-gray-600 text-white p-2 rounded-full hover:bg-red-700"
                              title="Remove Friend"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Friend Suggestions Section */}
            <div ref={suggestionsRef}>
              <h2 className="text-xl font-bold mb-4">Friend Suggestions</h2>
              {friendSuggestions.length === 0 ? (
                <div className="text-center py-8 text-gray-400 bg-gray-700/30 rounded-lg">
                  <p>No suggestions available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {friendSuggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={suggestion.avatar || "/placeholder.svg?height=50&width=50"}
                          alt={suggestion.username}
                          width={50}
                          height={50}
                          className="rounded-full"
                        />
                        <div>
                          <h3 className="font-medium">{suggestion.username}</h3>
                          <p className="text-xs text-gray-400">
                            {suggestion.mutualFriends || 0} mutual friends
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => sendFriendRequest(suggestion.id)}
                        className="text-purple-400 hover:text-purple-300 flex items-center"
                      >
                        <UserPlus size={16} className="mr-1" /> Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button className="w-full mt-4 text-center text-purple-400 hover:text-purple-300 text-sm">
                View More Suggestions
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;
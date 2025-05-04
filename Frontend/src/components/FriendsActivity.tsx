import type React from "react";
import { Music } from "lucide-react";
import { useEffect, useState } from "react";
import { useFriendsContext } from "../context";
import socket from "../utils/socket";

const FriendsActivity: React.FC = () => {
  const { friends, loading } = useFriendsContext();
  // Track online status of friends with a state object
  const [onlineStatus, setOnlineStatus] = useState<Record<string, boolean>>({});
  
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
      setOnlineStatus(prev => ({
        ...prev,
        [data.userId]: data.status === 'online'
      }));
    });
    
    // Add handler for presence response
    socket.on('presence:update', (data: { userIds: string[], status: 'online' | 'offline' }[]) => {
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
  
  // Helper function to get current online status
  const isUserOnline = (userId: string) => {
    return onlineStatus[userId] || false;
  };

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
                    isUserOnline(friend.id) ? "bg-green-500" : "bg-gray-500"
                  }`}
                ></span>
                <span className="ml-5">
                  <img
                    src={friend.avatar || "/api/placeholder/40/40"}
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
                      {isUserOnline(friend.id) ? "Online" : "Offline"}
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
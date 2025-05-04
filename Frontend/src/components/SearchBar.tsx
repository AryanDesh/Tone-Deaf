import React, { useState, useEffect, useRef } from "react";
import { Search, X, UserPlus, Play, Users } from "lucide-react";
import { useAudioContext } from "../context/";
import { useFriendsContext } from "../context/";
import axios from "axios";
import type { Song, Friend } from "../types/songTypes";

interface Room {
  id: string;
  name: string;
  code: string;
  hostId: string;
  host: {
    username: string;
  };
}

interface SearchResults {
  songs: Song[];
  users: Friend[];
  rooms: Room[];
}

interface SearchBarProps {
  searchOpen: boolean;
  toggleSearch: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchOpen,
  toggleSearch,
  searchQuery,
  setSearchQuery,
}) => {
  const [results, setResults] = useState<SearchResults>({
    songs: [],
    users: [],
    rooms: [],
  });
  const [activeTab, setActiveTab] = useState<"songs" | "users" | "rooms">("songs");
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const { setCurrSong } = useAudioContext();
  const { sendFriendRequest, friends } = useFriendsContext();

  useEffect(() => {
    // Add click outside listener to close results
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Debounce search to avoid too many requests
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 1) {
        performSearch();
        setShowResults(true);
      } else {
        setResults({ songs: [], users: [], rooms: [] });
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const performSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const { data } = await axios.get<SearchResults>(
        `http://localhost:5000/api/search?q=${encodeURIComponent(searchQuery)}`,
        { withCredentials: true }
      );
      setResults(data);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaySong = (song: Song) => {
    setCurrSong(song);
    toggleSearch();
  };

  const handleSendFriendRequest = async (userId: string) => {
    await sendFriendRequest(userId);
  };

  const handleJoinRoom = async (roomCode: string) => {
    try {
      await axios.post(
        `http://localhost:5000/api/room/join/${roomCode}`,
        {},
        { withCredentials: true }
      );
      // Redirect to room page or update UI accordingly
      window.location.href = `/room/${roomCode}`;
    } catch (error) {
      console.error("Error joining room:", error);
    }
  };

  const isFriend = (userId: string) => {
    return friends.some(friend => friend.id === userId);
  };

  if (!searchOpen) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-gray-900 bg-opacity-95 backdrop-filter backdrop-blur-lg z-30" ref={searchRef}>
      <div className="max-w-3xl mx-auto">
        {/* Search input */}
        <div className="flex items-center p-4">
          <Search size={24} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search for songs, artists, users or rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow bg-transparent text-white placeholder-gray-400 focus:outline-none"
            autoFocus
            onFocus={() => {
              if (searchQuery.trim().length > 1) {
                setShowResults(true);
              }
            }}
          />
          <button onClick={toggleSearch} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Search results */}
        {showResults && (
          <div className="bg-gray-800 rounded-b-lg overflow-hidden max-h-96 overflow-y-auto">
            {/* Tabs */}
            <div className="flex border-b border-gray-700">
              <button
                className={`flex-1 py-2 text-center ${
                  activeTab === "songs" ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-400"
                }`}
                onClick={() => setActiveTab("songs")}
              >
                Songs {results.songs.length > 0 && `(${results.songs.length})`}
              </button>
              <button
                className={`flex-1 py-2 text-center ${
                  activeTab === "users" ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-400"
                }`}
                onClick={() => setActiveTab("users")}
              >
                Users {results.users.length > 0 && `(${results.users.length})`}
              </button>
              <button
                className={`flex-1 py-2 text-center ${
                  activeTab === "rooms" ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-400"
                }`}
                onClick={() => setActiveTab("rooms")}
              >
                Rooms {results.rooms.length > 0 && `(${results.rooms.length})`}
              </button>
            </div>

            {/* Tab content */}
            <div className="p-2">
              {loading ? (
                <div className="text-center py-8 text-gray-400">Searching...</div>
              ) : (
                <>
                  {/* Songs tab */}
                  {activeTab === "songs" && (
                    <>
                      {results.songs.length === 0 ? (
                        <div className="text-center py-4 text-gray-400">No songs found</div>
                      ) : (
                        <ul>
                          {results.songs.map((song) => (
                            <li
                              key={song.id}
                              className="flex items-center justify-between p-2 hover:bg-gray-700 rounded cursor-pointer"
                              onClick={() => handlePlaySong(song)}
                            >
                              <div>
                                <div className="text-white font-medium">{song.title}</div>
                                <div className="text-gray-400 text-sm">{song.artist}</div>
                              </div>
                              <Play size={20} className="text-gray-400" />
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}

                  {/* Users tab */}
                  {activeTab === "users" && (
                    <>
                      {results.users.length === 0 ? (
                        <div className="text-center py-4 text-gray-400">No users found</div>
                      ) : (
                        <ul>
                          {results.users.map((user) => (
                            <li
                              key={user.id}
                              className="flex items-center justify-between p-2 hover:bg-gray-700 rounded"
                            >
                              <div className="text-white">{user.username}</div>
                              {!isFriend(user.id) && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSendFriendRequest(user.id);
                                  }}
                                  className="text-blue-400 hover:text-blue-300 flex items-center"
                                >
                                  <UserPlus size={18} className="mr-1" />
                                  <span>Add Friend</span>
                                </button>
                              )}
                              {isFriend(user.id) && (
                                <span className="text-green-400 text-sm">Friend</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}

                  {/* Rooms tab */}
                  {activeTab === "rooms" && (
                    <>
                      {results.rooms.length === 0 ? (
                        <div className="text-center py-4 text-gray-400">No rooms found</div>
                      ) : (
                        <ul>
                          {results.rooms.map((room) => (
                            <li
                              key={room.id}
                              className="flex items-center justify-between p-2 hover:bg-gray-700 rounded"
                            >
                              <div>
                                <div className="text-white font-medium">{room.name}</div>
                                <div className="text-gray-400 text-sm">
                                  Host: {room.host.username}
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleJoinRoom(room.code);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center"
                              >
                                <Users size={16} className="mr-1" />
                                <span>Join</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
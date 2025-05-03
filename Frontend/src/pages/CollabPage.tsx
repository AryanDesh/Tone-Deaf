"use client";

import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useSocketManager } from "../context/socket";
import ChatRoom from "../components/ChatRoom";
import CollaborationModal from "../components/CollaborationModal";
import { PlaylistModal } from "../components";
import { useAudioContext, useCollabContext } from "../context";
import { CustomButton } from "../components/ui/custom-button";
import { CustomInput } from "../components/ui/custom-input";
import {
  Music,
  Users,
  Plus,
  LogIn,
  LogOut,
  Headphones,
  Share2,
  PauseCircle,
  PlayCircle,
  ListPlus,
} from "lucide-react";
import type { ChatMessage, Song } from "../types/songTypes";

interface ISharedPlaylists {
  playlistId: number,
  name: string,
  sharedPlaylistId: number,
  owner: {
    id: string,
    username: string,
    isCurrentUser: boolean
  },
  songs: Song[]
}
interface CollaborationPageProps {
  showCollaborationModal: boolean;
  toggleCollaborationModal: () => void;
  showPlaylistModal: boolean;
  togglePlaylistModal: () => void;
}

const CollaborationPage: React.FC<CollaborationPageProps> = ({
  showCollaborationModal,
  toggleCollaborationModal,
  showPlaylistModal,
  togglePlaylistModal,
}) => {
  // Local UI state
  const [roomName, setRoomName] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [activeTab, setActiveTab] = useState<"create" | "join">("create");
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [sharedPlaylists, setSharedPlaylists] = useState<ISharedPlaylists[]>([]);
  
  // References for animations
  const pageRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Global context
  const { socket, connectSocket } = useSocketManager();
  const { 
    isInCollab, 
    setCollab, 
    leaveCollab, 
    roomId, 
    hostName,
    isHost 
  } = useCollabContext();
  
  const { 
    currSong, 
    isPlaying, 
    setIsPlaying, 
    setCurrSong,
    togglePlay, 
    playlist,
    setPlaylist 
  } = useAudioContext();

  // Entry animations
  useEffect(() => {
    connectSocket();
    const ctx = gsap.context(() => {
      gsap.from(".collab-header", { opacity: 0, y: -20, duration: 0.5 });
      gsap.from(".collab-card", {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.5,
        delay: 0.2,
      });
    }, pageRef);
    return () => ctx.revert();
  }, []);

  // Animate chat pane
  useEffect(() => {
    if (!isInCollab) return;
    const ctx = gsap.context(() => {
      if (chatRef.current) {
        gsap.from(chatRef.current, {
          opacity: 0,
          y: 20,
          duration: 0.5,
        });
      }
    }, chatRef);
    return () => ctx.revert();
  }, [isInCollab]);

  // Chat message handling
  useEffect(() => {
    getSharedPlaylists();

    const handleReceiveMessage = (update: { sender: string, content: string }) => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: update.sender,
          message: update.content,
          timestamp: new Date(),
          messageType: "incoming"
        },
      ]);
    };

    const handleSongPaused = () => {
      // Add system notification to chat
      setChatMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "System",
          message: `${hostName || "Someone"} paused the music`,
          timestamp: new Date(),
          messageType: "system" 
        }
      ]);
    };
    
    const handleSongPlayed = () => {
      // Add system notification to chat
      setChatMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "System",
          message: `${hostName || "Someone"} started playing music`,
          timestamp: new Date(),
          messageType: "system" 
        }
      ]);
    };
        
    const handlePlaylistCreated = (data: {
      playlist: {
        id: number,
        name: string,
        songs: Song[]
      },
      createdBy: { username: string },
    }) => {
      // Add system notification to chat
      setChatMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "System",
          message: `${data.createdBy.username || "Someone"} created playlist: ${data.playlist.name}`,
          timestamp: new Date(),
          messageType: "system"
        }
      ]);

      setPlaylist(data.playlist.songs, data.playlist.id , data.createdBy.username , data.playlist.name);
      console.log(playlist);

      // Hide create playlist form
      setShowCreatePlaylist(false);
    };

    const handleSongAddedToPlaylist = (data: { 
      song: Song,
      playlist: {
        name: string
      }
    }) => {
      // Add system notification to chat
      setChatMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "System",
          message: `"${data.song.title}" by ${data.song.artist} added to playlist: ${data.playlist.name}`,
          timestamp: new Date(),
          messageType: "system" 
        }
      ]);
    };
    
    socket.on("receive-message", handleReceiveMessage);
    socket.on("playlist-created", handlePlaylistCreated);
    socket.on("song-added-to-playlist", handleSongAddedToPlaylist);
    socket.on("song-paused", handleSongPaused);
    socket.on("song-played", handleSongPlayed);
    
    return () => {
      socket.off("receive-message", handleReceiveMessage);
      socket.off("playlist-created", handlePlaylistCreated);
      socket.off("song-added-to-playlist", handleSongAddedToPlaylist);
      socket.off("song-paused", handleSongPaused);
      socket.off("song-played", handleSongPlayed);
    };
  }, [socket, hostName]);

  // Actions
  const createRoom = () => {
    if (!roomName.trim()) return alert("Please enter a session name!");
    connectSocket();
    socket.emit("create-room", roomName);
  };

  const joinRoom = () => {
    if (!joinRoomId.trim()) return alert("Please enter a session ID!");
    connectSocket();
    socket.emit("join-room", joinRoomId);
    setCollab(joinRoomId);
  };
  
  const handleLeaveRoom = () => {
    if (!roomId) return;
    socket.emit("leave-room", roomId);
    leaveCollab();
    setChatMessages([]);
  };

  const getSharedPlaylists = async () => {
    if (!roomId) return;
    
    try {
      const response = await fetch(`/api/playlists/room/${roomId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch shared playlists: ${response.statusText}`);
      }
      
      const data = await response.json();
      if (data.success && data.playlists) {
        setSharedPlaylists(data.playlists);
      }
    } catch (error) {
      console.error("Error fetching shared playlists:", error);
    }
  }
  
  const sendMessage = (message: string) => {
    if (!message.trim() || !roomId) return;
    if(!socket) connectSocket();
    const msg = { sender: "You", content: message };
    socket.emit("send-message", msg, roomId);
    
    // Immediate local echo
    setChatMessages((prev) => [
      ...prev,
      { 
        id: Date.now().toString(), 
        sender: "You", 
        message, 
        timestamp: new Date(),
        messageType: "outgoing"
      },
    ]);
  };
  
  const handleTogglePlayPause = () => {
    if (!currSong || !roomId) {
      console.log("Cannot toggle play/pause: No song or room ID");
      return;
    }
    
    if (isPlaying) {
      socket.emit("pause-song", { 
        roomCode: roomId 
      });
      setIsPlaying(false);
    } else {
      socket.emit("play-song", { 
        roomCode: roomId 
      });
      setIsPlaying(true);
    }
  };
  
  const createPlaylist = () => {
    if (!playlistName.trim() || !roomId) return;
    
    const songId = currSong?.id || null;
    socket.emit("create-playlist", {
      playlistName,
      roomCode: roomId,
      songId: songId || ""
    });
    
    setPlaylistName(playlistName);
  };
  
  const addSongToPlaylist = (playlistId: number) => {
    if (!currSong || !roomId || !playlistId) return;
    
    socket.emit("add-song-to-playlist", {
      roomCode: roomId,
      songId: currSong.id,
      playlistId
    });
  };

  // Get playlist songs from context
  const getPlaylistSongs = () => {
    return playlist.toArray();
  };

  // Get playlist info from context
  const getPlaylistInfo = () => {
    return playlist.getPlaylistInfo();
  };

  const playlistInfo = getPlaylistInfo();
  const playlistSongs = getPlaylistSongs();
  const hasPlaylist = playlistInfo.playListId !== null;

  return (
    <div ref={pageRef} className="min-h-screen bg-gray-900/80 backdrop-blur-0 text-white">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="collab-header flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
              Collaboration Hub
            </h1>
            <p className="text-gray-300 mt-2">
              {isInCollab
                ? `In session: ${roomId}`
                : "Create or join a music session"}
            </p>
          </div>
          {isInCollab && (
            <CustomButton
              onClick={handleLeaveRoom}
              variant="danger"
              className="mt-4 md:mt-0 flex items-center"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Leave Session
            </CustomButton>
          )}
        </div>

        {!isInCollab ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Create / Join Tabs */}
            <div className="collab-card bg-gray-800 rounded-xl p-6">
              <div className="flex mb-6">
                <button
                  className={`flex-1 py-2 rounded-l-lg ${
                    activeTab === "create"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-700"
                  }`}
                  onClick={() => setActiveTab("create")}
                >
                  Create Session
                </button>
                <button
                  className={`flex-1 py-2 rounded-r-lg ${
                    activeTab === "join"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-700"
                  }`}
                  onClick={() => setActiveTab("join")}
                >
                  Join Session
                </button>
              </div>

              {activeTab === "create" ? (
                <div className="space-y-4">
                  <CustomInput
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="Session name..."
                  />
                  <div className="flex justify-end">
                    <CustomButton
                      onClick={createRoom}
                      disabled={!roomName.trim()}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create
                    </CustomButton>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <CustomInput
                    value={joinRoomId}
                    onChange={(e) => setJoinRoomId(e.target.value)}
                    placeholder="Session ID..."
                  />
                  <div className="flex justify-end">
                    <CustomButton
                      onClick={joinRoom}
                      disabled={!joinRoomId.trim()}
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      Join
                    </CustomButton>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Sessions or Shared Playlists */}
            <div className="collab-card bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Headphones className="mr-2 h-5 w-5 text-purple-400" />
                Browse Sessions
              </h2>
              {/* Placeholder list */}
              <div className="space-y-3 mb-6">
                {[
                  { id: "sess-1", name: "Weekend Jam", active: true, count: 4 },
                  { id: "sess-2", name: "Beat Lab", active: false, count: 2 },
                ].map((s) => (
                  <div
                    key={s.id}
                    className="flex justify-between p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
                  >
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-gray-400">
                        {s.count} participants
                      </p>
                    </div>
                    <CustomButton
                      size="sm"
                      variant={s.active ? "primary" : "secondary"}
                      onClick={() => {
                        setJoinRoomId(s.id);
                        setActiveTab("join");
                      }}
                    >
                      {s.active ? "Join" : "View"}
                    </CustomButton>
                  </div>
                ))}
              </div>
              <CustomButton
                onClick={togglePlaylistModal}
                variant="outline"
                className="w-full flex items-center justify-center"
              >
                <Music className="mr-2 h-4 w-4" />
                Shared Playlists
              </CustomButton>
            </div>
          </div>
        ) : (
          // === In‐Session View ===
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2" ref={chatRef}>
              <ChatRoom
                messages={chatMessages}
                sendMessage={sendMessage}
                sessionName={roomId || ""}
              />
            </div>

            <div className="collab-card bg-gray-800 rounded-xl overflow-hidden">
              <div className="px-6 py-4 bg-purple-900">
                <h2 className="text-xl font-bold text-white">Session Info</h2>
              </div>
              <div className="p-6 space-y-6">
                {/* Session ID */}
                <div>
                  <p className="text-sm text-gray-400 mb-1">Session ID</p>
                  <div className="flex items-center">
                    <pre className="flex-1 bg-gray-700 p-2 rounded text-sm text-white overflow-x-auto">
                      {roomId}
                    </pre>
                    <button
                      className="ml-2 p-2 hover:bg-gray-700 rounded"
                      onClick={() => {
                        navigator.clipboard.writeText(roomId || "");
                        alert("Copied!");
                      }}
                    >
                      <Share2 className="h-4 w-4 text-purple-400" />
                    </button>
                  </div>
                </div>
                
                {/* Now Playing */}
                <div>
                  <p className="text-sm text-gray-400 mb-2">Now Playing</p>
                  <div className="flex items-center bg-gray-700 p-3 rounded">
                    <button 
                      onClick={handleTogglePlayPause}
                      className="mr-3 text-purple-400 hover:text-purple-300"
                    >
                      {isPlaying ? 
                        <PauseCircle className="h-6 w-6" /> : 
                        <PlayCircle className="h-6 w-6" />
                      }
                    </button>
                    <div className="flex-1">
                      <p className="text-white">{currSong?.title || "No track playing"}</p>
                      <p className="text-xs text-gray-400">by {currSong?.artist || "Unknown"}</p>
                    </div>
                    {hostName && !isHost && (
                      <div className="text-xs bg-purple-800 px-2 py-1 rounded">
                        Host: {hostName}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Playlists Section */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-gray-400">
                      {hasPlaylist ? "Current Playlist" : "Shared Playlists"}
                    </p>
                    <button 
                      onClick={() => setShowCreatePlaylist(!showCreatePlaylist)}
                      className="text-xs text-purple-400 hover:text-purple-300"
                    >
                      {showCreatePlaylist ? "Cancel" : "Create New"}
                    </button>
                  </div>
                  
                  {/* Create Playlist Form */}
                  {showCreatePlaylist && (
                    <div className="mb-3 bg-gray-700 p-3 rounded">
                      <CustomInput
                        value={playlistName}
                        onChange={(e) => setPlaylistName(e.target.value)}
                        placeholder="Playlist name..."
                        className="mb-2"
                      />
                      <div className="text-xs text-gray-400 mb-2">
                        {currSong ? `Will add: "${currSong.title}"` : "No song selected to add"}
                      </div>
                      <CustomButton
                        onClick={createPlaylist}
                        disabled={!playlistName.trim()}
                        size="sm"
                        className="w-full"
                      >
                        <Plus className="mr-2 h-3 w-3" />
                        Create Playlist
                      </CustomButton>
                    </div>
                  )}
                  
                  {/* Current Playlist */}
                  {hasPlaylist ? (
                    <div className="bg-gray-700 p-3 rounded">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <p className="font-medium">{playlistInfo.playListName}</p>
                          <p className="text-xs text-gray-400">
                            by {playlistInfo.playlistCreator || "Unknown"} • {playlistSongs.length} songs
                          </p>
                        </div>
                        {currSong && (
                          <button
                            onClick={() => addSongToPlaylist(playlistInfo.playListId as number)}
                            className="text-purple-400 hover:text-purple-300"
                            title="Add current song"
                          >
                            <ListPlus className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      
                      {/* Songs list */}
                      <div className="mt-3 max-h-32 overflow-y-auto">
                        {playlistSongs.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-2">No songs yet</p>
                        ) : (
                          <div className="space-y-1">
                            {playlistSongs.map(song => (
                              <button onClick={() => {
                                socket.emit('stream-song', {roomCode : roomId! , songId : song.id});
                                setCurrSong(song);
                                setIsPlaying(true);
                              }}>
                                <div 
                                  key={song.id}
                                  className={`text-sm p-1 rounded ${
                                    currSong?.id === song.id ? 'bg-purple-900/50' : ''
                                    }`}
                                    >
                                  {song.title} - {song.artist}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-3 text-sm text-gray-500">
                      No active playlist
                    </div>
                  )}

                  {/* Other shared playlists in this room */}
                  <div className="bg-gray-700 p-3 rounded">
                    {sharedPlaylists.map((playlist) => (
                      <button
                        key={playlist.sharedPlaylistId}
                        onClick={() =>
                          setPlaylist(
                            playlist.songs,
                            playlist.playlistId,
                            playlist.owner.username,
                            playlist.name
                          )
                        }
                        className="w-full text-left"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <p className="font-medium">{playlist.name}</p>
                            <p className="text-xs text-gray-400">
                              by {playlist.owner.username || "Unknown"} • {playlist.songs.length} songs
                            </p>
                          </div>
                          {currSong && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); 
                                addSongToPlaylist(playlist.playlistId);
                              }}
                              className="text-purple-400 hover:text-purple-300"
                              title="Add current song"
                            >
                              <ListPlus className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <CustomButton
                  onClick={togglePlaylistModal}
                  variant="outline"
                  className="w-full flex items-center justify-center"
                >
                  <Music className="mr-2 h-4 w-4" />
                  Share a Track
                </CustomButton>
              </div>
            </div>
          </div>
        )}
      </div>

      {showCollaborationModal && (
        <CollaborationModal
          friends={[]}
          toggleCollaborationModal={toggleCollaborationModal}
        />
      )}
      {showPlaylistModal && (
        <PlaylistModal playlists={[]} togglePlaylistModal={togglePlaylistModal} />
      )}
    </div>
  );
};

export default CollaborationPage;
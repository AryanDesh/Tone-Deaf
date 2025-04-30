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
import type { Message, IUser } from "../utils/socket";

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
  const [roomName, setRoomName] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [activeTab, setActiveTab] = useState<"create" | "join">("create");
  const [playlists, setPlaylists] = useState<Array<{id: string, name: string, songs: Song[]}>>([]);
  const [currentPlaylist, setCurrentPlaylist] = useState<{id: string, name: string, songs: Song[]} | null>(null);
  const [playlistName, setPlaylistName] = useState("");
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);

  const { socket, connectSocket } = useSocketManager();
  const { isInCollab, setCollab, setHost, roomId, hostName } = useCollabContext();
  const { currSong, isPlaying, setIsPlaying,togglePlay, setCurrSong } = useAudioContext();

  const pageRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Entry animations
  useEffect(() => {
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

  // Bind chat listener exactly once
  useEffect(() => {
    const handleReceiveMessage = (update: Message) => {
      // Mark message as incoming
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: update.sender,
          message: update.content,
          timestamp: new Date(),
          messageType: "incoming" // Mark as incoming message
        },
      ]);
    };

    const handleSongPaused = (data: {userId: string}) => {
      console.log("Song paused by", data.userId);
      // setIsPlaying(false);
      
      // Add system notification to chat
      setChatMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "System",
          message: `${data.userId === "You" ? "You" : "Someone"} paused `,
          timestamp: new Date(),
          messageType: "system" 
        }
      ]);
    };
        
    const handlePlaylistCreated = (data: {
      playlist: {
        id: string,
        name: string,
        songs: Song[]
      },
      createdBy: any,
      initialSong?: Song,
    }) => {
      setPlaylists(prev => [...prev, data.playlist]);
      setCurrentPlaylist(data.playlist);
      
      // Add system notification to chat
      setChatMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "System",
          message: `${data.createdBy.username || "Someone"} created playlist: ${data.playlist.name}`,
          timestamp: new Date(),
          messageType: "system" // Mark as system message
        }
      ]);
      
      // Hide create playlist form
      setShowCreatePlaylist(false);
    };
    
    const handleSongAddedToPlaylist = (data : {song: Song}) => {
      if (currentPlaylist) {
        const updatedPlaylist = {
          ...currentPlaylist,
          songs: [...currentPlaylist.songs, data.song]
        };
        
        setCurrentPlaylist(updatedPlaylist);
        setPlaylists(prev => prev.map(p => 
          p.id === currentPlaylist.id ? updatedPlaylist : p
        ));
        
        // Add system notification to chat
        setChatMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: "System",
            message: `"${data.song.title}" by ${data.song.artist} added to playlist: ${currentPlaylist.name}`,
            timestamp: new Date(),
            messageType: "system" 
          }
        ]);
      }
    };
    
    socket.on("receive-message", handleReceiveMessage);
    socket.on("playlist-created", handlePlaylistCreated);
    socket.on("song-added-to-playlist", handleSongAddedToPlaylist);
    socket.on("song-paused", handleSongPaused);
    
    return () => {
      socket.off("receive-message", handleReceiveMessage);
      socket.off("playlist-created", handlePlaylistCreated);
      socket.off("song-added-to-playlist", handleSongAddedToPlaylist);
      socket.off("song-paused", handleSongPaused); 
    };
  }, [socket, currentPlaylist]);

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

  const leaveRoom = () => {
    if (!roomId) return;
    socket.emit("leave-room", roomId);
    setCollab("");
    setChatMessages([]);
    setPlaylists([]);
    setCurrentPlaylist(null);
  };

  const sendMessage = (message: string) => {
    if (!message.trim() || !roomId) return;
    connectSocket();
    const msg = { sender: "You", content: message };
    socket.emit("send-message", msg, roomId);
    // Immediate local echo marked as outgoing
    setChatMessages((prev) => [
      ...prev,
      { 
        id: Date.now().toString(), 
        sender: "You", 
        message: message, 
        timestamp: new Date(),
        messageType: "outgoing" // Mark as outgoing message
      },
    ]);
  };
  
  const togglePlayPause = () => {
    if (!currSong || !roomId) {
      console.log("Cannot toggle play/pause: No song or room ID");
      return;
    }
    
    console.log("Current playing state before toggle:", isPlaying);
    
    if (isPlaying) {
      // Pause the song
      console.log("Emitting pause-song event for song:", currSong.id);
      socket.emit("pause-song", { 
        songId: currSong.id, 
        roomCode: roomId 
      });
      setIsPlaying(false);
    } else {
      console.log("Emitting stream-song event for song:", currSong.id);
      socket.emit("stream-song", { 
        songId: currSong.id, 
        roomCode: roomId 
      });
      setIsPlaying(true);
    }
  }; 
  const createPlaylist = () => {
    if (!playlistName.trim() || !roomId) return;
    
    const songId = currSong?.id || null;
    socket.emit("create-playlist", {
      playlistName: playlistName,
      roomCode: roomId,
      songId: songId || ""
    });
    
    setPlaylistName("");
  };
  
  const addSongToPlaylist = (playlistId: string) => {
    if (!currSong || !roomId || !playlistId) return;
    
    socket.emit("add-song-to-playlist", {
      roomCode: roomId,
      songId: currSong.id,
      playlistId: playlistId
    });
  };

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
              onClick={leaveRoom}
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
                      onClick={togglePlayPause}
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
                    {hostName && (
                      <div className="text-xs bg-purple-800 px-2 py-1 rounded">
                        Played by {hostName}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Playlists Section */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-gray-400">Shared Playlists</p>
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
                  
                  {/* Playlists List */}
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {playlists.length === 0 ? (
                      <div className="text-center py-3 text-sm text-gray-500">
                        No shared playlists yet
                      </div>
                    ) : (
                      playlists.map(playlist => (
                        <div 
                          key={playlist.id}
                          className={`bg-gray-700 p-2 rounded ${currentPlaylist?.id === playlist.id ? 'border border-purple-500' : ''}`}
                        >
                          <div className="flex justify-between items-center">
                            <p className="font-medium">{playlist.name}</p>
                            <div className="flex items-center">
                              <span className="text-xs text-gray-400 mr-2">
                                {playlist.songs.length} songs
                              </span>
                              {currSong && (
                                <button
                                  onClick={() => addSongToPlaylist(playlist.id)}
                                  className="text-purple-400 hover:text-purple-300"
                                  title="Add current song"
                                >
                                  <ListPlus className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
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
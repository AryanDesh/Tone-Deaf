"use client";

import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useSocketManager } from "../context/socket";
import CollaborationModal from "../components/CollaborationModal";
import ChatRoom from "../components/ChatRoom";
import { PlaylistModal } from "../components";
import { useAudioContext, useCollabContext } from "../context";
import { mockFriends, mockPlaylists } from "../utils/mockData";
import type { ChatMessage } from "../types/songTypes";

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
  const [messageInput, setMessageInput] = useState("");

  const { socket, connectSocket, disconnectSocket } = useSocketManager();
  const { isInCollab, setCollab, setHost, roomId } = useCollabContext();
  const { setCurrSong, setIsPlaying } = useAudioContext();

  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (chatRef.current) {
        gsap.from(chatRef.current, {
          opacity: 0,
          y: 20,
          duration: 0.5,
          ease: "power3.out",
        });
      }
    });

    return () => ctx.revert();
  }, [isInCollab]);

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => console.log("✅ Connected to collab namespace");
    const handleRoomCreated = (roomId: string) => {
      console.log("Room created:", roomId);
      setCollab(roomId);
      setHost();
    };
    const handleReceiveMessage = (update: any) => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: update.sender,
          message: update.content,
          timestamp: new Date(),
        },
      ]);
    };
    const handleSongStreamed = ({ song }: any) => {
      setCurrSong(song);
      setIsPlaying(true);
    };
    const handleUserJoined = ({ userId }: any) => console.log(`👤 User joined: ${userId}`);
    const handleUserLeft = ({ userId }: any) => console.log(`👋 User left: ${userId}`);
    const handleError = (msg: string) => alert(msg);

    // socket.on("connect", handleConnect);
    socket.on("room-created", handleRoomCreated);
    socket.on("receive-message", handleReceiveMessage);
    socket.on("song-streamed", handleSongStreamed);
    socket.on("user-joined", handleUserJoined);
    socket.on("user-left-room", handleUserLeft);
    socket.on("Error", handleError);

    return () => {
      // socket.off("connect", handleConnect);
      socket.off("room-created", handleRoomCreated);
      socket.off("receive-message", handleReceiveMessage);
      socket.off("song-streamed", handleSongStreamed);
      socket.off("user-joined", handleUserJoined);
      socket.off("user-left-room", handleUserLeft);
      socket.off("Error", handleError);
      // disconnectSocket();
    };
  }, [socket]);

  const createRoom = () => {
    if (!roomName.trim()) return alert("Please enter a room name first!");
    connectSocket();
    socket?.emit("create-room", roomName);
  };

  const joinRoom = () => {
    if (!joinRoomId.trim()) return alert("Please enter a room ID to join!");
    connectSocket();
    socket.emit("join-room", joinRoomId);
    setCollab(joinRoomId);
  };

  const leaveRoom = () => {
    if (!roomId) return;
    socket.emit("leave-room", roomId);
    setCollab("");
  };

  const sendMessage = () => {
    if (!messageInput.trim() || !roomId) return;
    const msg = { sender: "You", content: messageInput };
    socket?.emit("send-message", msg, roomId);
    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: "You",
        message: messageInput,
        timestamp: new Date(),
      },
    ]);
    setMessageInput("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-3xl font-bold mb-6">Collaboration Hub</h1>

      <div className="mb-4 space-y-3">
        <div>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="px-3 py-2 border rounded w-3/4 mr-2"
            placeholder="Room name to create..."
          />
          <button onClick={createRoom} className="px-4 py-2 bg-blue-600 text-white rounded">
            Create Room
          </button>
        </div>

        <div>
          <input
            type="text"
            value={joinRoomId}
            onChange={(e) => setJoinRoomId(e.target.value)}
            className="px-3 py-2 border rounded w-3/4 mr-2"
            placeholder="Room ID to join..."
          />
          <button onClick={joinRoom} className="px-4 py-2 bg-green-600 text-white rounded">
            Join Room
          </button>
        </div>

        <div>
          <button onClick={leaveRoom} className="px-4 py-2 bg-red-600 text-white rounded">
            Leave Room
          </button>
        </div>
      </div>

      {isInCollab && (
        <div ref={chatRef} className="mt-8">
          <ChatRoom
            messages={chatMessages}
            sendMessage={sendMessage}
            sessionName={roomId || ""}
          />
        </div>
      )}

      {showCollaborationModal && (
        <CollaborationModal friends={mockFriends} toggleCollaborationModal={toggleCollaborationModal} />
      )}

      {showPlaylistModal && (
        <PlaylistModal playlists={mockPlaylists} togglePlaylistModal={togglePlaylistModal} />
      )}
    </div>
  );
};

export default CollaborationPage;

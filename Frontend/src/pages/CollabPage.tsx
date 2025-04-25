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
} from "lucide-react";
import type { ChatMessage } from "../types/songTypes";
import type { Message } from "../utils/socket";

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

  const { socket, connectSocket } = useSocketManager();
  const { isInCollab, setCollab, setHost, roomId } = useCollabContext();

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
    socket.on("receive-message", handleReceiveMessage);
    return () => {
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [socket]);

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
  };

  // In CollaborationPage.tsx
  const sendMessage = (message: string) => {
    if (!message.trim() || !roomId) return;
    connectSocket();
    const msg = { sender: "You", content: message };
    socket.emit("send-message", msg, roomId);
    // Immediate local echo
    setChatMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), sender: "You", message: message, timestamp: new Date() },
    ]);
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
                {/* Participants & Now Playing */}
                <div>
                  <p className="text-sm text-gray-400 mb-2">Now Playing</p>
                  <div className="flex items-center bg-gray-700 p-3 rounded">
                    <Headphones className="mr-3 h-6 w-6 text-purple-400" />
                    <div>
                      <p className="text-white">Track Title</p>
                      <p className="text-xs text-gray-400">by Artist</p>
                    </div>
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

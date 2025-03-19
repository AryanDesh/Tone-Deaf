"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { gsap } from "gsap"
import CollaborationSessions from "../components/CollaborationSessions"
import CollaborativePlaylists from "../components/CollaborationPlaylist"
import ChatRoom from "../components/ChatRoom"
import CollaborationModal from "../components/CollaborationModal"
import { mockCollaborationSessions, mockPlaylists, mockFriends } from "../utils/mockData"
import type { ChatMessage } from "../types/songTypes"
import { PlaylistModal } from "../components"

interface CollaborationPageProps {
  showCollaborationModal: boolean
  toggleCollaborationModal: () => void
  showPlaylistModal: boolean
  togglePlaylistModal: () => void
}

const CollaborationPage: React.FC<CollaborationPageProps> = ({
  showCollaborationModal,
  toggleCollaborationModal,
  showPlaylistModal,
  togglePlaylistModal,
})  => {
  const [activeChatSession, setActiveChatSession] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])

  // Refs for animations
  const sessionsRef = useRef<HTMLDivElement>(null)
  const playlistsRef = useRef<HTMLDivElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const ctx = gsap.context(() => {
    if (sessionsRef.current) {
      gsap.from(sessionsRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: "power3.out",
      });
    }

    if (playlistsRef.current) {
      gsap.from(playlistsRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.3,
        ease: "power3.out",
      });
    }

  });
  return () => ctx.revert(); // Cleanup animations when component unmounts
}, []);

  const joinSession = (sessionId: string) => {
    setActiveChatSession(sessionId)
    // Mock chat messages
    setChatMessages([
      { id: "1", sender: "Alice", message: "Hey everyone!", timestamp: new Date() },
      { id: "2", sender: "Bob", message: "Hi Alice, ready to collaborate?", timestamp: new Date() },
    ])

    // Animate chat window
    if (chatRef.current) {
      gsap.from(chatRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: "power3.out",
      })
    }
  }

  const sendChatMessage = (message: string) => {
    if (activeChatSession) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: "You",
        message,
        timestamp: new Date(),
      }
      setChatMessages([...chatMessages, newMessage])
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-3xl font-bold mb-6">Collaboration Hub</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div ref={sessionsRef}>
          <CollaborationSessions sessions={mockCollaborationSessions} joinSession={joinSession} />
        </div>

        <div ref={playlistsRef}>
          <CollaborativePlaylists playlists={mockPlaylists.filter((p) => p.collaborative)} />
        </div>
      </div>

      {activeChatSession && (
        <div ref={chatRef} className="mt-8">
          <ChatRoom
            messages={chatMessages}
            sendMessage={sendChatMessage}
            sessionName={mockCollaborationSessions.find((s) => s.id === activeChatSession)?.name || ""}
          />
        </div>
      )}

      {showCollaborationModal && (
        <CollaborationModal friends={mockFriends} toggleCollaborationModal={toggleCollaborationModal} />
      )}

      {showPlaylistModal && <PlaylistModal playlists={mockPlaylists} togglePlaylistModal={togglePlaylistModal} />}

    </div>
  )
}

export default CollaborationPage


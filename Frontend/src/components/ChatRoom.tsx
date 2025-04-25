"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { gsap } from "gsap"
import { Send, Mic, Music, Users } from "lucide-react"
import type { ChatMessage } from "../types/songTypes"
import { CustomAvatar } from "./ui/custom-avatar"
import { CustomInput } from "./ui/custom-input"
import { CustomButton } from "./ui/custom-button"

interface ChatRoomProps {
  messages: ChatMessage[]
  sendMessage: (message: string) => void
  sessionName: string
}

const ChatRoom: React.FC<ChatRoomProps> = ({ messages, sendMessage, sessionName }) => {
  const [messageInput, setMessageInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Animation for new messages
  useEffect(() => {
    if (messages.length > 0 && chatContainerRef.current) {
      const messageElements = chatContainerRef.current.querySelectorAll(".message-item")
      if (messageElements.length > 0) {
        const lastMessage = messageElements[messageElements.length - 1]
        gsap.from(lastMessage, {
          opacity: 0,
          y: 20,
          duration: 0.3,
          ease: "power2.out",
        })
      }
    }
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (messageInput.trim()) {
      sendMessage(messageInput)
      setMessageInput("")
    }
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  return (
    <div className="flex flex-col bg-gradient-to-br from-purple-900/90 to-indigo-900/90 rounded-xl shadow-2xl overflow-hidden h-[600px] border border-purple-500/30">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-purple-800 to-indigo-800 px-6 py-4 flex items-center justify-between border-b border-purple-600/50">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Music className="h-6 w-6 text-purple-300" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-indigo-800"></span>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">{sessionName || "Music Session"}</h3>
            <p className="text-purple-300 text-xs flex items-center">
              <Users className="h-3 w-3 mr-1" /> Active Collaborators: 2
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <div className="h-8 w-8 rounded-full bg-purple-700 flex items-center justify-center cursor-pointer hover:bg-purple-600 transition-colors">
            <Mic className="h-4 w-4 text-white" />
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-transparent"
        ref={chatContainerRef}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Music className="h-16 w-16 text-purple-400 mb-4 animate-pulse" />
            <h3 className="text-white text-xl font-bold mb-2">Start your music collaboration</h3>
            <p className="text-purple-300 max-w-md">
              Share song ideas, discuss arrangements, or just chat about music with your collaborators.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.sender === "You";
            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 message-item ${isOwnMessage ? "justify-end" : ""}`}
              >
                {!isOwnMessage && (
                  <div className="flex flex-col items-center">
                    <CustomAvatar name={msg.sender} />
                    <span className="text-xs text-purple-300 mt-1">{getInitials(msg.sender)}</span>
                  </div>
                )}
                
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    isOwnMessage
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-none"
                      : "bg-gray-800/60 text-white rounded-tl-none"
                  }`}
                >
                  {!isOwnMessage && <p className="text-xs font-medium text-purple-300 mb-1">{msg.sender}</p>}
                  <p className="text-sm">{msg.message}</p>
                  <p className="text-right text-xs mt-1 opacity-70">{formatTime(msg.timestamp)}</p>
                </div>
                
                {isOwnMessage && (
                  <div className="flex flex-col items-center">
                    <CustomAvatar name="You" />
                    <span className="text-xs text-purple-300 mt-1">YOU</span>
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSubmit} className="p-4 bg-gray-900/50 border-t border-purple-700/30">
        <div className="flex items-center space-x-2">
          <CustomInput
            ref={inputRef}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <CustomButton
            type="submit"
            disabled={!messageInput.trim()}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
          >
            <Send className="h-5 w-5" />
          </CustomButton>
        </div>
      </form>
    </div>
  )
}

export default ChatRoom
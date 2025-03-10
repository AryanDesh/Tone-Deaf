"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send } from "lucide-react"
import type { ChatMessage } from "../types/songTypes"

interface ChatRoomProps {
  messages: ChatMessage[]
  sendMessage: (message: string) => void
  sessionName: string
}

const ChatRoom: React.FC<ChatRoomProps> = ({ messages, sendMessage, sessionName }) => {
  const [inputMessage, setInputMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputMessage.trim()) {
      sendMessage(inputMessage)
      setInputMessage("")
    }
  }

  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Chat: {sessionName}</h2>
      <div className="h-64 overflow-y-auto mb-4 p-4 bg-gray-900/50 rounded-lg">
        {messages.map((msg) => (
          <div key={msg.id} className="mb-3">
            <div className="flex items-start">
              <span className={`font-semibold ${msg.sender === "You" ? "text-purple-400" : "text-blue-400"}`}>
                {msg.sender}:
              </span>
              <span className="ml-2 text-white">{msg.message}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="flex">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow bg-gray-700 text-white p-2 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
        />
        <button
          type="submit"
          className="bg-purple-600 text-white p-2 rounded-r-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  )
}

export default ChatRoom


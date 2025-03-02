"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Send } from "lucide-react"
import type { ChatMessage } from "../utils/types"

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

  useEffect(scrollToBottom, [])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputMessage.trim()) {
      sendMessage(inputMessage)
      setInputMessage("")
    }
  }

  return (
    <div className="bg-background-light rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">Chat: {sessionName}</h2>
      <div className="h-96 overflow-y-auto mb-4 p-4 bg-background-dark rounded-lg">
        {messages.map((msg) => (
          <div key={msg.id} className="mb-4">
            <span className="font-semibold">{msg.sender}: </span>
            <span>{msg.message}</span>
            <span className="text-xs text-text-tertiary ml-2">{msg.timestamp.toLocaleTimeString()}</span>
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
          className="flex-grow bg-background-dark text-text-primary p-2 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-color"
        />
        <button
          type="submit"
          className="bg-primary-color text-white p-2 rounded-r-lg hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary-color"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  )
}

export default ChatRoom


import type React from "react"
import { Users, MessageSquare } from "lucide-react"
import type { CollaborationSession } from "../types/songTypes"

interface CollaborationSessionsProps {
  sessions: CollaborationSession[]
  joinSession: (sessionId: string) => void
}

const CollaborationSessions: React.FC<CollaborationSessionsProps> = ({ sessions, joinSession }) => {
  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Active Sessions</h2>
      <div className="space-y-4">
        {sessions.map((session) => (
          <div key={session.id} className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-medium">{session.name}</h3>
              <span className={`text-xs px-2 py-1 rounded ${session.active ? "bg-green-500" : "bg-gray-500"}`}>
                {session.active ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-2">Created by {session.createdBy}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400 flex items-center">
                <Users size={16} className="mr-1" /> {session.participants} participants
              </span>
              <button
                onClick={() => joinSession(session.id)}
                className="bg-purple-600 text-white px-3 py-1 rounded text-sm flex items-center hover:bg-purple-700"
              >
                <MessageSquare size={16} className="mr-1" /> Join Chat
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CollaborationSessions


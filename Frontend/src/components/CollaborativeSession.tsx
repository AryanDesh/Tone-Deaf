import type React from "react"
import { Users, MessageSquare } from "lucide-react"
import type { CollaborationSession } from "../utils/types"

interface CollaborationSessionsProps {
  sessions: CollaborationSession[]
  joinSession: (sessionId: string) => void
}

const CollaborationSessions: React.FC<CollaborationSessionsProps> = ({ sessions, joinSession }) => {
  return (
    <div className="bg-background-light rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">Active Sessions</h2>
      <div className="space-y-4">
        {sessions.map((session) => (
          <div key={session.id} className="bg-hover-color rounded-lg p-4 transition-colors hover:bg-active-color">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-medium">{session.name}</h3>
              <span className={`text-xs px-2 py-1 rounded ${session.active ? "bg-green-500" : "bg-gray-500"}`}>
                {session.active ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-sm text-text-secondary mb-2">Created by {session.createdBy}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary flex items-center">
                <Users size={16} className="mr-1" /> {session.participants} participants
              </span>
              <button
                onClick={() => joinSession(session.id)}
                className="bg-primary-color text-white px-3 py-1 rounded text-sm flex items-center"
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


import type React from "react"
import { Users, MessageSquare } from "lucide-react"
import type { CollaborationSession } from "../utils/types"

interface CollaborationBlockProps {
  collaborationSessions: CollaborationSession[]
  toggleCollaborationModal: () => void
}

const CollaborationBlock: React.FC<CollaborationBlockProps> = ({ collaborationSessions, toggleCollaborationModal }) => {
  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Collaboration Sessions</h2>
        <button
          onClick={toggleCollaborationModal}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          New Session
        </button>
      </div>
      <div className="space-y-4">
        {collaborationSessions.map((session) => (
          <div key={session.id} className="bg-gray-700 rounded-lg p-4">
            <h3 className="font-medium text-lg mb-2">{session.name}</h3>
            <div className="flex justify-between items-center">
              <div className="flex items-center text-gray-400">
                <Users size={16} className="mr-2" />
                <span>{session.participants} participants</span>
              </div>
              <button className="bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 transition-colors flex items-center">
                <MessageSquare size={16} className="mr-2" />
                Join Chat
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CollaborationBlock


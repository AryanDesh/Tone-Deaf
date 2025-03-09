import type React from "react"
import { X } from "lucide-react"
import type { Friend } from "../utils/types"

interface CollaborationModalProps {
  friends: Friend[]
  toggleCollaborationModal: () => void
}

const CollaborationModal: React.FC<CollaborationModalProps> = ({ friends, toggleCollaborationModal }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96 max-w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Start Collaboration</h2>
          <button onClick={toggleCollaborationModal} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <form>
          <div className="mb-4">
            <label htmlFor="session-name" className="block text-sm font-medium text-gray-400 mb-1">
              Session Name
            </label>
            <input
              type="text"
              id="session-name"
              className="w-full bg-gray-700 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="Enter session name"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-1">Invite Friends</label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {friends.map((friend) => (
                <div key={friend.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`friend-${friend.id}`}
                    className="mr-2 rounded text-purple-600 focus:ring-purple-600"
                  />
                  <label htmlFor={`friend-${friend.id}`} className="text-white">
                    {friend.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition-colors"
          >
            Create Session
          </button>
        </form>
      </div>
    </div>
  )
}

export default CollaborationModal


import type React from "react"
import { Users, Play } from "lucide-react"
import type { Playlist } from "../types/songTypes"

interface CollaborativePlaylistsProps {
  playlists: Playlist[]
}

const CollaborativePlaylists: React.FC<CollaborativePlaylistsProps> = ({ playlists }) => {
  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Collaborative Playlists</h2>
      <div className="space-y-4">
        {playlists.map((playlist) => (
          <div key={playlist.id} className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-medium">{playlist.name}</h3>
              <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded flex items-center">
                <Users size={12} className="mr-1" /> Collaborative
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-2">Created by {playlist.createdBy}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">{playlist.songCount} songs</span>
              <button className="text-purple-500 hover:text-purple-400">
                <Play size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CollaborativePlaylists


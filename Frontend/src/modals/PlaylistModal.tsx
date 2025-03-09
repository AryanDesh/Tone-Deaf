import type React from "react"
import { X, Plus } from "lucide-react"
import type { Playlist } from "../utils/types"

interface PlaylistModalProps {
  playlists: Playlist[]
  togglePlaylistModal: () => void
}

const PlaylistModal: React.FC<PlaylistModalProps> = ({ playlists, togglePlaylistModal }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96 max-w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Add to Playlist</h2>
          <button onClick={togglePlaylistModal} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <ul className="space-y-2 mb-4">
          {playlists.map((playlist) => (
            <li
              key={playlist.id}
              className="flex items-center justify-between p-2 hover:bg-gray-700 rounded cursor-pointer"
            >
              <span>{playlist.name}</span>
              <button className="text-purple-500 hover:text-purple-400">
                <Plus size={20} />
              </button>
            </li>
          ))}
        </ul>
        <button className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition-colors">
          Create New Playlist
        </button>
      </div>
    </div>
  )
}

export default PlaylistModal


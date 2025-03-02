import type React from "react"
import { Users, Play } from "lucide-react"
import type { Playlist } from "../utils/types"

interface CollaborativePlaylistsProps {
  playlists: Playlist[]
}

const CollaborativePlaylists: React.FC<CollaborativePlaylistsProps> = ({ playlists }) => {
  return (
    <div className="bg-background-light rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">Collaborative Playlists</h2>
      <div className="space-y-4">
        {playlists.map((playlist) => (
          <div key={playlist.id} className="bg-hover-color rounded-lg p-4 transition-colors hover:bg-active-color">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-medium">{playlist.name}</h3>
              <span className="text-xs bg-primary-color text-white px-2 py-1 rounded flex items-center">
                <Users size={12} className="mr-1" /> Collaborative
              </span>
            </div>
            <p className="text-sm text-text-secondary mb-2">Created by {playlist.createdBy}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">{playlist.songCount} songs</span>
              <button className="text-primary-color hover:text-primary-light">
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


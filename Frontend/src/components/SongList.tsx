import type React from "react"
import { Heart, Pause } from "lucide-react"
import type { Song } from "../utils/types"

interface SongListProps {
  songs: Song[]
  currSong: Song | null
  isPlaying: boolean
  playSong: (song: Song) => void
  toggleLike: (id: string) => void
}

const SongList: React.FC<SongListProps> = ({ songs, currSong, isPlaying, playSong, toggleLike }) => {
  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">All Songs</h2>
      <table className="w-full">
        <thead>
          <tr className="text-left text-gray-400 border-b border-gray-700">
            <th className="pb-2">#</th>
            <th className="pb-2">Title</th>
            <th className="pb-2">Artist</th>
            <th className="pb-2">Album</th>
            <th className="pb-2">Duration</th>
            <th className="pb-2"></th>
          </tr>
        </thead>
        <tbody>
          {songs.map((song, index) => (
            <tr
              key={song.id}
              className={`hover:bg-gray-700 ${currSong?.id === song.id ? "bg-gray-700" : ""}`}
              onClick={() => playSong(song)}
            >
              <td className="py-2">{index + 1}</td>
              <td className="py-2 flex items-center">
                <div className="relative w-10 h-10 mr-3">
                  <img
                    src={song.coverArt || "/placeholder.svg"}
                    alt={song.title}
                    className="rounded"
                  />
                  {currSong?.id === song.id && isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                      <Pause size={16} className="text-white" />
                    </div>
                  )}
                </div>
                {song.title}
              </td>
              <td className="py-2">{song.artist}</td>
              <td className="py-2">{song.album}</td>
              <td className="py-2">{formatDuration(song.duration)}</td>
              <td className="py-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleLike(song.id)
                  }}
                  className={`text-2xl ${song.liked ? "text-red-500" : "text-gray-400 hover:text-white"}`}
                >
                  <Heart size={16} fill={song.liked ? "currentColor" : "none"} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

export default SongList


import type React from "react"
import { Heart, Pause } from "lucide-react"
import { useAudioContext } from "../context/"
import type { Song } from "../types/songTypes"
import { useCallback, useEffect } from "react"

interface SongListProps {
  songs: Song[]
  playSong: (song: Song) => void
}

const SongList: React.FC<SongListProps> = ({ songs, playSong }) => {
  const { currSong, isPlaying, toggleLike } = useAudioContext()
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">All Songs</h2>
      <table className="w-full">
        <thead>
          <tr className="text-left text-gray-400 border-b border-gray-700">
            <th className="pb-2 w-12">#</th>
            <th className="pb-2">Title</th>
            <th className="pb-2 hidden md:table-cell">Artist</th>
            <th className="pb-2 hidden lg:table-cell">Album</th>
            <th className="pb-2 w-20 text-right">Duration</th>
            <th className="pb-2 w-12"></th>
          </tr>
        </thead>
        <tbody>
          {songs.map((song, index) => (
            <tr
              key={song.id}
              className={`hover:bg-gray-700/50 cursor-pointer ${currSong?.id === song.id ? "bg-gray-700/50" : ""}`}
              onClick={() => playSong(song)}
            >
              <td className="py-3 text-gray-400">{index + 1}</td>
              <td className="py-3">
                <div className="flex items-center">
                  <div className="relative w-10 h-10 mr-3 rounded overflow-hidden">
                    <img
                      src={song.coverArt || "/placeholder.svg?height=40&width=40"}
                      alt={song.title}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                    {currSong?.id === song.id && isPlaying && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <Pause size={16} className="text-white" />
                      </div>
                    )}
                  </div>
                  <span className="font-medium">{song.title}</span>
                </div>
              </td>
              <td className="py-3 hidden md:table-cell text-gray-300">{song.artist}</td>
              <td className="py-3 hidden lg:table-cell text-gray-300">{song.album}</td>
              <td className="py-3 text-right text-gray-400">{formatDuration(song.duration || 0)}</td>
              <td className="py-3 text-right">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleLike(song.id)
                  }}
                  className={`${song.liked ? "text-pink-500" : "text-gray-400 hover:text-white"}`}
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

export default SongList


import type React from "react"
import { Play } from "lucide-react"
import type { Song } from "../utils/types"

interface RecommendedSongsProps {
  songs: Song[]
  playSong: (song: Song) => void
}

const RecommendedSongs: React.FC<RecommendedSongsProps> = ({ songs, playSong }) => {
  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Recommended for You</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {songs.map((song) => (
          <div key={song.id} className="relative group" onClick={() => playSong(song)}>
            <div className="relative w-full h-0 pb-[100%]">
              <img
                src={song.coverArt || "/placeholder.svg"}
                alt={song.title}
                className="rounded-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play size={40} className="text-white" />
              </div>
            </div>
            <h3 className="mt-2 font-medium text-white">{song.title}</h3>
            <p className="text-sm text-gray-400">{song.artist}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RecommendedSongs


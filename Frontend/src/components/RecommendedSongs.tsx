import type React from "react"
import { Play } from "lucide-react"
import type { Song } from "../types/songTypes"

interface RecommendedSongsProps {
  songs: Song[]
  playSong: (song: Song) => void
}

const RecommendedSongs: React.FC<RecommendedSongsProps> = ({ songs, playSong }) => {
  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Recommended for You</h2>
      <div className="grid grid-cols-2 gap-4">
        {songs.map((song) => (
          <div key={song.id} className="group relative cursor-pointer" onClick={() => playSong(song)}>
            <div className="relative aspect-square rounded-lg overflow-hidden">
              <img
                src={song.coverArt || "/placeholder.svg?height=200&width=200"}
                alt={song.title}
                width={200}
                height={200}
                className="object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play size={40} className="text-white" />
                </div>
              </div>
            </div>
            <div className="mt-2">
              <h3 className="font-medium text-white">{song.title}</h3>
              <p className="text-sm text-gray-400">{song.artist}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RecommendedSongs


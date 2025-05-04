import type React from "react"
import { Play } from "lucide-react"
import type { Song } from "../types/songTypes"

interface RecommendedSongsProps {
  songs: Song[]
  playSong: (song: Song) => void
  isLoading?: boolean
}

const RecommendedSongs: React.FC<RecommendedSongsProps> = ({ songs, playSong, isLoading = false }) => {
  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Recommended for You</h2>
      
      {isLoading ? (
        // Loading skeleton with grid layout to match the design
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square rounded-lg bg-gray-700"></div>
              <div className="mt-2">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : songs.length > 0 ? (
        // Normal display with songs
        <div className="grid grid-cols-2 gap-4">
          {songs.map((song) => (
            <div key={song.id} className="group relative cursor-pointer" onClick={() => playSong(song)}>
              <div className="relative aspect-square rounded-lg overflow-hidden">
                {song.coverArt ? (
                  <img
                    src={song.coverArt instanceof Blob ? URL.createObjectURL(song.coverArt) : song.coverArt}
                    alt={song.title}
                    width={200}
                    height={200}
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <img
                    src="/placeholder.svg?height=200&width=200"
                    alt={song.title}
                    width={200}
                    height={200}
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                )}
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
      ) : (
        // Empty state
        <div className="text-center py-8 text-gray-400">
          <div className="mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <h3 className="text-lg font-medium">No recommendations yet</h3>
          <p className="text-sm mt-2">Listen to more songs to get personalized recommendations</p>
        </div>
      )}
    </div>
  )
}

export default RecommendedSongs
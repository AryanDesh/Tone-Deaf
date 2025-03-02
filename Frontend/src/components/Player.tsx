import type React from "react"
import { Play, Pause, SkipBack, SkipForward, Heart, List } from "lucide-react"
import type { Song } from "../utils/types"

interface PlayerProps {
  currSong: Song | null
  isPlaying: boolean
  togglePlay: () => void
  toggleLike: (id: string) => void
  songQueue: Song[]
  togglePlaylistModal: () => void
}

const Player: React.FC<PlayerProps> = ({
  currSong,
  isPlaying,
  togglePlay,
  toggleLike,
  songQueue,
  togglePlaylistModal,
}) => {
  if (!currSong) return null

  return (
    <div className="grid grid-cols-3 p-4 bg-background-light border-t border-border-color z-10">
      <div className="flex items-center gap-4">
        <img
          src={currSong.coverArt || "/placeholder.svg"}
          alt={currSong.title}
          width={50}
          height={50}
          className="rounded"
        />
        <div>
          <div className="font-medium">{currSong.title}</div>
          <div className="text-sm text-text-secondary">{currSong.artist}</div>
        </div>
        <button
          className={`icon-button heart-button ${currSong.liked ? "active" : ""}`}
          onClick={() => toggleLike(currSong.id)}
        >
          <Heart size={18} fill={currSong.liked ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="flex flex-col items-center">
        <div className="flex items-center gap-4">
          <button className="icon-button">
            <SkipBack size={20} />
          </button>
          <button className="icon-button play-button" onClick={togglePlay}>
            {isPlaying ? <Pause size={28} /> : <Play size={28} />}
          </button>
          <button className="icon-button">
            <SkipForward size={20} />
          </button>
        </div>
        <div className="w-full mt-2 flex items-center gap-2">
          <span className="text-xs text-text-tertiary">0:00</span>
          <div className="flex-1 h-1 bg-hover-color rounded-full">
            <div className="h-full w-1/3 bg-gradient-to-r from-primary-color to-secondary-color rounded-full"></div>
          </div>
          <span className="text-xs text-text-tertiary">{formatDuration(currSong.duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4">
        <div className="text-sm text-text-secondary">
          <span>Next in queue: </span>
          {songQueue.length > 0 ? (
            <span className="text-text-primary">{songQueue[0].title}</span>
          ) : (
            <span className="text-text-tertiary italic">Queue empty</span>
          )}
        </div>
        <button className="icon-button" onClick={togglePlaylistModal}>
          <List size={20} />
        </button>
      </div>
    </div>
  )
}

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

export default Player


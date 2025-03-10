"use client"

import type React from "react"

import { Play, Pause, SkipBack, SkipForward, Heart, Volume2 } from "lucide-react"
// import Image from "next/image"
import { useAudioContext } from "../context"

const Player: React.FC = () => {
  const { currSong, isPlaying, togglePlay, toggleLike } = useAudioContext()

  if (!currSong) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/60 backdrop-filter backdrop-blur-lg border-t border-gray-800/50 z-10">
      {/* Glassmorphism effect for the currently playing song */}
      <div className="max-w-7xl mx-auto h-24 px-4 flex items-center justify-between relative overflow-hidden">
        {/* Glassmorphism background */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20 blur-xl scale-110"
            style={{ backgroundImage: `url(${currSong.coverArt || "/placeholder.svg"})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 to-pink-900/30" />
        </div>

        {/* Player content */}
        <div className="flex items-center space-x-4 z-10">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden shadow-lg">
            <img
              src={currSong.coverArt || "/placeholder.svg?height=64&width=64"}
              alt={currSong.title}
              width={64}
              height={64}
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="text-white font-medium">{currSong.title}</h3>
            <p className="text-gray-300 text-sm">{currSong.artist}</p>
          </div>
          <button
            onClick={() => toggleLike(currSong.id)}
            className={`text-2xl ${currSong.liked ? "text-pink-500" : "text-gray-400 hover:text-white"}`}
          >
            <Heart size={20} fill={currSong.liked ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="flex flex-col items-center z-10">
          <div className="flex items-center space-x-6 mb-2">
            <button className="text-gray-300 hover:text-white transition-colors">
              <SkipBack size={24} />
            </button>
            <button
              onClick={togglePlay}
              className="bg-white rounded-full p-2 text-gray-900 hover:bg-gray-200 transition-colors"
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <button className="text-gray-300 hover:text-white transition-colors">
              <SkipForward size={24} />
            </button>
          </div>
          <div className="w-64 h-1 bg-gray-700 rounded-full">
            <div className="w-1/3 h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
          </div>
        </div>

        <div className="flex items-center space-x-4 z-10">
          <Volume2 size={20} className="text-gray-400" />
          <div className="w-24 h-1 bg-gray-700 rounded-full">
            <div className="w-3/4 h-full bg-white rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Player


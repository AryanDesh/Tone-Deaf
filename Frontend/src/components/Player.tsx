import type React from "react"
import { Heart, Volume2 } from "lucide-react"
import { useAudioContext } from "../context"
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../utils/supe";
import AudioPlayer from "./AudioPlayer";

const Player: React.FC = () => {
  const { currSong, setCurrSong, isPlaying, togglePlay, toggleLike } = useAudioContext()

  if (!currSong) return null;

  const [imSrc, setImSrc] = useState('');

  const getImageFile = useCallback(async () => {
    const { data } = await supabase.storage.from('Songs-Chunks').getPublicUrl(`${currSong.id}/${currSong.id}.jpg`)
    setImSrc(data.publicUrl)
  }, [currSong])
  
  
  
  useEffect(() => {
    console.log(currSong)
  }, [currSong])

  useEffect(() => {
    getImageFile()
  }, [currSong, getImageFile])

  useEffect(() => {
    console.log(imSrc)
  }, [imSrc])

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/60 backdrop-filter backdrop-blur-lg border-t border-gray-800/50 z-1">
      {/* Glassmorphism effect for the currently playing song */}
      <div className="max-w-8xl mx-auto h-24 px-4 flex items-center justify-between relative overflow-hidden">
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
              src={imSrc}
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

        <div className="w-4/5 flex flex-col items-center z-10">
          <div className="w-full flex items-center space-x-6 mb-2">
            <div className="w-full h-full flex flex-col items-center justify-end py-10">
              <AudioPlayer src={currSong} setSrc={setCurrSong} />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Player


"use client"

import type React from "react"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { Song } from "../types/songTypes"

interface AudioContextType {
  currSong: Song | null
  setCurrSong: React.Dispatch<React.SetStateAction<Song>>
  isPlaying: boolean
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>
  songQueue: Song[]
  setSongQueue: React.Dispatch<React.SetStateAction<Song[]>>
  togglePlay: () => void
  toggleLike: (id: string) => void
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export const AudioContextProvider = ({ children }: { children: ReactNode }) => {
  const [currSong, setCurrSong] = useState<Song>({
    // const defaultSong : Song = {
      id: "cf6d246b-ece3-444f-80bd-65fd049ceb2e",
      artist: "Alan Walker",
      duration: 206,
      title: "The Spectre",
      album: "Unknown"
    // }
  })

  const [isPlaying, setIsPlaying] = useState(false)
  const [songQueue, setSongQueue] = useState<Song[]>([])

  const togglePlay = () => setIsPlaying(!isPlaying)

  const toggleLike = (id: string) => {
    if (currSong && currSong.id === id) {
      setCurrSong({
        ...currSong,
        liked: !currSong.liked,
      })
    }
  }

  return (
    <AudioContext.Provider
      value={{
        currSong,
        setCurrSong,
        isPlaying,
        setIsPlaying,
        songQueue,
        setSongQueue,
        togglePlay,
        toggleLike,
      }}
    >
      {children}
    </AudioContext.Provider>
  )
}

export const useAudioContext = () => {
  const context = useContext(AudioContext)
  if (!context) throw new Error("useAudioContext must be used within AudioContextProvider")
  return context
}


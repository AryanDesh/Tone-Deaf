import type React from "react"

import { type ReactNode, useState } from "react"
import { createContext, useContext } from "react"

interface Song {
  id: string
  artist: string
  duration: number
  title: string
  album: string
  coverArt?: string
  liked?: boolean
}

interface AudioContextType {
  currSong: Song
  setCurrSong: React.Dispatch<React.SetStateAction<Song>>
  songQueue: Song[]
  setSongQueue: React.Dispatch<React.SetStateAction<Song[]>>
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export const AudioContextProvider = ({ children }: { children: ReactNode }) => {
  const defaultSong: Song = {
    id: "cf6d246b-ece3-444f-80bd-65fd049ceb2e",
    artist: "Alan Walker",
    duration: 206,
    title: "The Spectre",
    album: "Unknown",
  }

  const [currSong, setCurrSong] = useState(defaultSong)
  const [songQueue, setSongQueue] = useState<Song[]>([])

  return (
    <AudioContext.Provider
      value={{
        currSong,
        setCurrSong,
        songQueue,
        setSongQueue,
      }}
    >
      {children}
    </AudioContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAudioContext = () => {
  const context = useContext(AudioContext)
  if (!context) throw new Error("useAudioContext must be used within AudioContextProvider")

  return context
}


import React, { createContext, useContext, useState, type ReactNode } from "react"
import type { Song } from "../types/songTypes"

// AudioContext Setup
interface AudioContextType {
  currSong: Song | null
  setCurrSong: (song :Song) => void
  isPlaying: boolean
  setIsPlaying: (bol :boolean) => void
  songQueue: Song[]
  setSongQueue: (Songs : Song[]) => void
  togglePlay: (bol: boolean) => void
  toggleLike: (id: string) => void
  coverArt: Blob | null
  setCoverArt: (coverArt :Blob) => void
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export const AudioContextProvider = ({ children }: { children: ReactNode }) => {
  const [currSong, setCurrSong] = useState<Song>({
    id: "cf6d246b-ece3-444f-80bd-65fd049ceb2e",
    artist: "Alan Walker",
    duration: 206,
    title: "The Spectre",
    album: "Unknown",
  })

  const [isPlaying, setIsPlaying] = useState(false)
  const [songQueue, setSongQueue] = useState<Song[]>([])
  const [coverArt, setCoverArt] = useState<Blob | null>(currSong.coverArt || null)

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
        coverArt,
        setCoverArt,
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

// CollabContext Setup
type CollabContextType = {
  isInCollab: boolean
  roomId: string | null
  isHost: boolean
  setHost: (bool : boolean , hostName? : string) => void
  setCollab: (roomId: string) => void
  leaveCollab: () => void
  hostName : string | null
}

const CollabContext = createContext<CollabContextType | undefined>(undefined)

export const CollabProvider = ({ children }: { children: ReactNode }) => {
  const [isInCollab, setIsInCollab] = useState(false)
  const [isHost, setIsHost] = useState(false)
  const [hostName, setHostName] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null)

  const setCollab = (id: string) => {
    setIsInCollab(true)
    setRoomId(id)
  }

  const setHost = (bool: boolean , hostName? : string) => {
    if(hostName) setHostName(hostName);
    setIsHost(bool);

  }

  const leaveCollab = () => {
    setIsInCollab(false)
    setRoomId(null)
    setIsHost(false)
  }

  return (
    <CollabContext.Provider value={{ isInCollab, roomId, setCollab, leaveCollab, isHost, setHost, hostName }}>
      {children}
    </CollabContext.Provider>
  )
}

export const useCollabContext = () => {
  const context = useContext(CollabContext)
  if (!context) throw new Error("useCollabContext must be used within CollabProvider")
  return context
}

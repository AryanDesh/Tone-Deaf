import React, { createContext, useContext, useState, type ReactNode } from "react"
import type { Song } from "../types/songTypes"

// Define node structure for doubly linked list
interface PlaylistNode {
  song: Song
  next: PlaylistNode | null
  prev: PlaylistNode | null
}

// Create a doubly linked list class for the playlist
class DoublyLinkedPlaylist {
  head: PlaylistNode | null
  tail: PlaylistNode | null
  current: PlaylistNode | null
  size: number
  name : string
  creator : string
  id : number | null

  constructor() {
    this.head = null
    this.tail = null
    this.current = null
    this.size = 0
    this.name = ""
    this.creator = ""
    this.id = null
  }

  updateInfo(playListId?: number, playlistCreator?: string, playlistName? : string) {
    if(playListId) this.id = playListId;
    if(playlistCreator) this.creator = playlistCreator;
    if(playlistName) this.name = playlistName;
    return;
  }
  // Set playlist from an array of songs
  fromArray(songs: Song[]): void {
    if (songs.length === 0) {
      this.head = null
      this.tail = null
      this.current = null
      this.size = 0
      return
    }

    // Create first node
    this.head = {
      song: songs[0],
      next: null,
      prev: null
    }
    
    this.current = this.head
    let currentNode = this.head
    this.size = songs.length

    // Create rest of the nodes
    for (let i = 1; i < songs.length; i++) {
      const newNode: PlaylistNode = {
        song: songs[i],
        next: null,
        prev: currentNode
      }
      currentNode.next = newNode
      currentNode = newNode
    }

    // Set the tail node
    this.tail = currentNode

    // Make it cyclic
    if (this.head && this.tail) {
      this.head.prev = this.tail
      this.tail.next = this.head
    }
  }

  // Get current song
  getCurrentSong(): Song | null {
    return this.current ? this.current.song : null
  }

  getPlaylistInfo() {
    return { playListName : this.name , playListId : this.id, playlistCreator : this.creator}
  }
  // Move to next song
  next(): Song | null {
    if (!this.current || !this.current.next) return null
    this.current = this.current.next
    return this.current.song
  }

  // Move to previous song
  prev(): Song | null {
    if (!this.current || !this.current.prev) return null
    this.current = this.current.prev
    return this.current.song
  }

  // Set current position to a specific song by id
  // Returns the song if found, null otherwise
  setCurrent(songId: string): Song | null {
    if (!this.head) return null

    let node = this.head
    do {
      if (node.song.id === songId) {
        this.current = node
        return node.song
      }
      if (!node.next) break
      node = node.next
    } while (node !== this.head)

    // Song not found in playlist, current pointer remains unchanged
    return null
  }

  // Get all songs as an array
  toArray(): Song[] {
    const result: Song[] = []
    if (!this.head) return result

    let node = this.head
    do {
      result.push(node.song)
      if (!node.next) break
      node = node.next
    } while (node !== this.head)

    return result
  }
}

// AudioContext Setup
interface AudioContextType {
  currSong: Song | null
  setCurrSong: (song: Song) => void
  isPlaying: boolean
  setIsPlaying: (bol: boolean) => void
  playlist: DoublyLinkedPlaylist
  setPlaylist: (songs: Song[], playlistId? : number , playlistCreator? : string , playlistName? : string) => void
  nextSong: () => void
  prevSong: () => void
  togglePlay: () => void
  toggleLike: (id: string) => void
  coverArt: Blob | null
  setCoverArt: (coverArt: Blob) => void
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

  const [currSong, setCurrSongState] = useState<Song | null>(defaultSong)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [coverArt, setCoverArt] = useState<Blob | null>(null)
  
  // Initialize the doubly linked playlist
  const [playlist] = useState<DoublyLinkedPlaylist>(() => {
    const initialPlaylist = new DoublyLinkedPlaylist()
    initialPlaylist.fromArray([defaultSong])
    return initialPlaylist
  })

  // Set the current song
  const setCurrSong = (song: Song) => {
    setCurrSongState(song)
    // Try to find and set the current song in the playlist
    // If the song doesn't exist in the playlist, leave the current pointer unchanged
    const found = playlist.setCurrent(song.id)
    if (!found) {
      console.log(`Song with id ${song.id} not found in the current playlist`)
      // Keep current pointer unchanged
    }
  }

  // Set playlist with new songs
  const setPlaylist = (songs: Song[], playlistId? : number , playlistCreator? : string , playlistName? : string ) => {
    // Save current song ID before changing playlist
    const currentSongId = currSong?.id 

    playlist.updateInfo(playlistId , playlistCreator, playlistName);
    // Update the playlist with new songs
    playlist.fromArray(songs)
    
    // Try to maintain the same current song if it exists in the new playlist
    if (currentSongId) {
      const found = playlist.setCurrent(currentSongId)
      if (!found) {
        // If current song doesn't exist in new playlist, set to first song
        const newCurrentSong = playlist.getCurrentSong()
        if (newCurrentSong) {
          setCurrSongState(newCurrentSong)
        }
      } else {
        // Update the current song state to match the found song
        // (in case properties other than ID have changed)
        setCurrSongState(found)
      }
    } else {
      // If there was no current song, set to first song of new playlist
      const newCurrentSong = playlist.getCurrentSong()
      if (newCurrentSong) {
        setCurrSongState(newCurrentSong)
      }
    }
  }

  // Navigate to next song
  const nextSong = () => {
    const next = playlist.next()
    if (next) {
      setCurrSongState(next)
    }
  }

  // Navigate to previous song
  const prevSong = () => {
    const prev = playlist.prev()
    if (prev) {
      setCurrSongState(prev)
    }
  }

  const togglePlay = () => setIsPlaying(!isPlaying)

  const toggleLike = (id: string) => {
    if (currSong && currSong.id === id) {
      const updatedSong = {
        ...currSong,
        liked: !currSong.liked,
      }
      setCurrSongState(updatedSong)
      
      // Update the song in the playlist
      const songs = playlist.toArray().map(song => 
        song.id === id ? { ...song, liked: !song.liked } : song
      )
      playlist.fromArray(songs)
      
      // Maintain the current position after updating playlist
      const currentSongId = currSong.id
      const found = playlist.setCurrent(currentSongId)
      if (!found) {
        console.log(`Error: Current song with id ${currentSongId} not found in updated playlist`)
      }
    }
  }

  return (
    <AudioContext.Provider
      value={{
        currSong,
        setCurrSong,
        isPlaying,
        setIsPlaying,
        playlist,
        setPlaylist,
        nextSong,
        prevSong,
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
  setHost: (bool: boolean, hostName?: string) => void
  setCollab: (roomId: string) => void
  leaveCollab: () => void
  hostName: string | null
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

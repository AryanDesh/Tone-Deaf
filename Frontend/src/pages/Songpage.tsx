"use client"

import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { useAudioContext, useCollabContext } from "../context"
import SongList from "../components/SongList"
import RecommendedSongs from "../components/RecommendedSongs"
import FriendsActivity from "../components/FriendsActivity"
import PlaylistModal from "../components/PlaylistModal"
import CollaborationModal from "../components/CollaborationModal"

import { mockSongs, mockPlaylists, mockFriends } from "../utils/mockData"
import { Song } from "../types/songTypes"
import { supabase } from "../utils/supe"
import { useSocketManager } from "../context/socket"
interface SongsPageProps {
  showPlaylistModal: boolean
  togglePlaylistModal: () => void
  showCollaborationModal: boolean
  toggleCollaborationModal: () => void
}

const SongsPage: React.FC<SongsPageProps> = ({
  showPlaylistModal,
  togglePlaylistModal,
  showCollaborationModal,
  toggleCollaborationModal,
}) => {
  const { setCurrSong, setIsPlaying, setSongQueue } = useAudioContext()
  const { isHost, isInCollab, roomId } = useCollabContext()

  const [allSongs, setAllSongs] = useState<Song[]>([])

  const songListRef = useRef<HTMLDivElement>(null)
  const recommendedRef = useRef<HTMLDivElement>(null)
  const friendsRef = useRef<HTMLDivElement>(null)
  const { socket} = useSocketManager()

  const getImages = async (songs: Song[]) => {
    const updatedSongs = await Promise.all(
      songs.map(async (song) => {
        try {
          const { data } = supabase.storage.from("Songs-Chunks").getPublicUrl(`${song.id}/${song.id}.jpg`)
          const response = await fetch(data.publicUrl)

          if (!response.ok) throw new Error("Failed to fetch cover image")

          const blob = await response.blob()
          return { ...song, coverArt: blob }
        } catch (error) {
          console.error(`Failed to load cover art for ${song.title}:`, error)
          return song
        }
      })
    )

    setAllSongs(updatedSongs)
    setSongQueue(updatedSongs)
  }

  const fetchAllSongs = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5000/api/song/allsongs")

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)

      const data = await response.json()
      console.log("Fetched Songs:", data)

      await getImages(data)
    } catch (error) {
      console.error("Fetching songs failed:", error)
    }
  }, [setSongQueue])

  useEffect(() => {
    fetchAllSongs()

    const ctx = gsap.context(() => {
      const animateSection = (ref: React.RefObject<HTMLDivElement>, delay = 0) => {
        if (ref.current) {
          gsap.from(ref.current, {
            opacity: 0,
            y: 20,
            duration: 0.8,
            delay,
            ease: "power3.out",
          })
        }
      }

      animateSection(songListRef)
      animateSection(recommendedRef, 0.3)
      animateSection(friendsRef, 0.5)
    })

    return () => ctx.revert()
  }, [fetchAllSongs])

  const playSong = (song: Song) => {
    console.log("Inside Play Song");
    if(roomId && isInCollab){
      console.log(roomId ,  isInCollab)
      socket.emit('stream-song', { roomCode: roomId, songId: song.id,  })
    }
    setCurrSong(song)
    setIsPlaying(true)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {isInCollab && (
        <div className="bg-blue-900 text-blue-100 px-4 py-2 rounded-md mb-4 text-sm flex items-center justify-between">
          <span>
            🎵 You’re in <strong>Collaboration Mode</strong>{!isHost && " (Viewer Only)"}.
          </span>
          {!isHost && (
            <span className="text-xs italic text-blue-300">Only host can control playback</span>
          )}
        </div>
      )}
      <div ref={songListRef}>
        <SongList songs={allSongs} playSong={playSong} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div ref={recommendedRef}>
          <RecommendedSongs songs={mockSongs.slice(0, 4)} playSong={playSong} />
        </div>

        <div ref={friendsRef}>
          <FriendsActivity friends={mockFriends} />
        </div>
      </div>

      {showPlaylistModal && (
        <PlaylistModal playlists={mockPlaylists} togglePlaylistModal={togglePlaylistModal} />
      )}

      {showCollaborationModal && (
        <CollaborationModal friends={mockFriends} toggleCollaborationModal={toggleCollaborationModal} />
      )}
    </div>
  )
}
export default SongsPage
"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { Play, Plus, MoreHorizontal } from "lucide-react"
import PlaylistModal from "../components/PlaylistModal"
import { useAudioContext } from "../context"
import axios from "axios"
import PlaylistDetailsModal from "../components/PlaylistDetailsModal"

interface Playlist {
  id: number
  name: string
  songCount?: number
  shared: boolean
  sharedIn?: {
    room: {
      id: number
      name: string
      code: string
      participants: Array<{
        id: string
        username: string
      }>
    }
  } | null
  songs?: Array<any>
}

interface PlaylistsPageProps {
  showPlaylistModal: boolean
  togglePlaylistModal: () => void
}

const PlaylistsPage: React.FC<PlaylistsPageProps> = ({ showPlaylistModal, togglePlaylistModal }) => {
  const pageRef = useRef<HTMLDivElement>(null)
  const playlistsRef = useRef<HTMLDivElement>(null)
  const recentRef = useRef<HTMLDivElement>(null)
  
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [sharedPlaylists, setSharedPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const { setPlaylist } = useAudioContext()

  // Fetch playlists from API
  const fetchPlaylists = async () => {
    setLoading(true)
    try {
      // Fetch private playlists
      const privateRes = await axios.get('http://localhost:5000/api/playlist/all-playlist', { 
        withCredentials: true 
      }) as any
      setPlaylists(privateRes.data)
      
      // Fetch shared playlists
      const sharedRes = await axios.get('http://localhost:5000/api/playlist/shared-playlist', { 
        withCredentials: true 
      }) as any
      setSharedPlaylists(sharedRes.data.playlists || [])
    } catch (err) {
      console.error("Error fetching playlists:", err)
      setError("Failed to load playlists")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlaylists()
  }, [])

  // Handle animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(pageRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: "power3.out",
      })

      gsap.from(playlistsRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.2,
        ease: "power3.out",
      })

      gsap.from(recentRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.4,
        ease: "power3.out",
      })
    })
    return () => ctx.revert()
  }, [])

  const handlePlaylistClick = async (playlist: Playlist) => {
    try {
      // Fetch detailed playlist data including songs
      const response = await axios.get(`http://localhost:5000/api/playlist/${playlist.id}`, {
        withCredentials: true
      }) as any
      
      const playlistWithSongs = {
        ...playlist,
        songs: response.data.songs.map((item: any) => item.song)
      }
      
      setSelectedPlaylist(playlistWithSongs)
      setShowDetailsModal(true)
    } catch (err) {
      console.error("Error fetching playlist details:", err)
      setError("Failed to load playlist details")
    }
  }

  const handlePlayPlaylist = async (playlist: Playlist) => {
    try {
      // Fetch detailed playlist data including songs
      const response = await axios.get(`http://localhost:5000/api/playlist/${playlist.id}`, {
        withCredentials: true
      }) as any
      
      const songs = response.data.songs.map((item: any) => item.song)
      
      // Set songs in the audio context
      setPlaylist(songs, playlist.id, "You", playlist.name)
    } catch (err) {
      console.error("Error playing playlist:", err)
      setError("Failed to play playlist")
    }
  }

  const toggleDetailsModal = () => {
    setShowDetailsModal(!showDetailsModal)
  }

  const refreshPlaylists = () => {
    fetchPlaylists()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={fetchPlaylists}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const allPlaylists = [...playlists, ...sharedPlaylists]
  const recentPlaylists = allPlaylists.slice(0, 4) // Just showing first 4 for recents

  return (
    <div ref={pageRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Playlists</h1>
        <button
          onClick={togglePlaylistModal}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus size={18} className="mr-2" /> Create Playlist
        </button>
      </div>

      <div ref={playlistsRef}>
        <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">All Playlists</h2>

          {allPlaylists.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>You don't have any playlists yet.</p>
              <p>Create a new playlist to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {allPlaylists.map((playlist) => (
                <div key={playlist.id} className="group">
                  <div className="relative aspect-square rounded-lg overflow-hidden mb-3 bg-gray-700">
                    <img
                      src={`/api/placeholder/200/200`}
                      alt={playlist.name}
                      width={200}
                      height={200}
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePlayPlaylist(playlist)
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-3 transform translate-y-2 group-hover:translate-y-0 transition-transform"
                      >
                        <Play size={24} className="text-gray-900" />
                      </button>
                    </div>
                  </div>
                  <div 
                    className="cursor-pointer"
                    onClick={() => handlePlaylistClick(playlist)}
                  >
                    <h3 className="font-medium text-white">{playlist.name}</h3>
                    <p className="text-sm text-gray-400">
                      {playlist.songs ? `${playlist.songs.length} songs` : "loading..."}
                    </p>
                    {playlist.shared && (
                      <span className="inline-block mt-1 text-xs bg-purple-600 text-white px-2 py-0.5 rounded">
                        Shared
                      </span>
                    )}
                    {playlist.sharedIn && (
                      <span className="inline-block ml-1 mt-1 text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                        Room: {playlist.sharedIn.room.code}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              <div
                className="flex items-center justify-center aspect-square rounded-lg border-2 border-dashed border-gray-600 hover:border-purple-500 transition-colors cursor-pointer"
                onClick={togglePlaylistModal}
              >
                <div className="text-center">
                  <Plus size={40} className="mx-auto text-gray-400" />
                  <p className="mt-2 text-gray-400">New Playlist</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div ref={recentRef}>
        <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Recently Played</h2>

          {recentPlaylists.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No recently played playlists</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentPlaylists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="flex items-center space-x-4 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer"
                  onClick={() => handlePlaylistClick(playlist)}
                >
                  <img
                    src={`/api/placeholder/60/60`}
                    alt={playlist.name}
                    width={60}
                    height={60}
                    className="rounded"
                  />

                  <div className="flex-1">
                    <h3 className="font-medium">{playlist.name}</h3>
                    <p className="text-sm text-gray-400">{playlist.songs ? `${playlist.songs.length} songs` : "loading..."}</p>
                  </div>

                  <div className="flex space-x-2">
                    <button 
                      className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700"
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePlayPlaylist(playlist)
                      }}
                    >
                      <Play size={18} />
                    </button>
                    <button className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showPlaylistModal && (
        <PlaylistModal 
          playlists={allPlaylists} 
          togglePlaylistModal={togglePlaylistModal} 
          refreshPlaylists={refreshPlaylists}
        />
      )}

      {showDetailsModal && selectedPlaylist && (
        <PlaylistDetailsModal 
          playlist={selectedPlaylist} 
          toggleModal={toggleDetailsModal} 
          setPlaylist={setPlaylist}
        />
      )}
    </div>
  )
}

export default PlaylistsPage
"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Play, Plus, MoreHorizontal } from "lucide-react"
import { mockPlaylists } from "../utils/mockData"
import PlaylistModal from "../components/PlaylistModal"

interface PlaylistsPageProps {
  showPlaylistModal: boolean
  togglePlaylistModal: () => void
}

const PlaylistsPage: React.FC<PlaylistsPageProps> = ({ showPlaylistModal, togglePlaylistModal }) => {
  const pageRef = useRef<HTMLDivElement>(null)
  const playlistsRef = useRef<HTMLDivElement>(null)
  const recentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Animations

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
  });
  return () => ctx.revert(); 
}, [])

  // Extended playlist data with images
  const extendedPlaylists = mockPlaylists.map((playlist) => ({
    ...playlist,
    coverArt: `/placeholder.svg?height=200&width=200`,
  }))

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

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {extendedPlaylists.map((playlist) => (
              <div key={playlist.id} className="group">
                <div className="relative aspect-square rounded-lg overflow-hidden mb-3">
                  <img
                    src={playlist.coverArt || "/placeholder.svg"}
                    alt={playlist.name}
                    width={200}
                    height={200}
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-3 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                      <Play size={24} className="text-gray-900" />
                    </button>
                  </div>
                </div>
                <h3 className="font-medium text-white">{playlist.name}</h3>
                <p className="text-sm text-gray-400">{playlist.songCount} songs</p>
                {playlist.collaborative && (
                  <span className="inline-block mt-1 text-xs bg-purple-600 text-white px-2 py-0.5 rounded">
                    Collaborative
                  </span>
                )}
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
        </div>
      </div>

      <div ref={recentRef}>
        <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Recently Played</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {extendedPlaylists.slice(0, 4).map((playlist) => (
              <div
                key={playlist.id}
                className="flex items-center space-x-4 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                <img
                  src={playlist.coverArt || "/placeholder.svg"}
                  alt={playlist.name}
                  width={60}
                  height={60}
                  className="rounded"
                />

                <div className="flex-1">
                  <h3 className="font-medium">{playlist.name}</h3>
                  <p className="text-sm text-gray-400">{playlist.songCount} songs</p>
                </div>

                <div className="flex space-x-2">
                  <button className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700">
                    <Play size={18} />
                  </button>
                  <button className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700">
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showPlaylistModal && <PlaylistModal playlists={mockPlaylists} togglePlaylistModal={togglePlaylistModal} />}
    </div>
  )
}

export default PlaylistsPage


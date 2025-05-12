"use client"

import React, { useState } from "react"
import { X, Plus, Check, Loader2 } from "lucide-react"
import axios from "axios"

interface Playlist {
  id: number
  name: string
  songCount?: number
  shared?: boolean
}

interface PlaylistModalProps {
  playlists: Playlist[]
  togglePlaylistModal: () => void
  refreshPlaylists: () => void
  currentSongId?: string
}

const PlaylistModal: React.FC<PlaylistModalProps> = ({ 
  playlists, 
  togglePlaylistModal, 
  refreshPlaylists,
  currentSongId 
}) => {
  const [newPlaylistName, setNewPlaylistName] = useState("")
  const [creating, setCreating] = useState(false)
  const [adding, setAdding] = useState<Record<number, boolean>>({})
  const [success, setSuccess] = useState<Record<number, boolean>>({})
  const [error, setError] = useState<string | null>(null)

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      setError("Please enter a playlist name")
      return
    }

    setCreating(true)
    setError(null)
    
    try {
      const response = await axios.post(
        'http://localhost:5000/api/playlist/create',
        { name: newPlaylistName },
        { withCredentials: true }
      ) as unknown as any
      
      if (currentSongId && response.data.playlist?.id) {
        await addSongToPlaylist(response.data.playlist.id, currentSongId)
      }
      
      refreshPlaylists()
      setNewPlaylistName("")
      togglePlaylistModal()
    } catch (err) {
      console.error("Error creating playlist:", err)
      setError("Failed to create playlist")
    } finally {
      setCreating(false)
    }
  }

  const addSongToPlaylist = async (playlistId: number, songId?: string) => {
    if (!songId) return
    
    setAdding(prev => ({ ...prev, [playlistId]: true }))
    setSuccess(prev => ({ ...prev, [playlistId]: false }))
    
    try {
      await axios.post(
        `http://localhost:5000/api/playlist/${playlistId}/add-song`,
        { songId },
        { withCredentials: true }
      )
      
      setSuccess(prev => ({ ...prev, [playlistId]: true }))
      
      // Reset success indication after a delay
      setTimeout(() => {
        setSuccess(prev => ({ ...prev, [playlistId]: false }))
      }, 2000)
    } catch (err) {
      console.error("Error adding song to playlist:", err)
      setError("Failed to add song to playlist")
    } finally {
      setAdding(prev => ({ ...prev, [playlistId]: false }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-filter backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96 max-w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {currentSongId ? "Add to Playlist" : "Create Playlist"}
          </h2>
          <button onClick={togglePlaylistModal} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {currentSongId && (
          <>
            <h3 className="text-lg font-medium mb-2">Select a playlist</h3>
            <ul className="space-y-2 mb-6 max-h-60 overflow-y-auto">
              {playlists.length > 0 ? (
                playlists.map((playlist) => (
                  <li
                    key={playlist.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-700 rounded cursor-pointer"
                  >
                    <span>{playlist.name}</span>
                    <button 
                      className="text-purple-500 hover:text-purple-400 p-1 rounded-full hover:bg-gray-600"
                      onClick={() => addSongToPlaylist(playlist.id, currentSongId)}
                      disabled={adding[playlist.id] || success[playlist.id]}
                    >
                      {adding[playlist.id] ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : success[playlist.id] ? (
                        <Check size={20} className="text-green-500" />
                      ) : (
                        <Plus size={20} />
                      )}
                    </button>
                  </li>
                ))
              ) : (
                <li className="text-center text-gray-400 py-4">
                  No playlists found. Create a new one below.
                </li>
              )}
            </ul>
            <div className="border-t border-gray-700 pt-4 mt-2">
              <h3 className="text-lg font-medium mb-2">Or create a new playlist</h3>
            </div>
          </>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-500 text-red-300 p-2 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="mb-4">
          <input
            type="text"
            placeholder="Playlist name"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            className="w-full bg-gray-700 text-white rounded p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        
        <button 
          className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition-colors flex items-center justify-center disabled:bg-purple-800 disabled:opacity-50"
          onClick={handleCreatePlaylist}
          disabled={creating || !newPlaylistName.trim()}
        >
          {creating ? (
            <>
              <Loader2 size={18} className="animate-spin mr-2" />
              Creating...
            </>
          ) : (
            "Create New Playlist"
          )}
        </button>
      </div>
    </div>
  )
}

export default PlaylistModal
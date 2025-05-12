"use client"

import React from "react"
import { X, Play, Clock, MoreHorizontal, Music } from "lucide-react"
import axios from "axios"
import type { Song } from "../types/songTypes"

interface Playlist {
  id: number
  name: string
  shared?: boolean
  songs?: Song[]
  sharedIn?: any
}

interface PlaylistDetailsModalProps {
  playlist: Playlist
  toggleModal: () => void
  setPlaylist: (songs: Song[], playlistId?: number, playlistCreator?: string, playlistName?: string) => void
}

const PlaylistDetailsModal: React.FC<PlaylistDetailsModalProps> = ({ 
  playlist, 
  toggleModal,
  setPlaylist
}) => {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  
  const handlePlaySong = (index: number) => {
    if (playlist.songs && playlist.songs.length > 0) {
      // Start playlist from the clicked song
      const reorderedSongs = [
        ...playlist.songs.slice(index),  // Songs from clicked index to end
        ...playlist.songs.slice(0, index) // Songs from beginning to clicked index
      ]
      
      setPlaylist(reorderedSongs, playlist.id, "You", playlist.name)
    }
  }
  
  const handlePlayAll = () => {
    if (playlist.songs && playlist.songs.length > 0) {
      setPlaylist(playlist.songs, playlist.id, "You", playlist.name)
    }
  }
  
  const removeSongFromPlaylist = async (songId: string) => {
    try {
        await axios.request({
            url: `http://localhost:5000/api/playlist/${playlist.id}/remove-song`,
            method: 'DELETE',
            data: { songId },
            withCredentials: true
          });          
      
      // Update the local playlist state
      // You'd need to implement state management here
      // This is just a placeholder
      
    } catch (err) {
      console.error("Error removing song from playlist:", err)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-filter backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-3/4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="bg-gray-700 w-16 h-16 rounded flex items-center justify-center mr-4">
              <Music size={32} className="text-gray-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{playlist.name}</h2>
              <p className="text-gray-400">{playlist.songs?.length || 0} songs</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handlePlayAll}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center"
              disabled={!playlist.songs?.length}
            >
              <Play size={18} className="mr-2" /> Play All
            </button>
            <button onClick={toggleModal} className="text-gray-400 hover:text-white">
              <X size={24} />
            </button>
          </div>
        </div>
        
        {playlist.shared && (
          <div className="bg-purple-900/30 border border-purple-500 rounded p-3 mb-6">
            <p className="text-purple-200">
              This playlist is shared {playlist.sharedIn && `in room: ${playlist.sharedIn.room.code}`}
            </p>
          </div>
        )}

        {playlist.songs && playlist.songs.length > 0 ? (
          <table className="w-full text-left">
            <thead className="text-gray-400 border-b border-gray-700">
              <tr>
                <th className="py-2 w-16">#</th>
                <th className="py-2">Title</th>
                <th className="py-2">Artist</th>
                <th className="py-2">Album</th>
                <th className="py-2 text-right">
                  <Clock size={16} />
                </th>
                <th className="py-2 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {playlist.songs.map((song, index) => (
                <tr 
                  key={song.id} 
                  className="border-b border-gray-700/50 hover:bg-gray-700/20 group"
                >
                  <td className="py-3 pl-2 w-16">
                    <div className="flex items-center justify-center w-8 h-8 group-hover:bg-gray-700 rounded-full">
                      <span className="group-hover:hidden">{index + 1}</span>
                      <Play 
                        size={16} 
                        className="hidden group-hover:block cursor-pointer"
                        onClick={() => handlePlaySong(index)}
                      />
                    </div>
                  </td>
                  <td className="py-3">{song.title}</td>
                  <td className="py-3 text-gray-300">{song.artist}</td>
                  <td className="py-3 text-gray-400">{song.album || '-'}</td>
                  <td className="py-3 text-right text-gray-400">
                    {formatDuration(song.duration || 0)}
                  </td>
                  <td className="py-3 text-right">
                    <div className="relative group/menu">
                      <button className="p-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-gray-700">
                        <MoreHorizontal size={16} />
                      </button>
                      <div className="absolute right-0 hidden group-hover/menu:block mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 w-48">
                        <ul>
                          <li>
                            <button 
                              className="w-full text-left px-4 py-2 hover:bg-gray-700 text-gray-300"
                              onClick={() => removeSongFromPlaylist(song.id)}
                            >
                              Remove from playlist
                            </button>
                          </li>
                          <li>
                            <button className="w-full text-left px-4 py-2 hover:bg-gray-700 text-gray-300">
                              Add to queue
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p className="mb-2">This playlist is empty</p>
            <p>Add songs to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PlaylistDetailsModal
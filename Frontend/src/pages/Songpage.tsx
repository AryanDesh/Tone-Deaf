"use client"

import type React from "react"

import { useCallback, useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { useAudioContext } from "../context"
import SongList from "../components/SongList"
import RecommendedSongs from "../components/RecommendedSongs"
import FriendsActivity from "../components/FriendsActivity"
import PlaylistModal from "../components/PlaylistModal"
import { mockSongs, mockPlaylists, mockFriends } from "../utils/mockData"
import { Song } from "../types/songTypes"

interface SongsPageProps {
  showPlaylistModal: boolean
  togglePlaylistModal: () => void
}

const SongsPage: React.FC<SongsPageProps> = ({ showPlaylistModal, togglePlaylistModal }) => {
  const { currSong, setCurrSong, isPlaying, setIsPlaying, setSongQueue } = useAudioContext()
  const [allSongs, setAllSongs] = useState<Song[]>([]);

  const fetchAllSongs = useCallback(async () => {
    const url = "http://localhost:5000/api/song/allsongs";
  
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log(data);
      
      // Uncomment to update state
      setSongQueue(data);
      setAllSongs(data);
  
    } catch (error) {
      console.error("Fetching songs failed:", error);
    }
  }, [setSongQueue]);
  

  // Refs for animations
  const songListRef = useRef<HTMLDivElement>(null)
  const recommendedRef = useRef<HTMLDivElement>(null)
  const friendsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // setSongQueue(mockSongs);
    console.log("Fetching songs..."); // Check if this logs
    fetchAllSongs()
    const ctx = gsap.context(() => {
      if (songListRef.current) {
        gsap.from(songListRef.current, {
          opacity: 0,
          y: 20,
          duration: 0.8,
          ease: "power3.out",
        });
      }
  
      if (recommendedRef.current) {
        gsap.from(recommendedRef.current, {
          opacity: 0,
          y: 20,
          duration: 0.8,
          delay: 0.3,
          ease: "power3.out",
        });
      }
  
      if (friendsRef.current) {
        gsap.from(friendsRef.current, {
          opacity: 0,
          y: 20,
          duration: 0.8,
          delay: 0.5,
          ease: "power3.out",
        });
      }
    });
  
    return () => ctx.revert(); // Cleanup animations when component unmounts
  }, []);

  const playSong = (song : Song) => {
    setCurrSong(song)
    setIsPlaying(true)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

      {showPlaylistModal && <PlaylistModal playlists={mockPlaylists} togglePlaylistModal={togglePlaylistModal} />}
    </div>
  )
}

export default SongsPage


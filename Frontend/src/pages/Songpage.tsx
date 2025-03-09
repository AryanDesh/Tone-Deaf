"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { gsap } from "gsap"
import { useAudioContext } from "../context/"
import Header from "../components/Header"
import Sidebar from "../components/Sidebar"
import Player from "../components/Player"
import SongList from "../components/SongList"
import RecommendedSongs from "../components/RecommendedSongs"
import CollaborationBlock from "../components/CollaborationBlock"
import FriendsActivity from "../components/FriendsActivity"
import SearchBar from "../components/SearchBar"
// import PlaylistModal from "../modals/PlayListModal"
import CollaborationModal from "../modals/CollaborationModal"

import type { Song, Playlist, Friend, CollaborationSession } from "../utils/types"
import '../styles/songpage.css'

const SongsPage: React.FC = () => {
  const { currSong, setCurrSong, songQueue, setSongQueue } = useAudioContext()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [songs, setSongs] = useState<Song[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [collaborationSessions, setCollaborationSessions] = useState<CollaborationSession[]>([])
  const [showPlaylistModal, setShowPlaylistModal] = useState(false)
  const [showCollaborationModal, setShowCollaborationModal] = useState(false)
  const [activeTab, setActiveTab] = useState("songs")

  // Refs for animations
  const songListRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<HTMLDivElement>(null)
  const recommendedBlockRef = useRef<HTMLDivElement>(null)
  const collaborationBlockRef = useRef<HTMLDivElement>(null)
  const friendsBlockRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Fetch mock data and set states
    const mockSongs: Song[] = [
      {
        id: "1",
        title: "Song 1",
        artist: "Artist 1",
        album: "Album 1",
        liked: false,
      },
      {
        id: "2",
        title: "Song 2",
        artist: "Artist 2",
        album: "Album 2",
        // url: "song2.mp3",
        liked: true,
      },
      // ... more mock songs
    ]
    const mockPlaylists: Playlist[] = [
      { id: "1", name: "Playlist 1", songs: [] },
      // ... more mock playlists
    ]
    const mockFriends: Friend[] = [
      { id: "1", name: "Friend 1" , avatar:"", online: true },
      // ... more mock friends
    ]
    const mockCollaborationSessions: CollaborationSession[] = [
      { id: "1", participants: [], song: mockSongs[0], name: "default" , active: true, createdBy:"" },
      // ... more mock collaboration sessions
    ]

    setSongs(mockSongs)
    setPlaylists(mockPlaylists)
    setFriends(mockFriends)
    setCollaborationSessions(mockCollaborationSessions)
    setSongQueue(mockSongs)

    // Initial animations
    gsap.from(songListRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.8,
      ease: "power3.out",
    })

    gsap.from(playerRef.current, {
      opacity: 0,
      y: 30,
      duration: 0.8,
      delay: 0.3,
      ease: "power3.out",
    })

    gsap.from(recommendedBlockRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.8,
      delay: 0.4,
      ease: "power3.out",
    })

    gsap.from(collaborationBlockRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.8,
      delay: 0.5,
      ease: "power3.out",
    })

    gsap.from(friendsBlockRef.current, {
      opacity: 0,
      x: 20,
      duration: 0.8,
      delay: 0.6,
      ease: "power3.out",
    })
  }, [setSongQueue]) // Added setSongQueue to dependencies

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
    gsap.to(".sidebar", {
      x: menuOpen ? "-100%" : "0%",
      duration: 0.3,
      ease: "power2.inOut",
    })
  }

  const toggleSearch = () => {
    setSearchOpen(!searchOpen)
    gsap.to(".search-container", {
      y: searchOpen ? "-100%" : "0%",
      opacity: searchOpen ? 0 : 1,
      duration: 0.3,
      ease: "power2.inOut",
    })
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
    gsap.to(".play-icon", {
      scale: 1.2,
      duration: 0.2,
      yoyo: true,
      repeat: 1,
      ease: "power2.out",
    })
  }

  const playSong = (song: Song) => {
    setCurrSong(song)
    setIsPlaying(true)
    gsap.fromTo(
      `#song-${song.id}`,
      { backgroundColor: "rgba(255, 255, 255, 0.05)" },
      {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        duration: 0.3,
        yoyo: true,
        repeat: 1,
      },
    )
  }

  const toggleLike = (id: string) => {
    setSongs(songs.map((song) => (song.id === id ? { ...song, liked: !song.liked } : song)))
    gsap.to(`#heart-${id}`, {
      scale: 1.3,
      duration: 0.2,
      yoyo: true,
      repeat: 1,
    })
  }

  const togglePlaylistModal = () => {
    setShowPlaylistModal(!showPlaylistModal)
    gsap.to(".playlist-modal", {
      y: showPlaylistModal ? 20 : 0,
      opacity: showPlaylistModal ? 0 : 1,
      duration: 0.3,
      ease: "power2.inOut",
    })
  }

  const toggleCollaborationModal = () => {
    setShowCollaborationModal(!showCollaborationModal)
    gsap.to(".collaboration-modal", {
      y: showCollaborationModal ? 20 : 0,
      opacity: showCollaborationModal ? 0 : 1,
      duration: 0.3,
      ease: "power2.inOut",
    })
  }

  const changeTab = (tab: string) => {
    setActiveTab(tab)
    gsap.fromTo(`.${tab}-content`, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" })
  }

  const filteredSongs = searchQuery
    ? songs.filter(
        (song) =>
          song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.album.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : songs

  return (
    <div className="min-h-screen bg-background-dark text-text-primary">
      <Header
        activeTab={activeTab}
        toggleMenu={toggleMenu}
        toggleSearch={toggleSearch}
        toggleCollaborationModal={toggleCollaborationModal}
        togglePlaylistModal={togglePlaylistModal}
        changeTab={changeTab}
      />
      <Sidebar
        menuOpen={menuOpen}
        toggleMenu={toggleMenu}
        activeTab={activeTab}
        changeTab={changeTab}
        playlists={playlists}
        friends={friends}
      />
      <SearchBar
        searchOpen={searchOpen}
        toggleSearch={toggleSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8" ref={songListRef}>
            <SongList
              songs={filteredSongs}
              currSong={currSong}
              isPlaying={isPlaying}
              playSong={playSong}
              toggleLike={toggleLike}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div ref={recommendedBlockRef}>
              <RecommendedSongs songs={songs.slice(0, 4)} playSong={playSong} />
            </div>
            <div ref={collaborationBlockRef}>
              <CollaborationBlock
                collaborationSessions={collaborationSessions}
                toggleCollaborationModal={toggleCollaborationModal}
              />
            </div>
            <div ref={friendsBlockRef}>
              <FriendsActivity friends={friends} />
            </div>
          </div>
        </div>
      </main>
      <div ref={playerRef}>
        <Player
          currSong={currSong}
          isPlaying={isPlaying}
          togglePlay={togglePlay}
          toggleLike={toggleLike}
          songQueue={songQueue}
          togglePlaylistModal={togglePlaylistModal}
        />
      </div>
      {showPlaylistModal && <PlaylistModal playlists={playlists} togglePlaylistModal={togglePlaylistModal} />}
      {showCollaborationModal && (
        <CollaborationModal friends={friends} toggleCollaborationModal={toggleCollaborationModal} />
      )}
    </div>
  )
}

export default SongsPage


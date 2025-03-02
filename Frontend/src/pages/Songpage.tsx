"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { gsap } from "gsap"
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Menu,
  X,
  Search,
  Heart,
  Clock,
  Music,
  List,
  Plus,
  Users,
  Share2,
  Headphones,
  Radio,
  BarChart2,
  UserPlus,
  MessageSquare,
} from "lucide-react"
import { useAudioContext } from "../context"
import "../styles/songpage.css";

// Types
interface Song {
  id: string
  title: string
  artist: string
  album: string
  duration: number
  coverArt?: string
  liked?: boolean
}

interface Playlist {
  id: string
  name: string
  songCount: number
  collaborative?: boolean
  createdBy?: string
}

interface Friend {
  id: string
  name: string
  avatar: string
  online: boolean
  currentlyPlaying?: {
    song: string
    artist: string
  }
}

interface CollaborationSession {
  id: string
  name: string
  participants: number
  active: boolean
  createdBy: string
}

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

const SongsPage: React.FC = () => {
  // Context
  const { currSong, setCurrSong, songQueue, setSongQueue } = useAudioContext()

  // State
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
  const menuRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const songListRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<HTMLDivElement>(null)
  const playlistModalRef = useRef<HTMLDivElement>(null)
  const collaborationModalRef = useRef<HTMLDivElement>(null)
  const friendsBlockRef = useRef<HTMLDivElement>(null)
  const collaborationBlockRef = useRef<HTMLDivElement>(null)
  const recommendedBlockRef = useRef<HTMLDivElement>(null)

  // Mock data initialization
  useEffect(() => {
    // Mock songs data
    const mockSongs: Song[] = [
      {
        id: "1",
        title: "Neon Horizon",
        artist: "Cyber Pulse",
        album: "Digital Dreams",
        duration: 225,
        coverArt: "/placeholder.svg?height=80&width=80",
        liked: true,
      },
      {
        id: "2",
        title: "Quantum Leap",
        artist: "Electron Wave",
        album: "Future State",
        duration: 252,
        coverArt: "/placeholder.svg?height=80&width=80",
        liked: false,
      },
      {
        id: "3",
        title: "Stellar Motion",
        artist: "Cosmic Drift",
        album: "Interstellar",
        duration: 238,
        coverArt: "/placeholder.svg?height=80&width=80",
        liked: true,
      },
      {
        id: "4",
        title: "Digital Pulse",
        artist: "Binary Echo",
        album: "Code Sequence",
        duration: 202,
        coverArt: "/placeholder.svg?height=80&width=80",
        liked: false,
      },
      {
        id: "5",
        title: "Synthetic Dreams",
        artist: "Neural Network",
        album: "AI Symphony",
        duration: 317,
        coverArt: "/placeholder.svg?height=80&width=80",
        liked: true,
      },
      {
        id: "6",
        title: "Holographic Memory",
        artist: "Virtual Construct",
        album: "Simulated Reality",
        duration: 273,
        coverArt: "/placeholder.svg?height=80&width=80",
        liked: false,
      },
      {
        id: "7",
        title: "Cybernetic Rhythm",
        artist: "Machine Pulse",
        album: "Automated Beats",
        duration: 229,
        coverArt: "/placeholder.svg?height=80&width=80",
        liked: true,
      },
      {
        id: "cf6d246b-ece3-444f-80bd-65fd049ceb2e",
        title: "The Spectre",
        artist: "Alan Walker",
        album: "Unknown",
        duration: 206,
        coverArt: "/placeholder.svg?height=80&width=80",
        liked: true,
      },
    ]

    // Mock playlists
    const mockPlaylists: Playlist[] = [
      { id: "1", name: "Favorites", songCount: 12 },
      { id: "2", name: "Chill Vibes", songCount: 8 },
      { id: "3", name: "Workout Mix", songCount: 15, collaborative: true, createdBy: "Alex" },
      { id: "4", name: "Focus Flow", songCount: 10 },
      { id: "5", name: "Party Mix", songCount: 18, collaborative: true, createdBy: "You" },
    ]

    // Mock friends
    const mockFriends: Friend[] = [
      {
        id: "1",
        name: "Alex",
        avatar: "/placeholder.svg?height=40&width=40",
        online: true,
        currentlyPlaying: {
          song: "Blinding Lights",
          artist: "The Weeknd",
        },
      },
      {
        id: "2",
        name: "Jordan",
        avatar: "/placeholder.svg?height=40&width=40",
        online: true,
      },
      {
        id: "3",
        name: "Taylor",
        avatar: "/placeholder.svg?height=40&width=40",
        online: false,
      },
      {
        id: "4",
        name: "Morgan",
        avatar: "/placeholder.svg?height=40&width=40",
        online: true,
        currentlyPlaying: {
          song: "Starboy",
          artist: "The Weeknd",
        },
      },
      {
        id: "5",
        name: "Casey",
        avatar: "/placeholder.svg?height=40&width=40",
        online: false,
      },
    ]

    // Mock collaboration sessions
    const mockCollaborationSessions: CollaborationSession[] = [
      { id: "1", name: "Weekend Party Mix", participants: 3, active: true, createdBy: "Alex" },
      { id: "2", name: "Road Trip Playlist", participants: 2, active: true, createdBy: "You" },
      { id: "3", name: "Study Session", participants: 4, active: false, createdBy: "Morgan" },
    ]

    setSongs(mockSongs)
    setPlaylists(mockPlaylists)
    setFriends(mockFriends)
    setCollaborationSessions(mockCollaborationSessions)

    // Set queue with a few songs
    setSongQueue([mockSongs[1], mockSongs[2], mockSongs[3]])

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

    gsap.from(friendsBlockRef.current, {
      opacity: 0,
      x: 20,
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

    gsap.from(recommendedBlockRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.8,
      delay: 0.6,
      ease: "power3.out",
    })
  }, [setSongQueue]) // Added setSongQueue to dependencies

  // Toggle menu with animation
  const toggleMenu = () => {
    if (menuOpen) {
      gsap.to(menuRef.current, {
        x: "-100%",
        duration: 0.5,
        ease: "power3.out",
        onComplete: () => setMenuOpen(false),
      })
    } else {
      setMenuOpen(true)
      gsap.fromTo(menuRef.current, { x: "-100%" }, { x: "0%", duration: 0.5, ease: "power3.out" })
    }
  }

  // Toggle search with animation
  const toggleSearch = () => {
    if (searchOpen) {
      gsap.to(searchRef.current, {
        y: "-100%",
        opacity: 0,
        duration: 0.4,
        ease: "power3.out",
        onComplete: () => {
          setSearchOpen(false)
          setSearchQuery("")
        },
      })
    } else {
      setSearchOpen(true)
      gsap.fromTo(
        searchRef.current,
        { y: "-100%", opacity: 0 },
        { y: "0%", opacity: 1, duration: 0.4, ease: "power3.out" },
      )
    }
  }

  // Toggle play/pause
  const togglePlay = () => {
    setIsPlaying(!isPlaying)

    // Animation for play button
    gsap.to(".play-icon", {
      scale: 1.2,
      duration: 0.2,
      yoyo: true,
      repeat: 1,
      ease: "power2.out",
    })
  }

  // Play a specific song
  const playSong = (song: Song) => {
    setCurrSong(song)
    setIsPlaying(true)

    // Animation for the selected song
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

  // Toggle like for a song
  const toggleLike = (id: string) => {
    setSongs(songs.map((song) => (song.id === id ? { ...song, liked: !song.liked } : song)))

    // Heart animation
    gsap.to(`#heart-${id}`, {
      scale: 1.3,
      duration: 0.2,
      yoyo: true,
      repeat: 1,
    })
  }

  // Toggle playlist modal
  const togglePlaylistModal = () => {
    if (showPlaylistModal) {
      gsap.to(playlistModalRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.3,
        ease: "power3.out",
        onComplete: () => setShowPlaylistModal(false),
      })
    } else {
      setShowPlaylistModal(true)
      gsap.fromTo(
        playlistModalRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, ease: "power3.out" },
      )
    }
  }

  // Toggle collaboration modal
  const toggleCollaborationModal = () => {
    if (showCollaborationModal) {
      gsap.to(collaborationModalRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.3,
        ease: "power3.out",
        onComplete: () => setShowCollaborationModal(false),
      })
    } else {
      setShowCollaborationModal(true)
      gsap.fromTo(
        collaborationModalRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, ease: "power3.out" },
      )
    }
  }

  // Change active tab
  const changeTab = (tab: string) => {
    setActiveTab(tab)

    // Animation for tab change
    gsap.fromTo(`.${tab}-content`, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" })
  }

  // Filter songs based on search query
  const filteredSongs = searchQuery
    ? songs.filter(
        (song) =>
          song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.album.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : songs

  return (
    <div className="songs-page">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <button className="icon-button menu-button" onClick={toggleMenu}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="app-title">ToneDeaf</h1>
        </div>
        <div className="header-tabs">
          <button className={`tab-button ${activeTab === "songs" ? "active" : ""}`} onClick={() => changeTab("songs")}>
            <Music size={18} />
            <span>Songs</span>
          </button>
          <button
            className={`tab-button ${activeTab === "playlists" ? "active" : ""}`}
            onClick={() => changeTab("playlists")}
          >
            <List size={18} />
            <span>Playlists</span>
          </button>
          <button
            className={`tab-button ${activeTab === "collaborate" ? "active" : ""}`}
            onClick={() => changeTab("collaborate")}
          >
            <Users size={18} />
            <span>Collaborate</span>
          </button>
          <button
            className={`tab-button ${activeTab === "friends" ? "active" : ""}`}
            onClick={() => changeTab("friends")}
          >
            <UserPlus size={18} />
            <span>Friends</span>
          </button>
        </div>
        <div className="header-right">
          <button className="icon-button" onClick={toggleSearch}>
            <Search size={24} />
          </button>
          <button className="icon-button" onClick={toggleCollaborationModal}>
            <Share2 size={24} />
          </button>
          <button className="icon-button" onClick={togglePlaylistModal}>
            <List size={24} />
          </button>
        </div>
      </header>

      {/* Search Bar */}
      {searchOpen && (
        <div className="search-container" ref={searchRef}>
          <input
            type="text"
            className="search-input"
            placeholder="Search songs, artists, or albums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          <button className="icon-button" onClick={toggleSearch}>
            <X size={20} />
          </button>
        </div>
      )}

      {/* Sidebar Menu */}
      {menuOpen && <div className="sidebar-overlay" onClick={toggleMenu}></div>}
      <div className="sidebar" ref={menuRef} style={{ transform: "translateX(-100%)" }}>
        <div className="sidebar-header">
          <h2>ToneDeaf</h2>
          <button className="icon-button" onClick={toggleMenu}>
            <X size={24} />
          </button>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li className={activeTab === "songs" ? "active" : ""} onClick={() => changeTab("songs")}>
              <Music size={18} /> Songs
            </li>
            <li className={activeTab === "playlists" ? "active" : ""} onClick={() => changeTab("playlists")}>
              <List size={18} /> Playlists
            </li>
            <li className={activeTab === "collaborate" ? "active" : ""} onClick={() => changeTab("collaborate")}>
              <Users size={18} /> Collaborate
            </li>
            <li className={activeTab === "friends" ? "active" : ""} onClick={() => changeTab("friends")}>
              <UserPlus size={18} /> Friends
            </li>
            <li>
              <Heart size={18} /> Favorites
            </li>
            <li>
              <Radio size={18} /> Radio
            </li>
            <li>
              <Headphones size={18} /> Discover
            </li>
            <li>
              <BarChart2 size={18} /> Stats
            </li>
          </ul>
        </nav>
        <div className="sidebar-playlists">
          <h3>Your Playlists</h3>
          <ul>
            {playlists.map((playlist) => (
              <li key={playlist.id}>
                {playlist.name}
                {playlist.collaborative && <span className="collaborative-badge">Collab</span>}
                <span className="playlist-count">{playlist.songCount}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="sidebar-friends">
          <h3>Online Friends</h3>
          <ul>
            {friends
              .filter((friend) => friend.online)
              .map((friend) => (
                <li key={friend.id} className="friend-item">
                  <div className="friend-avatar">
                    <img
                      src={friend.avatar || "/placeholder.svg"}
                      alt={friend.name}
                      width={24}
                      height={24}
                      className="avatar-image"
                    />
                    <span className="online-indicator"></span>
                  </div>
                  <div className="friend-info">
                    <span className="friend-name">{friend.name}</span>
                    {friend.currentlyPlaying && (
                      <span className="friend-playing">Listening to {friend.currentlyPlaying.song}</span>
                    )}
                  </div>
                </li>
              ))}
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-grid">
          {/* Songs Tab Content */}
          <div className={`songs-content ${activeTab === "songs" ? "active" : ""}`}>
            <div className="songs-header">
              <h2>All Songs</h2>
              <div className="songs-count">{songs.length} songs</div>
            </div>

            <div className="songs-list" ref={songListRef}>
              <div className="songs-list-header">
                <div className="song-number">#</div>
                <div className="song-info">Title</div>
                <div className="song-artist">Artist</div>
                <div className="song-album">Album</div>
                <div className="song-duration">
                  <Clock size={16} />
                </div>
              </div>

              {filteredSongs.length > 0 ? (
                filteredSongs.map((song, index) => (
                  <div
                    className={`song-item ${currSong?.id === song.id ? "active" : ""}`}
                    key={song.id}
                    id={`song-${song.id}`}
                    onClick={() => playSong(song)}
                  >
                    <div className="song-number">{index + 1}</div>
                    <div className="song-info">
                      <div className="song-cover">
                        <img
                          src={song.coverArt || "/placeholder.svg"}
                          alt={song.title}
                          width={40}
                          height={40}
                          className="cover-image"
                        />
                        {currSong?.id === song.id && isPlaying && (
                          <div className="playing-indicator">
                            <div className="bar"></div>
                            <div className="bar"></div>
                            <div className="bar"></div>
                          </div>
                        )}
                      </div>
                      <div className="song-title-artist">
                        <div className="song-title">{song.title}</div>
                      </div>
                    </div>
                    <div className="song-artist">{song.artist}</div>
                    <div className="song-album">{song.album}</div>
                    <div className="song-actions">
                      <button
                        className={`icon-button heart-button ${song.liked ? "active" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleLike(song.id)
                        }}
                        id={`heart-${song.id}`}
                      >
                        <Heart size={16} fill={song.liked ? "currentColor" : "none"} />
                      </button>
                      <div className="song-duration">{formatDuration(song.duration)}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-results">
                  <p>No songs found matching "{searchQuery}"</p>
                </div>
              )}
            </div>

            {/* Additional Content Blocks */}
            <div className="content-blocks">
              {/* Recommended Block */}
              <div className="content-block recommended-block" ref={recommendedBlockRef}>
                <h3>Recommended For You</h3>
                <div className="recommended-grid">
                  {songs.slice(0, 4).map((song) => (
                    <div className="recommended-item" key={song.id} onClick={() => playSong(song)}>
                      <div className="recommended-cover">
                        <img
                          src={song.coverArt || "/placeholder.svg"}
                          alt={song.title}
                          width={120}
                          height={120}
                          className="cover-image"
                        />
                        <div className="play-overlay">
                          <Play size={24} />
                        </div>
                      </div>
                      <div className="recommended-title">{song.title}</div>
                      <div className="recommended-artist">{song.artist}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Collaboration Block */}
              <div className="content-block collaboration-block" ref={collaborationBlockRef}>
                <div className="block-header">
                  <h3>Collaborative Sessions</h3>
                  <button className="action-button" onClick={toggleCollaborationModal}>
                    <Share2 size={16} />
                    Start Collaboration
                  </button>
                </div>
                <div className="collaboration-list">
                  {collaborationSessions.map((session) => (
                    <div className="collaboration-item" key={session.id}>
                      <div className="collaboration-info">
                        <div className="collaboration-name">{session.name}</div>
                        <div className="collaboration-details">
                          <span className="collaboration-participants">
                            <Users size={14} /> {session.participants} participants
                          </span>
                          <span className={`collaboration-status ${session.active ? "active" : ""}`}>
                            {session.active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                      <div className="collaboration-actions">
                        <button className="icon-button">
                          <MessageSquare size={18} />
                        </button>
                        <button className="join-button">{session.active ? "Join" : "View"}</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Friends Block */}
              <div className="content-block friends-block" ref={friendsBlockRef}>
                <h3>Friends Activity</h3>
                <div className="friends-list">
                  {friends.map((friend) => (
                    <div className="friend-activity-item" key={friend.id}>
                      <div className="friend-avatar">
                        <img
                          src={friend.avatar || "/placeholder.svg"}
                          alt={friend.name}
                          width={40}
                          height={40}
                          className="avatar-image"
                        />
                        <span className={`status-indicator ${friend.online ? "online" : "offline"}`}></span>
                      </div>
                      <div className="friend-activity-info">
                        <div className="friend-name">{friend.name}</div>
                        {friend.currentlyPlaying ? (
                          <div className="friend-playing">
                            <Headphones size={14} />
                            <span>
                              {friend.currentlyPlaying.song} - {friend.currentlyPlaying.artist}
                            </span>
                          </div>
                        ) : (
                          <div className="friend-status">{friend.online ? "Online" : "Offline"}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Playlists Tab Content */}
          <div className={`playlists-content ${activeTab === "playlists" ? "active" : ""}`}>
            <div className="playlists-header">
              <h2>Your Playlists</h2>
              <button className="action-button">
                <Plus size={16} />
                Create Playlist
              </button>
            </div>
            <div className="playlists-grid">
              {playlists.map((playlist) => (
                <div className="playlist-card" key={playlist.id}>
                  <div className="playlist-cover">
                    <img
                      src="/placeholder.svg?height=160&width=160"
                      alt={playlist.name}
                      width={160}
                      height={160}
                      className="cover-image"
                    />
                    <div className="play-overlay">
                      <Play size={32} />
                    </div>
                  </div>
                  <div className="playlist-info">
                    <div className="playlist-name">{playlist.name}</div>
                    <div className="playlist-details">
                      <span>{playlist.songCount} songs</span>
                      {playlist.collaborative && (
                        <span className="collaborative-tag">
                          <Users size={14} /> Collaborative
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Collaborate Tab Content */}
          <div className={`collaborate-content ${activeTab === "collaborate" ? "active" : ""}`}>
            <div className="collaborate-header">
              <h2>Collaboration Hub</h2>
              <button className="action-button" onClick={toggleCollaborationModal}>
                <Plus size={16} />
                New Session
              </button>
            </div>
            <div className="collaborate-grid">
              <div className="collaborate-section">
                <h3>Active Sessions</h3>
                <div className="sessions-list">
                  {collaborationSessions
                    .filter((session) => session.active)
                    .map((session) => (
                      <div className="session-card" key={session.id}>
                        <div className="session-info">
                          <div className="session-name">{session.name}</div>
                          <div className="session-details">
                            <span>Created by {session.createdBy}</span>
                            <span>{session.participants} participants</span>
                          </div>
                        </div>
                        <div className="session-actions">
                          <button className="action-button">
                            <MessageSquare size={16} />
                            Chat
                          </button>
                          <button className="primary-button">Join Session</button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              <div className="collaborate-section">
                <h3>Collaborative Playlists</h3>
                <div className="collab-playlists-list">
                  {playlists
                    .filter((playlist) => playlist.collaborative)
                    .map((playlist) => (
                      <div className="collab-playlist-item" key={playlist.id}>
                        <div className="collab-playlist-info">
                          <div className="collab-playlist-name">{playlist.name}</div>
                          <div className="collab-playlist-details">
                            <span>Created by {playlist.createdBy}</span>
                            <span>{playlist.songCount} songs</span>
                          </div>
                        </div>
                        <button className="icon-button">
                          <Play size={20} />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
              <div className="collaborate-section feature-section">
                <div className="feature-content">
                  <h3>Real-time Collaboration</h3>
                  <p>
                    Create and edit playlists together with friends in real-time. Chat, suggest songs, and vote on
                    additions.
                  </p>
                  <button className="primary-button">
                    <Share2 size={16} />
                    Start Collaborating
                  </button>
                </div>
                <div className="feature-image">
                  <img
                    src="/placeholder.svg?height=200&width=300"
                    alt="Collaboration Feature"
                    width={300}
                    height={200}
                    className="feature-img"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Friends Tab Content */}
          <div className={`friends-content ${activeTab === "friends" ? "active" : ""}`}>
            <div className="friends-header">
              <h2>Friends</h2>
              <button className="action-button">
                <UserPlus size={16} />
                Add Friend
              </button>
            </div>
            <div className="friends-grid">
              <div className="friends-section">
                <h3>Online Friends</h3>
                <div className="friends-list-grid">
                  {friends
                    .filter((friend) => friend.online)
                    .map((friend) => (
                      <div className="friend-card" key={friend.id}>
                        <div className="friend-avatar-large">
                          <img
                            src={friend.avatar || "/placeholder.svg"}
                            alt={friend.name}
                            width={80}
                            height={80}
                            className="avatar-image"
                          />
                          <span className="status-indicator online"></span>
                        </div>
                        <div className="friend-card-info">
                          <div className="friend-card-name">{friend.name}</div>
                          {friend.currentlyPlaying ? (
                            <div className="friend-card-playing">
                              <Headphones size={14} />
                              <span>{friend.currentlyPlaying.song}</span>
                            </div>
                          ) : (
                            <div className="friend-card-status">Online</div>
                          )}
                        </div>
                        <div className="friend-card-actions">
                          <button className="icon-button">
                            <MessageSquare size={18} />
                          </button>
                          <button className="icon-button">
                            <Headphones size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              <div className="friends-section">
                <h3>Offline Friends</h3>
                <div className="friends-list-grid">
                  {friends
                    .filter((friend) => !friend.online)
                    .map((friend) => (
                      <div className="friend-card offline" key={friend.id}>
                        <div className="friend-avatar-large">
                          <img
                            src={friend.avatar || "/placeholder.svg"}
                            alt={friend.name}
                            width={80}
                            height={80}
                            className="avatar-image grayscale"
                          />
                          <span className="status-indicator offline"></span>
                        </div>
                        <div className="friend-card-info">
                          <div className="friend-card-name">{friend.name}</div>
                          <div className="friend-card-status">Offline</div>
                        </div>
                        <div className="friend-card-actions">
                          <button className="icon-button">
                            <MessageSquare size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              <div className="friends-section feature-section">
                <div className="feature-content">
                  <h3>Friend Recommendations</h3>
                  <p>Discover new friends based on your music taste and listening habits.</p>
                  <button className="primary-button">
                    <UserPlus size={16} />
                    Explore Recommendations
                  </button>
                </div>
                <div className="feature-image">
                  <img
                    src="/placeholder.svg?height=200&width=300"
                    alt="Friend Recommendations"
                    width={300}
                    height={200}
                    className="feature-img"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Player */}
      {currSong && (
        <div className="player" ref={playerRef}>
          <div className="player-left">
            <div className="current-song-info">
              <img
                src={currSong.coverArt || "/placeholder.svg"}
                alt={currSong.title}
                width={50}
                height={50}
                className="current-cover"
              />
              <div className="current-details">
                <div className="current-title">{currSong.title}</div>
                <div className="current-artist">{currSong.artist}</div>
              </div>
              <button
                className={`icon-button heart-button ${currSong.liked ? "active" : ""}`}
                onClick={() => toggleLike(currSong.id)}
              >
                <Heart size={18} fill={currSong.liked ? "currentColor" : "none"} />
              </button>
            </div>
          </div>

          <div className="player-center">
            <div className="player-controls">
              <button className="icon-button">
                <SkipBack size={20} />
              </button>
              <button className="icon-button play-button" onClick={togglePlay}>
                <div className="play-icon">{isPlaying ? <Pause size={28} /> : <Play size={28} />}</div>
              </button>
              <button className="icon-button">
                <SkipForward size={20} />
              </button>
            </div>
            <div className="progress-container">
              <div className="time">0:00</div>
              <div className="progress-bar">
                <div className="progress" style={{ width: "30%" }}></div>
                <div className="progress-handle"></div>
              </div>
              <div className="time">{formatDuration(currSong.duration)}</div>
            </div>
          </div>

          <div className="player-right">
            <div className="queue-info">
              <span>Next in queue: </span>
              {songQueue.length > 0 ? (
                <span className="queue-song">{songQueue[0].title}</span>
              ) : (
                <span className="queue-empty">Queue empty</span>
              )}
            </div>
            <button className="icon-button" onClick={togglePlaylistModal}>
              <List size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Playlist Modal */}
      {showPlaylistModal && (
        <div className="modal-overlay" onClick={togglePlaylistModal}>
          <div className="playlist-modal" ref={playlistModalRef} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add to Playlist</h3>
              <button className="icon-button" onClick={togglePlaylistModal}>
                <X size={20} />
              </button>
            </div>
            <div className="playlist-list">
              {playlists.map((playlist) => (
                <div className="playlist-item" key={playlist.id}>
                  <div className="playlist-info">
                    <div className="playlist-name">{playlist.name}</div>
                    <div className="playlist-count">
                      {playlist.songCount} songs
                      {playlist.collaborative && (
                        <span className="collaborative-tag">
                          <Users size={14} /> Collaborative
                        </span>
                      )}
                    </div>
                  </div>
                  <button className="icon-button">
                    <Plus size={18} />
                  </button>
                </div>
              ))}
            </div>
            <button className="create-playlist-button">
              <Plus size={18} />
              Create New Playlist
            </button>
          </div>
        </div>
      )}

      {/* Collaboration Modal */}
      {showCollaborationModal && (
        <div className="modal-overlay" onClick={toggleCollaborationModal}>
          <div className="collaboration-modal" ref={collaborationModalRef} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Start Collaboration Session</h3>
              <button className="icon-button" onClick={toggleCollaborationModal}>
                <X size={20} />
              </button>
            </div>
            <div className="collaboration-form">
              <div className="form-group">
                <label>Session Name</label>
                <input type="text" placeholder="Enter session name..." />
              </div>
              <div className="form-group">
                <label>Invite Friends</label>
                <div className="friends-select">
                  {friends.map((friend) => (
                    <div className="friend-select-item" key={friend.id}>
                      <div className="friend-select-info">
                        <img
                          src={friend.avatar || "/placeholder.svg"}
                          alt={friend.name}
                          width={30}
                          height={30}
                          className="avatar-image"
                        />
                        <span>{friend.name}</span>
                        <span className={`status-dot ${friend.online ? "online" : "offline"}`}></span>
                      </div>
                      <input type="checkbox" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Session Type</label>
                <div className="radio-group">
                  <div className="radio-item">
                    <input type="radio" name="session-type" id="playlist" checked />
                    <label htmlFor="playlist">Collaborative Playlist</label>
                  </div>
                  <div className="radio-item">
                    <input type="radio" name="session-type" id="listening" />
                    <label htmlFor="listening">Group Listening</label>
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button className="secondary-button" onClick={toggleCollaborationModal}>
                  Cancel
                </button>
                <button className="primary-button">
                  <Share2 size={16} />
                  Start Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SongsPage


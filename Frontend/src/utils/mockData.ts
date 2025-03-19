import type { Song, Playlist, Friend, CollaborationSession } from "../types/songTypes"

export const mockSongs: Song[] = [
  {
    id: "1",
    title: "Neon Horizon",
    artist: "Cyber Pulse",
    album: "Digital Dreams",
    duration: 225,
    liked: true,
  },
  {
    id: "2",
    title: "Quantum Leap",
    artist: "Electron Wave",
    album: "Future State",
    duration: 252,
    liked: false,
  },
  {
    id: "3",
    title: "Stellar Motion",
    artist: "Cosmic Drift",
    album: "Interstellar",
    duration: 238,
    liked: true,
  },
  {
    id: "4",
    title: "Digital Pulse",
    artist: "Binary Echo",
    album: "Code Sequence",
    duration: 202,
    liked: false,
  },
]

export const mockPlaylists: Playlist[] = [
  { id: "1", name: "Favorites", songCount: 12 },
  { id: "2", name: "Chill Vibes", songCount: 8 },
  { id: "3", name: "Workout Mix", songCount: 15, collaborative: true, createdBy: "Alex" },
  { id: "4", name: "Focus Flow", songCount: 10 },
  { id: "5", name: "Party Mix", songCount: 18, collaborative: true, createdBy: "You" },
]

export const mockFriends: Friend[] = [
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
]

export const mockCollaborationSessions: CollaborationSession[] = [
  { id: "1", name: "Weekend Party Mix", participants: 3, active: true, createdBy: "Alex" },
  { id: "2", name: "Road Trip Playlist", participants: 2, active: true, createdBy: "You" },
  { id: "3", name: "Study Session", participants: 4, active: false, createdBy: "Morgan" },
]


export interface Song {
    id: string
    title: string
    artist: string
    album: string
    // duration: number
    coverArt?: string
    liked?: boolean
  }
  
  export interface Playlist {
    id: string
    name: string
    songs: string[]
    collaborative?: boolean
    createdBy?: string
  }
  
  export interface Friend {
    id: string
    name: string
    avatar: string
    online: boolean
    currentlyPlaying?: {
      song: string
      artist: string
    }
  }
  
  export interface CollaborationSession {
    id: string
    name: string
    participants: string[]
    active: boolean
    song: Song
    createdBy: string
  }
  
  export interface ChatMessage {
    id: string
    sender: string
    message: string
    timestamp: Date
  }
  
  
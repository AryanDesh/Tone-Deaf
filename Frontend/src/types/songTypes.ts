export interface Song {
    id: string
    title: string
    artist: string
    album: string | null
    duration: number | null
    coverArt?: Blob
    liked?: boolean
    url?: string
  }
  
  export interface Playlist {
    id: string
    name: string
    songCount: number
    collaborative?: boolean
    createdBy?: string
    songs?: Song[]
  }
  
  export interface Friend {
    id: string
    username: string
    avatar: string
    online?: boolean
    currentlyPlaying?: {
      song: string
      artist: string
    }
    mutualFriends? : number
  }
  
export interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: Date;
  messageType?: "incoming" | "outgoing" | "system"; 
}
  export interface CollaborationSession {
    id: string
    name: string
    participants: number
    active: boolean
    createdBy: string
    song?: Song
  }
  
  export interface ChatMessage {
    id: string
    sender: string
    message: string
    timestamp: Date
  }
  
  
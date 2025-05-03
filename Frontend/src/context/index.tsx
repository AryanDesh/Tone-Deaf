import React, { createContext, useContext, useState, type ReactNode, useCallback, useEffect } from "react"
import type { Song, Friend } from "../types/songTypes"
import axios from "axios"

// Define node structure for doubly linked list
interface PlaylistNode {
  song: Song
  next: PlaylistNode | null
  prev: PlaylistNode | null
}

// Create a doubly linked list class for the playlist
class DoublyLinkedPlaylist {
  head: PlaylistNode | null
  tail: PlaylistNode | null
  current: PlaylistNode | null
  size: number
  name : string
  creator : string
  id : number | null

  constructor() {
    this.head = null
    this.tail = null
    this.current = null
    this.size = 0
    this.name = ""
    this.creator = ""
    this.id = null
  }

  updateInfo(playListId?: number, playlistCreator?: string, playlistName? : string) {
    if(playListId) this.id = playListId;
    if(playlistCreator) this.creator = playlistCreator;
    if(playlistName) this.name = playlistName;
    return;
  }
  // Set playlist from an array of songs
  fromArray(songs: Song[]): void {
    if (songs.length === 0) {
      this.head = null
      this.tail = null
      this.current = null
      this.size = 0
      return
    }

    // Create first node
    this.head = {
      song: songs[0],
      next: null,
      prev: null
    }
    
    this.current = this.head
    let currentNode = this.head
    this.size = songs.length

    // Create rest of the nodes
    for (let i = 1; i < songs.length; i++) {
      const newNode: PlaylistNode = {
        song: songs[i],
        next: null,
        prev: currentNode
      }
      currentNode.next = newNode
      currentNode = newNode
    }

    // Set the tail node
    this.tail = currentNode

    // Make it cyclic
    if (this.head && this.tail) {
      this.head.prev = this.tail
      this.tail.next = this.head
    }
  }

  // Get current song
  getCurrentSong(): Song | null {
    return this.current ? this.current.song : null
  }

  getPlaylistInfo() {
    return { playListName : this.name , playListId : this.id, playlistCreator : this.creator}
  }
  // Move to next song
  next(): Song | null {
    if (!this.current || !this.current.next) return null
    this.current = this.current.next
    return this.current.song
  }

  // Move to previous song
  prev(): Song | null {
    if (!this.current || !this.current.prev) return null
    this.current = this.current.prev
    return this.current.song
  }

  // Set current position to a specific song by id
  // Returns the song if found, null otherwise
  setCurrent(songId: string): Song | null {
    if (!this.head) return null

    let node = this.head
    do {
      if (node.song.id === songId) {
        this.current = node
        return node.song
      }
      if (!node.next) break
      node = node.next
    } while (node !== this.head)

    // Song not found in playlist, current pointer remains unchanged
    return null
  }

  // Get all songs as an array
  toArray(): Song[] {
    const result: Song[] = []
    if (!this.head) return result

    let node = this.head
    do {
      result.push(node.song)
      if (!node.next) break
      node = node.next
    } while (node !== this.head)

    return result
  }
}

// AudioContext Setup
interface AudioContextType {
  currSong: Song | null
  setCurrSong: (song: Song) => void
  isPlaying: boolean
  setIsPlaying: (bol: boolean) => void
  playlist: DoublyLinkedPlaylist
  setPlaylist: (songs: Song[], playlistId? : number , playlistCreator? : string , playlistName? : string) => void
  nextSong: () => void
  prevSong: () => void
  togglePlay: () => void
  toggleLike: (id: string) => void
  coverArt: Blob | null
  setCoverArt: (coverArt: Blob) => void
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export const AudioContextProvider = ({ children }: { children: ReactNode }) => {
  const defaultSong: Song = {
    id: "cf6d246b-ece3-444f-80bd-65fd049ceb2e",
    artist: "Alan Walker",
    duration: 206,
    title: "The Spectre",
    album: "Unknown",
  }

  const [currSong, setCurrSongState] = useState<Song | null>(defaultSong)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [coverArt, setCoverArt] = useState<Blob | null>(null)
  
  // Initialize the doubly linked playlist
  const [playlist] = useState<DoublyLinkedPlaylist>(() => {
    const initialPlaylist = new DoublyLinkedPlaylist()
    initialPlaylist.fromArray([defaultSong])
    return initialPlaylist
  })

  // Set the current song
  const setCurrSong = (song: Song) => {
    setCurrSongState(song)
    // Try to find and set the current song in the playlist
    // If the song doesn't exist in the playlist, leave the current pointer unchanged
    const found = playlist.setCurrent(song.id)
    if (!found) {
      console.log(`Song with id ${song.id} not found in the current playlist`)
      // Keep current pointer unchanged
    }
  }

  // Set playlist with new songs
  const setPlaylist = (songs: Song[], playlistId? : number , playlistCreator? : string , playlistName? : string ) => {
    // Save current song ID before changing playlist
    const currentSongId = currSong?.id 

    playlist.updateInfo(playlistId , playlistCreator, playlistName);
    // Update the playlist with new songs
    playlist.fromArray(songs)
    
    // Try to maintain the same current song if it exists in the new playlist
    if (currentSongId) {
      const found = playlist.setCurrent(currentSongId)
      if (!found) {
        // If current song doesn't exist in new playlist, set to first song
        const newCurrentSong = playlist.getCurrentSong()
        if (newCurrentSong) {
          setCurrSongState(newCurrentSong)
        }
      } else {
        // Update the current song state to match the found song
        // (in case properties other than ID have changed)
        setCurrSongState(found)
      }
    } else {
      // If there was no current song, set to first song of new playlist
      const newCurrentSong = playlist.getCurrentSong()
      if (newCurrentSong) {
        setCurrSongState(newCurrentSong)
      }
    }
  }

  // Navigate to next song
  const nextSong = () => {
    const next = playlist.next()
    if (next) {
      setCurrSongState(next)
    }
  }

  // Navigate to previous song
  const prevSong = () => {
    const prev = playlist.prev()
    if (prev) {
      setCurrSongState(prev)
    }
  }

  const togglePlay = () => setIsPlaying(!isPlaying)

  const toggleLike = (id: string) => {
    if (currSong && currSong.id === id) {
      const updatedSong = {
        ...currSong,
        liked: !currSong.liked,
      }
      setCurrSongState(updatedSong)
      
      // Update the song in the playlist
      const songs = playlist.toArray().map(song => 
        song.id === id ? { ...song, liked: !song.liked } : song
      )
      playlist.fromArray(songs)
      
      // Maintain the current position after updating playlist
      const currentSongId = currSong.id
      const found = playlist.setCurrent(currentSongId)
      if (!found) {
        console.log(`Error: Current song with id ${currentSongId} not found in updated playlist`)
      }
    }
  }

  return (
    <AudioContext.Provider
      value={{
        currSong,
        setCurrSong,
        isPlaying,
        setIsPlaying,
        playlist,
        setPlaylist,
        nextSong,
        prevSong,
        togglePlay,
        toggleLike,
        coverArt,
        setCoverArt,
      }}
    >
      {children}
    </AudioContext.Provider>
  )
}

export const useAudioContext = () => {
  const context = useContext(AudioContext)
  if (!context) throw new Error("useAudioContext must be used within AudioContextProvider")
  return context
}

// CollabContext Setup
type CollabContextType = {
  isInCollab: boolean
  roomId: string | null
  isHost: boolean
  setHost: (bool: boolean, hostName?: string) => void
  setCollab: (roomId: string) => void
  leaveCollab: () => void
  hostName: string | null
}

const CollabContext = createContext<CollabContextType | undefined>(undefined)

export const CollabProvider = ({ children }: { children: ReactNode }) => {
  const [isInCollab, setIsInCollab] = useState(false)
  const [isHost, setIsHost] = useState(false)
  const [hostName, setHostName] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null)

  const setCollab = (id: string) => {
    setIsInCollab(true)
    setRoomId(id)
  }

  const setHost = (bool: boolean , hostName? : string) => {
    if(hostName) setHostName(hostName);
    setIsHost(bool);
  }
  const leaveCollab = () => {
    setIsInCollab(false)
    setRoomId(null)
    setIsHost(false)
  }

  return (
    <CollabContext.Provider value={{ isInCollab, roomId, setCollab, leaveCollab, isHost, setHost, hostName }}>
      {children}
    </CollabContext.Provider>
  )
}

export const useCollabContext = () => {
  const context = useContext(CollabContext)
  if (!context) throw new Error("useCollabContext must be used within CollabProvider")
  return context
}

// FriendsContext Setup
interface PendingRequest {
  requestId: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
  createdAt: string;
}

interface FriendsContextType {
  friends: Friend[];
  friendSuggestions: Friend[];
  pendingRequests: PendingRequest[];
  sentRequests: PendingRequest[];
  loading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  refreshFriends: () => Promise<void>;
  acceptFriendRequest: (friendId: string) => Promise<void>;
  rejectFriendRequest: (friendId: string) => Promise<void>;
  cancelFriendRequest: (friendId: string) => Promise<void>;
  sendFriendRequest: (friendId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
}

const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

export const FriendsProvider = ({ children }: { children: ReactNode }) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendSuggestions, setFriendSuggestions] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getFriends = async () => {
    try {
      const { data } = await axios.get<{ friends: Friend[] }>(
        "http://localhost:5000/api/friends/",
        { withCredentials: true }
      );
      setFriends(data.friends);
    } catch (error) {
      setError("Failed to load friends");
      console.error("Error fetching friends:", error);
      setFriends([]);
    }
  };

  const getFriendSuggestions = async () => {
    try {
      const { data } = await axios.get<{ suggestedFriends: Friend[] }>(
        "http://localhost:5000/api/friends/suggested",
        { withCredentials: true }
      );
      setFriendSuggestions(data.suggestedFriends);
    } catch (error) {
      setError("Failed to load suggestions");
      console.error("Error fetching friend suggestions:", error);
      setFriendSuggestions([]);
    }
  };

  const getPendingRequests = async () => {
    try {
      const { data } = await axios.get<{ pendingRequests: PendingRequest[] }>(
        "http://localhost:5000/api/friends/pending/received",
        { withCredentials: true }
      );
      setPendingRequests(data.pendingRequests);
    } catch (error) {
      setError("Failed to load pending requests");
      console.error("Error fetching pending requests:", error);
      setPendingRequests([]);
    }
  };

  const getSentRequests = async () => {
    try {
      const { data } = await axios.get<{ sentRequests: PendingRequest[] }>(
        "http://localhost:5000/api/friends/pending/sent",
        { withCredentials: true }
      );
      setSentRequests(data.sentRequests);
    } catch (error) {
      setError("Failed to load sent requests");
      console.error("Error fetching sent requests:", error);
      setSentRequests([]);
    }
  };

  const refreshFriends = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        getFriends(),
        getFriendSuggestions(),
        getPendingRequests(),
        getSentRequests()
      ]);
    } catch (error) {
      console.error("Error refreshing friends data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const acceptFriendRequest = async (friendId: string) => {
    try {
      await axios.post(
        `http://localhost:5000/api/friends/accept/${friendId}`,
        {},
        { withCredentials: true }
      );
      // Refresh data after accepting
      getPendingRequests();
      getFriends();
    } catch (error) {
      console.error("Error accepting friend request:", error);
      setError("Failed to accept friend request");
    }
  };

  const rejectFriendRequest = async (friendId: string) => {
    try {
      await axios.post(
        `http://localhost:5000/api/friends/reject/${friendId}`,
        {},
        { withCredentials: true }
      );
      // Refresh pending requests after rejecting
      getPendingRequests();
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      setError("Failed to reject friend request");
    }
  };

  const cancelFriendRequest = async (friendId: string) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/friends/request/${friendId}`,
        { withCredentials: true }
      );
      // Refresh sent requests after canceling
      getSentRequests();
    } catch (error) {
      console.error("Error canceling friend request:", error);
      setError("Failed to cancel friend request");
    }
  };

  const sendFriendRequest = async (friendId: string) => {
    try {
      await axios.post(
        `http://localhost:5000/api/friends/request/${friendId}`,
        {},
        { withCredentials: true }
      );
      // Refresh friend suggestions and sent requests
      getFriendSuggestions();
      getSentRequests();
    } catch (error) {
      console.error("Error sending friend request:", error);
      setError("Failed to send friend request");
    }
  };

  const removeFriend = async (friendId: string) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/friends/remove/${friendId}`,
        { withCredentials: true }
      );
      // Refresh friends list after removing
      getFriends();
      getFriendSuggestions();
    } catch (error) {
      console.error("Error removing friend:", error);
      setError("Failed to remove friend");
    }
  };

  // Initial data fetch
  useEffect(() => {
    refreshFriends();
  }, [refreshFriends]);

  return (
    <FriendsContext.Provider 
      value={{
        friends,
        friendSuggestions,
        pendingRequests,
        sentRequests,
        loading,
        error,
        setError,
        refreshFriends,
        acceptFriendRequest,
        rejectFriendRequest,
        cancelFriendRequest,
        sendFriendRequest,
        removeFriend
      }}
    >
      {children}
    </FriendsContext.Provider>
  );
};

export const useFriendsContext = () => {
  const context = useContext(FriendsContext);
  if (!context) throw new Error("useFriendsContext must be used within FriendsProvider");
  return context;
};
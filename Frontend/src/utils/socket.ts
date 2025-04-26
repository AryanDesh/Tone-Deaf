import { io, Socket } from 'socket.io-client';
import { Song } from '../types/songTypes';

export type Message = {
  sender: string;
  content: string;
};

export type StreamSongPayload = {
  roomCode: string;
  songId: string;
};

export type IUser = {
  id : string,
  username : string,
  playlist? : [],
  likedId? : string,
  followers? : [],
  following? : [],
  room? :[]
}

export type ICreatePlaylist = { playlistName : string, roomCode: string, songId :string };
export type IAddSongToPlaylist = { playlistId: string, roomCode: string, songId :string };

// Server -> Client
export type ServerToClientEvents = {
  'room-created': (roomId: string) => void;
  'receive-message': (message: Message) => void;
  'user-joined': (data: { userId: string }) => void;
  'user-left-room': (data: { userId: string }) => void;
  'song-streamed': (data: { song: Song; user: IUser }) => void;
  'song-paused' : (data : {song : Song; userId : string}) => void;
  'playlist-created' : (
    data : {
      playlist: {
      id: string,
      name: string,
      songs: Song[]
    },
    createdBy: IUser,
    initialSong?: Song,}) => void;
  'song-added-to-playlist' : (data : {song : Song}) => void;
  'Error': (msg: string) => void;
};

// Client -> Server
export type ClientToServerEvents = {
  'create-room': (name: string) => void;
  'join-room': (roomId: string) => void;
  'leave-room': (roomId: string) => void;
  'send-message': (message: Message, roomId: string) => void;
  'stream-song': (data: StreamSongPayload) => void;
  'pause-song' : (data : StreamSongPayload) => void;
  'create-playlist' : (data : ICreatePlaylist ) => void;
  'add-song-to-playlist' : (data : IAddSongToPlaylist) =>  void;
};

const Socket_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000/collab";

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(Socket_URL, {
  transports: ["websocket", "polling"],
  autoConnect: false
});

socket.on("connect", () => {
  console.log("Connected to Socket.IO server 1");
});

socket.on("disconnect", () => {
  console.log("Disconnected from Socket.IO server");
});

export default socket;

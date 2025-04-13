import { io, Socket } from 'socket.io-client';

export type Message = {
  sender: string;
  content: string;
};

export type StreamSongPayload = {
  roomId: string;
  songId: string;
  userId: string;
};

// Server -> Client
export type ServerToClientEvents = {
  'room-created': (roomId: string) => void;
  'receive-message': (message: Message) => void;
  'user-joined': (data: { userId: string }) => void;
  'user-left-room': (data: { userId: string }) => void;
  'song-streamed': (data: { songId: string; userId: string }) => void;
  'Error': (msg: string) => void;
};

// Client -> Server
export type ClientToServerEvents = {
  'create-room': (name: string) => void;
  'join-room': (roomId: string) => void;
  'leave-room': (roomId: string) => void;
  'send-message': (message: Message, roomId: string) => void;
  'stream-song': (data: StreamSongPayload) => void;
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

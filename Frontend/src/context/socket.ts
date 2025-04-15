import { useEffect, useRef, useCallback } from "react";
import socket from "../utils/socket";
import { useCollabContext, useAudioContext } from "../context";
import type { Message } from "../utils/socket";

// This ensures listeners are only bound once.
let listenersBound = false;

export const useSocketManager = () => {
  const { setCollab, setHost } = useCollabContext();
  const { setCurrSong, setIsPlaying } = useAudioContext();

  const connectSocket = useCallback(() => {
    if (!socket.connected) {
      socket.connect();
      console.log("✅ Socket connected");
    }

    if (!listenersBound) {
      socket.on("room-created", (roomId: string) => {
        console.log("Room created:", roomId);
        setCollab(roomId);
        setHost();
      });

      socket.on("receive-message", (update: Message) => {
        console.log("Message received:", update);
      });

      socket.on("song-streamed", ({ song }: any) => {
        setCurrSong(song);
        setIsPlaying(true);
      });

      socket.on("user-joined", ({ userId }: any) => {
        console.log("User joined:", userId);
      });

      socket.on("user-left-room", ({ userId }: any) => {
        console.log("User left:", userId);
      });

      socket.on("Error", (msg: string) => {
        alert(msg);
      });

      listenersBound = true;
      console.log("🎧 Socket event listeners bound");
    }
  }, [setCollab, setHost, setCurrSong, setIsPlaying]);

  const disconnectSocket = useCallback(() => {
    if (socket.connected) {
      socket.disconnect();
      console.log("❌ Socket disconnected");
    }
  }, []);

  return { socket, connectSocket, disconnectSocket };
};

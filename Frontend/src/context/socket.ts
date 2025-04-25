import { useCallback } from "react";
import socket from "../utils/socket";
import { useCollabContext, useAudioContext } from "../context";
import type { Message } from "../utils/socket";

let connected = false;
let listenersBound = false;

export const useSocketManager = () => {
  const { setCollab, setHost } = useCollabContext();
  const { setCurrSong, setIsPlaying } = useAudioContext();
  
  const connectSocket = useCallback(() => {
    if (!connected) {
      socket.connect();
      connected = true;
      console.log("✅ Socket connected");
    }
    
    // bind all your listeners exactly once
    if (!listenersBound) {
      socket.on("room-created", (code: string) => {
        console.log("Room created:", code);
        setCollab(code);
        setHost();
      });
      
      // Remove the receive-message handler from here since it's handled in CollaborationPage
      
      socket.on("song-streamed", ({ song }: any) => {
        setCurrSong(song);
        setIsPlaying(true);
      });
      
      socket.on("user-joined", ({ userId }: any) => console.log("User joined:", userId));
      socket.on("user-left-room", ({ userId }: any) => console.log("User left:", userId));
      socket.on("Error", (msg: string) => alert(msg));
      
      listenersBound = true;
    }
  }, [setCollab, setHost, setCurrSong, setIsPlaying]);
  
  return { socket, connectSocket };
};
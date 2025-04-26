import { useCallback, useEffect } from "react";
import socket from "../utils/socket";
import { useCollabContext, useAudioContext } from "../context";
import type { IUser, Message } from "../utils/socket";
import { Song } from "../types/songTypes";

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
        setHost(true);
      });
      
      socket.on("song-streamed", ({ song, user }: {song: Song; user: IUser}) => {
        console.log("Song streamed:", song.title, "by", user.username);
        setCurrSong(song);
        setHost(false, user.username);
        setIsPlaying(true);
      });
      
      socket.on("song-paused", ({ song, userId }: {song: Song; userId: string}) => {
        console.log("Song paused:", song.title, "by user", userId);
        setIsPlaying(false);
      });
      
      socket.on("playlist-created", (data: {
        playlist: {
          id: string,
          name: string,
          songs: Song[]
        },
        createdBy: IUser,
        initialSong?: Song,
      }) => {
        console.log("Playlist created:", data.playlist.name, "by", data.createdBy.username);
        // The main handling of this event will be in the CollaborationPage component
      });
      
      socket.on("song-added-to-playlist", ( data : {song: Song}) => {
        console.log("Song added to playlist:", data.song.title);
        // The main handling of this event will be in the CollaborationPage component
      });
      
      socket.on("user-joined", ({ userId }: {userId: string}) => {
        console.log("User joined:", userId);
      });
      
      socket.on("user-left-room", ({ userId }: {userId: string}) => {
        console.log("User left:", userId);
      });
      
      socket.on("Error", (msg: string) => {
        console.error("Socket error:", msg);
        alert(msg);
      });
      
      listenersBound = true;
    }
  }, [setCollab, setHost, setCurrSong, setIsPlaying]);
  
  return { socket, connectSocket };
};
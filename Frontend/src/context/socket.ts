import { useCallback, useEffect } from "react";
import socket from "../utils/socket";
import { useCollabContext, useAudioContext } from "../context";
import type { IUser, Message } from "../utils/socket";
import { Song } from "../types/songTypes";

let connected = false;
let listenersBound = false;

export const useSocketManager = () => {
  const { setCollab, setHost } = useCollabContext();
  const { 
    setCurrSong, 
    setIsPlaying, 
    setPlaylist, 
    currSong,
  } = useAudioContext();
  
  
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
        
        // Update current song
        setCurrSong(song);
        setHost(false, user.username);
        setIsPlaying(true);
      });

      socket.on("song-played", ({ userId }: { userId: string}) => {
        console.log("Song played:", currSong, "by user", userId);
        setIsPlaying(true);
      });
      
      socket.on("song-paused", ({ userId }: { userId: string}) => {
        console.log("Song paused:", currSong, "by user", userId);
        setIsPlaying(false);
      });
      
      socket.on("playlist-created", (data: {
        playlist: {
          id: number,
          name: string,
          songs: Song[]
        },
        createdBy: IUser,
        initialSong?: Song,
      }) => {
        console.log("Playlist created:", data.playlist.name, "by", data.createdBy.username);
        
        // Set this as the current playlist
        setPlaylist(data.playlist.songs, data.playlist.id, data.playlist.name , data.createdBy.username);
        
        // If there's an initial song, start playing it
        if (data.initialSong) {
          setCurrSong(data.initialSong);
          setIsPlaying(true);
        }
      });
      
      socket.on("song-added-to-playlist", (data : {playlist : {
        playlistId: number,
        name: string,
        createdBy: {
          id: string,
          username: string
        },
        songs : Song[]} ,
        song : Song}) => {
        console.log("Song added to playlist:", data.song.title);
        setPlaylist(data.playlist.songs, data.playlist.playlistId, data.playlist.name , data.playlist.createdBy.username);
      });
      
      socket.on("user-joined", ({ userId }: {userId: string}) => {
        console.log("User joined:", userId);
      });
      
      socket.on("user-left-room", ({ userId }: {userId: string}) => {
        console.log("User left:", userId);
      });
      
      socket.on("error", (msg: string) => {
        console.error("Socket error:", msg);
        alert(msg);
      });
      
      listenersBound = true;
    }
  }, [setCollab, setHost, setCurrSong, setIsPlaying]);
  
  return { socket, connectSocket };
};
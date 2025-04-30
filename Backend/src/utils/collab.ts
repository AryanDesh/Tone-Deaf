import { prisma } from '../db';
import { io, pubClient } from "..";
import { randomUUID } from "node:crypto";
import { Prisma } from '@prisma/client';

export const sockets = () => {
  io.of('/collab').on('connection', (socket) => {
    console.log(`🔥 /collab connect: socket=${socket.id} user=${socket.userId}`);

    const userId = socket.userId!;
    const presenceKey = `presence:user:${userId}`;

    // Presence TTL heartbeat
    const setPresence = async () => {
      try {
        await pubClient!.set(presenceKey, 'online', 'EX', 60);
      } catch (error) {
        console.error('Failed to set presence:', error);
        // Continue execution - presence is non-critical
      }
    };
    
    setPresence();
    const heartbeat = setInterval(setPresence, 20000);

    // CREATE ROOM
    socket.on("create-room", async (name: string) => {
      try {
        const code = randomUUID();
        socket.join(code);

        const room = await prisma.room.create({
          data: { name, code, hostId: userId },
        });

        await prisma.userInRoom.create({
          data: { roomId: room.id, userId },
        });

        console.log(`Room created: id=${room.id} code=${code} by user=${userId}`);
        socket.emit("room-created", code);
      } catch (error) {
        handleSocketError(socket, error, "Failed to create room");
      }
    });

    // JOIN ROOM
    socket.on("join-room", async (code: string) => {
      try {
        const room = await prisma.room.findUnique({ where: { code } });
        if (!room) {
          socket.emit("error", "Invalid room code");
          return;
        }

        socket.join(code);

        try {
          await prisma.userInRoom.create({
            data: { roomId: room.id, userId },
          });
        } catch (error) {
          // Handle unique constraint violation (user already in room)
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
              // User already in room, this is fine, continue
              console.log(`User ${userId} already in room ${room.id}`);
            } else {
              throw error; // Re-throw non-constraint errors
            }
          } else {
            throw error;
          }
        }

        console.log(`User ${userId} joined room id=${room.id} code=${code}`);
        io.of("/collab").to(code).emit("user-joined", { userId });
      } catch (error) {
        handleSocketError(socket, error, "Failed to join room");
      }
    });

    // CHAT
    socket.on("send-message", (message, roomCode) => {
      try {
        socket.to(roomCode).emit("receive-message", message);
      } catch (error) {
        handleSocketError(socket, error, "Failed to send message");
      }
    });

    // STREAM SONG
    socket.on("stream-song", async ({ songId, roomCode }) => {
      try {
        await prisma.streamLog.create({
          data: { userId, songId, streamedAt: new Date() },
        });
        
        const [user, song] = await Promise.all([
          prisma.user.findUnique({ where: { id: userId }, select: { id: true, username: true } }),
          prisma.song.findUnique({ where: { id: songId } })
        ]);
        
        if (!song) {
          socket.emit("error", "Song not found");
          return;
        }
        
        console.log("Streamed Song", song, roomCode);
        socket.to(roomCode).emit("song-streamed", { song, user });
      } catch (error) {
        handleSocketError(socket, error, "Failed to stream song");
      }
    });
    
    socket.on("create-playlist", async ({ playlistName, roomCode, songId }) => {
      try {
        const room = await prisma.room.findUnique({
          where: { code: roomCode },
          select: { id: true }
        });
    
        if (!room) {
          socket.emit("error", "Invalid room code");
          return;
        }
    
        // Use transaction to ensure data consistency
        const { newPlaylist, sharedPlaylist } = await prisma.$transaction(async (tx) => {
          const newPlaylist = await tx.playlist.create({
            data: {
              name: playlistName,
              userId: userId,
              shared: true,
            }
          });
          
          const sharedPlaylist = await tx.sharedPlaylist.create({
            data: {
              roomId: room.id,
              playlistId: newPlaylist.id,
            },
            include: {
              playlist: {
                include: {
                  playlistSong: {
                    include: { song: true }
                  }
                }
              }
            }
          });
          
          return { newPlaylist, sharedPlaylist };
        });
    
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, username: true }
        });
    
        let song = null;
        if (songId) {
          try {
            await prisma.playlistSong.create({
              data: {
                playlistId: newPlaylist.id,
                songId: songId,
              }
            });
            
            song = await prisma.song.findUnique({
              where: { id: songId }
            });
          } catch (error) {
            // If adding the song fails, we still want to continue
            // But log the error and inform the user
            console.error("Error adding song to new playlist:", error);
            socket.emit("warning", "Playlist was created but initial song could not be added");
          }
        }
    
        console.log("Created Shared Playlist in Room", roomCode);
    
        socket.emit("playlist-created", {
          playlist: {
            id: newPlaylist.id,
            name: newPlaylist.name,
            songs: sharedPlaylist.playlist.playlistSong.map(ps => ps.song)
          },
          createdBy: user,
          initialSong: song,
        });
    
      } catch (error) {
        handleSocketError(socket, error, "Failed to create shared playlist");
      }
    });
    
    socket.on("add-song-to-playlist", async ({ songId, roomCode, playlistId }) => {
      try {
        if (!songId) {
          socket.emit("error", "Select Song to be added");
          return;
        }
        
        const song = await prisma.song.findUnique({
          where: { id: songId }
        });
        
        if (!song) {
          socket.emit("error", "No song found to be added");
          return;
        }
        
        // Verify the playlist exists and belongs to the user or is shared in a room they're in
        const playlist = await prisma.playlist.findUnique({
          where: { id: playlistId }
        });
        
        if (!playlist) {
          socket.emit("error", "Playlist not found");
          return;
        }
        
        // Check for duplicate song in playlist before adding
        const existingSong = await prisma.playlistSong.findUnique({
          where: {
            playlistId_songId: {
              playlistId: playlistId,
              songId: songId,
            }
          }
        });
        
        if (existingSong) {
          socket.emit("warning", "Song already exists in playlist");
          return;
        }
        
        await prisma.playlistSong.create({
          data: {
            playlistId: playlistId,
            songId: songId,
          }
        });

        const updatedPlaylist = await prisma.playlist.findUnique({
          where: {
            id: playlistId
          },
          select: {
            id: true,
            name: true,
            user: {
              select: {
                id: true,
                username: true
              }
            },
            playlistSong: {
              select: {
                song: {
                  select: {
                    id: true,
                    title: true,
                    artist: true,
                    album: true,
                    duration: true
                  }
                }
              }
            }
          }
        })    

        console.log(song.title, "song added to playlist", playlistId, "room", roomCode);
        socket.emit("song-added-to-playlist", { playlist :{

          playlistId: updatedPlaylist!.id,
          name: updatedPlaylist!.name,
          createdBy: {
            id: updatedPlaylist!.user.id,
            username: updatedPlaylist!.user.username
          },
          songs: updatedPlaylist!.playlistSong.map(item => item.song)
        },
        song
        });
      } catch (error) {
        handleSocketError(socket, error, "Failed to add song to playlist");
      }
    });
    
    socket.on("pause-song", async ({roomCode}) => {
      socket.to(roomCode).emit("song-paused", { userId });
    });
    // NEXT SONG
    socket.on("next-song", async ({ songId, roomCode }) => {
      try {
        await prisma.streamLog.create({
          data: { userId, songId, streamedAt: new Date() },
        });
        
        const [user, song] = await Promise.all([
          prisma.user.findUnique({ where: { id: userId }, select: { id: true, username: true } }),
          prisma.song.findUnique({ where: { id: songId } })
        ]);
        
        if (!song) {
          socket.emit("error", "Song not found");
          return;
        }
        
        console.log("Next Song", song, roomCode);
        io.of("/collab").to(roomCode).emit("song-next", { song, userId });
      } catch (error) {
        handleSocketError(socket, error, "Failed to play next song");
      }
    });

    // PREVIOUS SONG
    socket.on("previous-song", async ({ songId, roomCode }) => {
      try {
        await prisma.streamLog.create({
          data: { userId, songId, streamedAt: new Date() },
        });
        
        const [user, song] = await Promise.all([
          prisma.user.findUnique({ where: { id: userId }, select: { id: true, username: true } }),
          prisma.song.findUnique({ where: { id: songId } })
        ]);
        
        if (!song) {
          socket.emit("error", "Song not found");
          return;
        }
        
        console.log("Previous Song", song, roomCode);
        io.of("/collab").to(roomCode).emit("song-previous", { song, userId });
      } catch (error) {
        handleSocketError(socket, error, "Failed to play previous song");
      }
    });
    // LEAVE ROOM
    socket.on("leave-room", async (code: string) => {
      try {
        const room = await prisma.room.findUnique({ where: { code } });
        if (room) {
          try {
            await prisma.userInRoom.delete({
              where: { roomId_userId: { roomId: room.id, userId } },
            });
          } catch (error) {
            // If the user wasn't in the room, that's fine
            console.log(`User ${userId} wasn't in room ${room.id} or other error:`, error);
          }
        }
        
        io.of("/collab").to(code).emit("user-left-room", { userId });
        socket.leave(code);
      } catch (error) {
        handleSocketError(socket, error, "Failed to leave room");
      }
    });

    // DISCONNECT
    socket.on("disconnect", () => {
      try {
        clearInterval(heartbeat);
        console.log(`User disconnected: ${userId}`);
        // TTL will expire presence key automatically
      } catch (error) {
        // Even if disconnect handling fails, we don't want to emit back since connection is closed
        console.error("Error handling disconnect:", error);
      }
    });
  });
};

/**
 * Centralized error handler for socket events
 */
function handleSocketError(socket: any, error: any, message: string = "An error occurred") {
  console.error(`Socket Error (${socket.id})`, message, error);
  
  let errorMessage = message;
  
  // Handle Prisma-specific errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': // Unique constraint violation
        errorMessage = "This record already exists";
        break;
      case 'P2003': // Foreign key constraint violation
        errorMessage = "Referenced record does not exist";
        break;
      case 'P2025': // Record not found
        errorMessage = "Record not found";
        break;
      default:
        errorMessage = `Database error: ${error.code}`;
    }
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    errorMessage = "Invalid data provided";
  }
  
  // Emit error to client if socket is still connected
  if (socket && socket.connected) {
    socket.emit("error", errorMessage);
  }
}
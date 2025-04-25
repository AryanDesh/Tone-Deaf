import { prisma } from '../db';
import { io, pubClient } from "..";
import { randomUUID } from "node:crypto";

export const sockets = () => {
  io.of('/collab').on('connection', (socket) => {
    console.log(`🔥 /collab connect: socket=${socket.id} user=${socket.userId}`);

    const userId = socket.userId!;
    const presenceKey = `presence:user:${userId}`;

    // Presence TTL heartbeat
    const setPresence = async () => {
      await pubClient!.set(presenceKey, 'online', 'EX', 60);
    };
    setPresence();
    const heartbeat = setInterval(setPresence, 20000);

    // CREATE ROOM
    socket.on("create-room", async (name: string) => {
      const code = randomUUID();
      socket.join(code);

      const room = await prisma.room.create({
        data: { name, code, hostId: userId },
      });

      await prisma.userInRoom.create({
        data: { roomId: room.id, userId },
      });

      console.log(`Room created: id=${room.id} code=${code} by user=${userId}`);
      socket.emit("room-created", code );
    });

    // JOIN ROOM
    socket.on("join-room", async (code: string) => {
      socket.join(code);  

      const room = await prisma.room.findUnique({ where: { code } });
      if (!room) {
        socket.emit("error", "Invalid room code");
        return;
      }

      const exists = await prisma.userInRoom.findUnique({
        where: { roomId_userId: { roomId: room.id, userId } },
      });
      if (!exists) {
        await prisma.userInRoom.create({
          data: { roomId: room.id, userId },
        });
      }

      console.log(`User ${userId} joined room id=${room.id} code=${code}`);
      io.of("/collab").to(code).emit("user-joined", { userId });
    });

    // CHAT
    socket.on("send-message", (message, roomCode) => {
      socket.to(roomCode).emit("receive-message", message);
    });

    // STREAM SONG
    socket.on("stream-song", async ({ songId, roomCode }) => {
      await prisma.streamLog.create({
        data: { userId, songId, streamedAt: new Date() },
      });
      const user = await prisma.user.findUnique( { where : {id : userId} , select : { id: true , username : true}});
      const song = await prisma.song.findUnique({ where: { id: songId } });
      console.log("Streamed Song" , song, roomCode)
      io.of("/collab").to(roomCode).emit("song-streamed", { song, user });
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
    
        const newPlaylist = await prisma.playlist.create({
          data: {
            name: playlistName,
            userId: userId,
            shared: true,
          }
        });
    
        const playlist = await prisma.sharedPlaylist.create({
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
    
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, username: true }
        });
    
        let song = null;
        if (songId) {
          await prisma.playlistSong.create({
            data: {
              playlistId: newPlaylist.id,
              songId: songId,
            }
          });
        }
    
        console.log("Created Shared Playlist in Room", roomCode);
    
        io.of("/collab").to(roomCode).emit("playlist-created", {
          playlist: {
            id: newPlaylist.id,
            name: newPlaylist.name,
            songs: playlist.playlist.playlistSong.map(ps => ps.song)
          },
          createdBy: user,
          initialSong: song,
        });
    
      } catch (err) {
        console.error("Error creating shared playlist:", err);
        socket.emit("error", "Failed to create shared playlist");
      }
    });
    
    socket.on("add-song-to-playlist", async ({ songId, roomCode, playlistId }) => {
      if (songId) {
        // Optionally add this song to the new playlist
        await prisma.playlistSong.create({
          data: {
            playlistId: playlistId,
            songId: songId,
          }
        });
        console.log("song added to playlist to " , playlistId , "room", roomCode);
        socket.emit("song-added-to-playlist");
      }
      else {
        socket.emit("error", "No song found to be added");
      }
    });
    
    socket.on("pause-song", async ({ songId, roomCode }) => {
      await prisma.streamLog.create({
        data: { userId, songId, streamedAt: new Date() },
      });
      const song = await prisma.song.findUnique({ where: { id: songId } });
      console.log("Paused Song" , song, roomCode)
      io.of("/collab").to(roomCode).emit("song-paused", { song, userId });
    });

    // LEAVE ROOM
    socket.on("leave-room", async (code: string) => {
      const room = await prisma.room.findUnique({ where: { code } });
      if (room) {
        await prisma.userInRoom.delete({
          where: { roomId_userId: { roomId: room.id, userId } },
        });
      }
      io.of("/collab").to(code).emit("user-left-room", { userId });
      socket.leave(code);
    });

    // DISCONNECT
    socket.on("disconnect", () => {
      clearInterval(heartbeat);
      console.log(`User disconnected: ${userId}`);
      // TTL will expire presence key automatically
    });
  });
};

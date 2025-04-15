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
    socket.on("send-message", ({ updates, roomCode }) => {
      socket.to(roomCode).emit("receive-message", updates);
    });

    // STREAM SONG
    socket.on("stream-song", async ({ songId, roomCode }) => {
      await prisma.streamLog.create({
        data: { userId, songId, streamedAt: new Date() },
      });
      const song = await prisma.song.findUnique({ where: { id: songId } });
      console.log("Streamed Song" , song, roomCode)
      io.of("/collab").to(roomCode).emit("song-streamed", { song, userId });
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

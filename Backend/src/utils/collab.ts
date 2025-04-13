import { prisma } from '../db';
import { io, pubClient } from "..";
import { randomUUID } from "node:crypto";

export const sockets = () => {
  io.of('/collab').on('connection', (socket) => {
    const userId = socket.userId;
    if (!userId) return;

    console.log(`User connected: ${socket.id} (${userId})`);

    const presenceKey = `presence:user:${userId}`;

    const setPresence = async () => {
      await pubClient!.set(presenceKey, 'online', 'EX', 60);
    };

    // Initial set
    setPresence();

    // Refresh TTL every 20 seconds
    const interval = setInterval(setPresence, 20000);

    socket.on("create-room", async ({ name }) => {
      const roomId = randomUUID();
      socket.join(roomId);
      console.log(`Room created: ${roomId} by user: ${userId}`);

      const room = await prisma.room.create({
        data: {
          name,
          socketId: roomId,
          hostId: userId,
        },
      });

      await prisma.userInRoom.create({
        data: {
          roomId: room.id,
          userId,
        },
      });

      socket.emit("room-created", roomId);
    });

    socket.on("join-room", async ({ roomId }) => {
      socket.join(roomId);
      console.log(`User ${userId} joined room ${roomId}`);

      const existingUserInRoom = await prisma.userInRoom.findUnique({
        where: {
          roomId_userId: {
            roomId,
            userId,
          },
        },
      });

      if (!existingUserInRoom) {
        await prisma.userInRoom.create({
          data: { roomId, userId },
        });
      }

      io.of("/collab").to(roomId).emit("user-joined", { userId });
    });

    socket.on("send-message", ({ updates, roomId }) => {
      socket.to(roomId).emit("receive-message", updates);
    });

    socket.on("stream-song", async ({ songId, roomId, userId }) => {
      await prisma.streamLog.create({
        data: {
          userId,
          songId,
          streamedAt: new Date(),
        },
      });

      io.of("/collab").to(roomId).emit("song-streamed", { songId, userId });
    });

    socket.on("leave-room", async (roomId: string) => {
      if (!roomId || !userId) return;

      await prisma.userInRoom.delete({
        where: {
          roomId_userId: { userId, roomId },
        },
      });

      io.of("/collab").to(roomId).emit("user-left-room", { userId });
    });

    socket.on("disconnect", async () => {
      const userId = socket.userId;
      const presenceKey = `presence:user:${userId}`;
      await pubClient!.set(presenceKey, 'online', 'EX', 60);
      clearInterval(interval);
      console.log(`User disconnected: ${userId}`);
      // We don’t delete the key — TTL will expire it naturally
    });
  });
};

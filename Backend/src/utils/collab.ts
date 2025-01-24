import { randomUUID } from "node:crypto";
import { io } from "..";

export const sockets = () => {
  io.of('/collab').on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("join-room", (roomId) => {
      console.log(`User ${socket.id} joined room: ${roomId}`);
      socket.join(roomId); 
    });
    socket.on("create-room", () => {
      const roomId = randomUUID();
      console.log(`User ${socket.id} joined room: ${roomId}`);
      socket.join(roomId); 
    });
    
    socket.on("send-message", (updates, roomId) => {
      console.log(`Message received in room ${roomId}`);
      console.log(updates);
     socket.to(roomId).emit("receive-message", updates);
    });
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

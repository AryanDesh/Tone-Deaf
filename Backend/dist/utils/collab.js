"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sockets = void 0;
const db_1 = require("../db");
const __1 = require("..");
const node_crypto_1 = require("node:crypto");
const client_1 = require("@prisma/client");
const sockets = () => {
    __1.io.of('/collab').on('connection', (socket) => {
        console.log(`🔥 /collab connect: socket=${socket.id} user=${socket.userId}`);
        const userId = socket.userId;
        const presenceKey = `presence:user:${userId}`;
        // Presence TTL heartbeat
        const setPresence = () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                yield __1.pubClient.set(presenceKey, 'online', 'EX', 60);
            }
            catch (error) {
                console.error('Failed to set presence:', error);
                // Continue execution - presence is non-critical
            }
        });
        setPresence();
        const heartbeat = setInterval(setPresence, 20000);
        socket.on("get:presence", (_a) => __awaiter(void 0, [_a], void 0, function* ({ userIds }) {
            try {
                if (!Array.isArray(userIds) || userIds.length === 0) {
                    return;
                }
                console.log(`Received presence request for users: ${userIds.join(', ')}`);
                // Get online status for each requested user
                const presencePromises = userIds.map((userId) => __awaiter(void 0, void 0, void 0, function* () {
                    const key = `presence:user:${userId}`;
                    try {
                        const status = yield __1.pubClient.get(key);
                        return { userId, online: status === 'online' };
                    }
                    catch (error) {
                        console.error(`Error getting presence for ${userId}:`, error);
                        return { userId, online: false };
                    }
                }));
                const presenceResults = yield Promise.all(presencePromises);
                // Group by online status for more efficient response
                const onlineUsers = presenceResults.filter(u => u.online).map(u => u.userId);
                const offlineUsers = presenceResults.filter(u => !u.online).map(u => u.userId);
                const response = [];
                if (onlineUsers.length > 0) {
                    response.push({ userIds: onlineUsers, status: 'online' });
                }
                if (offlineUsers.length > 0) {
                    response.push({ userIds: offlineUsers, status: 'offline' });
                }
                // Send batch update to client
                socket.emit('presence:update', response);
                // Also send individual updates for compatibility
                presenceResults.forEach(result => {
                    socket.emit('user:presence', {
                        userId: result.userId,
                        status: result.online ? 'online' : 'offline'
                    });
                });
            }
            catch (error) {
                console.error('Error processing presence request:', error);
                // Continue execution - presence is non-critical
            }
        }));
        // CREATE ROOM
        socket.on("create-room", (name) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const code = (0, node_crypto_1.randomUUID)();
                socket.join(code);
                const room = yield db_1.prisma.room.create({
                    data: { name, code, hostId: userId },
                });
                yield db_1.prisma.userInRoom.create({
                    data: { roomId: room.id, userId },
                });
                console.log(`Room created: id=${room.id} code=${code} by user=${userId}`);
                socket.emit("room-created", code);
            }
            catch (error) {
                handleSocketError(socket, error, "Failed to create room");
            }
        }));
        // JOIN ROOM
        socket.on("join-room", (code) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const room = yield db_1.prisma.room.findUnique({ where: { code } });
                if (!room) {
                    socket.emit("error", "Invalid room code");
                    return;
                }
                socket.join(code);
                try {
                    yield db_1.prisma.userInRoom.create({
                        data: { roomId: room.id, userId },
                    });
                }
                catch (error) {
                    // Handle unique constraint violation (user already in room)
                    if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                        if (error.code === 'P2002') {
                            // User already in room, this is fine, continue
                            console.log(`User ${userId} already in room ${room.id}`);
                        }
                        else {
                            throw error; // Re-throw non-constraint errors
                        }
                    }
                    else {
                        throw error;
                    }
                }
                console.log(`User ${userId} joined room id=${room.id} code=${code}`);
                __1.io.of("/collab").to(code).emit("user-joined", { userId });
            }
            catch (error) {
                handleSocketError(socket, error, "Failed to join room");
            }
        }));
        // CHAT
        socket.on("send-message", (message, roomCode) => {
            try {
                socket.to(roomCode).emit("receive-message", message);
            }
            catch (error) {
                handleSocketError(socket, error, "Failed to send message");
            }
        });
        // STREAM SONG
        socket.on("stream-song", (_a) => __awaiter(void 0, [_a], void 0, function* ({ songId, roomCode }) {
            try {
                yield db_1.prisma.streamLog.create({
                    data: { userId, songId, streamedAt: new Date() },
                });
                const [user, song] = yield Promise.all([
                    db_1.prisma.user.findUnique({ where: { id: userId }, select: { id: true, username: true } }),
                    db_1.prisma.song.findUnique({ where: { id: songId } })
                ]);
                if (!song) {
                    socket.emit("error", "Song not found");
                    return;
                }
                console.log("Streamed Song", song, roomCode);
                socket.to(roomCode).emit("song-streamed", { song, user });
            }
            catch (error) {
                handleSocketError(socket, error, "Failed to stream song");
            }
        }));
        socket.on("create-playlist", (_a) => __awaiter(void 0, [_a], void 0, function* ({ playlistName, roomCode, songId }) {
            try {
                const room = yield db_1.prisma.room.findUnique({
                    where: { code: roomCode },
                    select: { id: true }
                });
                if (!room) {
                    socket.emit("error", "Invalid room code");
                    return;
                }
                // Use transaction to ensure data consistency
                const { newPlaylist, sharedPlaylist } = yield db_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
                    const newPlaylist = yield tx.playlist.create({
                        data: {
                            name: playlistName,
                            userId: userId,
                            shared: true,
                        }
                    });
                    const sharedPlaylist = yield tx.sharedPlaylist.create({
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
                }));
                const user = yield db_1.prisma.user.findUnique({
                    where: { id: userId },
                    select: { id: true, username: true }
                });
                let song = null;
                if (songId) {
                    try {
                        yield db_1.prisma.playlistSong.create({
                            data: {
                                playlistId: newPlaylist.id,
                                songId: songId,
                            }
                        });
                        song = yield db_1.prisma.song.findUnique({
                            where: { id: songId }
                        });
                    }
                    catch (error) {
                        // If adding the song fails, we still want to continue
                        // But log the error and inform the user
                        console.error("Error adding song to new playlist:", error);
                        socket.emit("warning", "Playlist was created but initial song could not be added");
                    }
                }
                console.log("Created Shared Playlist in Room", roomCode);
                __1.io.of("/collab").to(roomCode).emit("playlist-created", {
                    playlist: {
                        id: newPlaylist.id,
                        name: newPlaylist.name,
                        songs: sharedPlaylist.playlist.playlistSong.map(ps => ps.song)
                    },
                    createdBy: user,
                    initialSong: song,
                });
            }
            catch (error) {
                handleSocketError(socket, error, "Failed to create shared playlist");
            }
        }));
        socket.on("add-song-to-playlist", (_a) => __awaiter(void 0, [_a], void 0, function* ({ songId, roomCode, playlistId }) {
            try {
                if (!songId) {
                    socket.emit("error", "Select Song to be added");
                    return;
                }
                const song = yield db_1.prisma.song.findUnique({
                    where: { id: songId }
                });
                if (!song) {
                    socket.emit("error", "No song found to be added");
                    return;
                }
                // Verify the playlist exists and belongs to the user or is shared in a room they're in
                const playlist = yield db_1.prisma.playlist.findUnique({
                    where: { id: playlistId }
                });
                if (!playlist) {
                    socket.emit("error", "Playlist not found");
                    return;
                }
                // Check for duplicate song in playlist before adding
                const existingSong = yield db_1.prisma.playlistSong.findUnique({
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
                yield db_1.prisma.playlistSong.create({
                    data: {
                        playlistId: playlistId,
                        songId: songId,
                    }
                });
                const updatedPlaylist = yield db_1.prisma.playlist.findUnique({
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
                });
                console.log(song.title, "song added to playlist", playlistId, "room", roomCode);
                __1.io.of("/collab").to(roomCode).emit("song-added-to-playlist", { playlist: {
                        playlistId: updatedPlaylist.id,
                        name: updatedPlaylist.name,
                        createdBy: {
                            id: updatedPlaylist.user.id,
                            username: updatedPlaylist.user.username
                        },
                        songs: updatedPlaylist.playlistSong.map(item => item.song)
                    },
                    song });
            }
            catch (error) {
                handleSocketError(socket, error, "Failed to add song to playlist");
            }
        }));
        socket.on("play-song", (_a) => __awaiter(void 0, [_a], void 0, function* ({ roomCode }) {
            socket.to(roomCode).emit("song-played", { userId });
        }));
        socket.on("pause-song", (_a) => __awaiter(void 0, [_a], void 0, function* ({ roomCode }) {
            socket.to(roomCode).emit("song-paused", { userId });
        }));
        // NEXT SONG
        socket.on("next-song", (_a) => __awaiter(void 0, [_a], void 0, function* ({ songId, roomCode }) {
            try {
                yield db_1.prisma.streamLog.create({
                    data: { userId, songId, streamedAt: new Date() },
                });
                const [user, song] = yield Promise.all([
                    db_1.prisma.user.findUnique({ where: { id: userId }, select: { id: true, username: true } }),
                    db_1.prisma.song.findUnique({ where: { id: songId } })
                ]);
                if (!song) {
                    socket.emit("error", "Song not found");
                    return;
                }
                console.log("Next Song", song, roomCode);
                __1.io.of("/collab").to(roomCode).emit("song-next", { song, userId });
            }
            catch (error) {
                handleSocketError(socket, error, "Failed to play next song");
            }
        }));
        // PREVIOUS SONG
        socket.on("previous-song", (_a) => __awaiter(void 0, [_a], void 0, function* ({ songId, roomCode }) {
            try {
                yield db_1.prisma.streamLog.create({
                    data: { userId, songId, streamedAt: new Date() },
                });
                const [user, song] = yield Promise.all([
                    db_1.prisma.user.findUnique({ where: { id: userId }, select: { id: true, username: true } }),
                    db_1.prisma.song.findUnique({ where: { id: songId } })
                ]);
                if (!song) {
                    socket.emit("error", "Song not found");
                    return;
                }
                console.log("Previous Song", song, roomCode);
                __1.io.of("/collab").to(roomCode).emit("song-previous", { song, userId });
            }
            catch (error) {
                handleSocketError(socket, error, "Failed to play previous song");
            }
        }));
        // LEAVE ROOM
        socket.on("leave-room", (code) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const room = yield db_1.prisma.room.findUnique({ where: { code } });
                if (room) {
                    try {
                        yield db_1.prisma.userInRoom.delete({
                            where: { roomId_userId: { roomId: room.id, userId } },
                        });
                    }
                    catch (error) {
                        // If the user wasn't in the room, that's fine
                        console.log(`User ${userId} wasn't in room ${room.id} or other error:`, error);
                    }
                }
                __1.io.of("/collab").to(code).emit("user-left-room", { userId });
                socket.leave(code);
            }
            catch (error) {
                handleSocketError(socket, error, "Failed to leave room");
            }
        }));
        // DISCONNECT
        socket.on("disconnect", () => {
            try {
                clearInterval(heartbeat);
                console.log(`User disconnected: ${userId}`);
                // TTL will expire presence key automatically
            }
            catch (error) {
                // Even if disconnect handling fails, we don't want to emit back since connection is closed
                console.error("Error handling disconnect:", error);
            }
        });
    });
};
exports.sockets = sockets;
/**
 * Centralized error handler for socket events
 */
function handleSocketError(socket, error, message = "An error occurred") {
    console.error(`Socket Error (${socket.id})`, message, error);
    let errorMessage = message;
    // Handle Prisma-specific errors
    if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
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
    }
    else if (error instanceof client_1.Prisma.PrismaClientValidationError) {
        errorMessage = "Invalid data provided";
    }
    // Emit error to client if socket is still connected
    if (socket && socket.connected) {
        socket.emit("error", errorMessage);
    }
}

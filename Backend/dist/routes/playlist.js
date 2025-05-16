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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = __importDefault(require("../middleware/auth"));
const playlistRouter = (0, express_1.Router)();
playlistRouter.use(auth_1.default);
playlistRouter.get('/all-playlist', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        console.log(userId);
        const UsersPrivatePlaylists = yield db_1.prisma.playlist.findMany({
            where: {
                userId: userId,
                shared: false,
            }
        });
        res.json(UsersPrivatePlaylists);
    }
    catch (e) {
        res.status(404).json({ message: "error fetching playlists", error: e });
    }
}));
playlistRouter.get('/room/:roomCode', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roomCode } = req.params;
        const userId = req.userId;
        const room = yield db_1.prisma.room.findUnique({
            where: { code: roomCode },
            select: { id: true }
        });
        if (!room) {
            res.status(404).json({ success: false, message: "Room not found" });
            return;
        }
        // Find all shared playlists in this room
        const sharedPlaylists = yield db_1.prisma.sharedPlaylist.findMany({
            where: {
                roomId: room.id
            },
            include: {
                playlist: {
                    include: {
                        user: {
                            select: {
                                username: true,
                                id: true
                            }
                        },
                        playlistSong: {
                            include: {
                                song: true
                            }
                        }
                    }
                }
            }
        });
        // Format the response
        const formattedPlaylists = sharedPlaylists.map(sharedPlaylist => {
            return {
                id: sharedPlaylist.playlist.id,
                name: sharedPlaylist.playlist.name,
                sharedPlaylistId: sharedPlaylist.id,
                owner: {
                    id: sharedPlaylist.playlist.user.id,
                    username: sharedPlaylist.playlist.user.username,
                    isCurrentUser: sharedPlaylist.playlist.user.id === userId
                },
                songs: sharedPlaylist.playlist.playlistSong.map(ps => ({
                    id: ps.song.id,
                    title: ps.song.title,
                    artist: ps.song.artist,
                    album: ps.song.album,
                    duration: ps.song.duration
                }))
            };
        });
        res.status(200).json({
            success: true,
            roomCode,
            playlists: formattedPlaylists
        });
    }
    catch (error) {
        console.error('Error fetching shared playlists in room:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch shared playlists',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
playlistRouter.get('/shared-playlist', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'User ID is required' });
            return;
        }
        const sharedPlaylists = yield db_1.prisma.playlist.findMany({
            where: {
                userId: userId,
                shared: true
            },
            include: {
                playlistSong: {
                    include: {
                        song: true
                    }
                },
                sharedPlaylist: {
                    include: {
                        room: {
                            select: {
                                name: true,
                                code: true,
                                users: {
                                    select: {
                                        user: {
                                            select: {
                                                username: true,
                                                id: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        const formattedPlaylists = sharedPlaylists.map(playlist => {
            return {
                id: playlist.id,
                name: playlist.name,
                songs: playlist.playlistSong.map(ps => ps.song),
                sharedIn: playlist.sharedPlaylist ? {
                    room: {
                        id: playlist.sharedPlaylist.roomId,
                        name: playlist.sharedPlaylist.room.name,
                        code: playlist.sharedPlaylist.room.code,
                        participants: playlist.sharedPlaylist.room.users.map(u => ({
                            id: u.user.id,
                            username: u.user.username
                        }))
                    }
                } : null
            };
        });
        res.status(200).json({
            success: true,
            playlists: formattedPlaylists
        });
    }
    catch (error) {
        console.error('Error fetching shared playlists:', error);
        res.status(500).json({
            error: 'Failed to fetch shared playlists',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
playlistRouter.get('/:playlistId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { playlistId } = req.params;
    try {
        const playlist = yield db_1.prisma.playlist.findUnique({
            where: { id: parseInt(playlistId) },
            include: {
                playlistSong: { select: { songId: true, song: true } },
            }
        });
        if (!playlist) {
            res.status(404).json({ message: "Playlist not found" });
            return;
        }
        res.status(200).json({
            playlistId: playlist.id,
            playlistName: playlist.name,
            songs: playlist.playlistSong,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong", error });
    }
}));
playlistRouter.post('/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.body;
    const userId = req.userId;
    if (!userId) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
    }
    try {
        const playlist = yield db_1.prisma.playlist.create({
            data: {
                name,
                userId,
            },
        });
        res.status(201).json({ message: "Playlist created successfully", playlist });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong", error: error });
    }
}));
playlistRouter.post('/:playlistId/add-song', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { playlistId } = req.params;
    const { songId } = req.body;
    try {
        yield db_1.prisma.playlistSong.create({
            data: {
                playlistId: parseInt(playlistId),
                songId: songId,
            },
        });
        res.status(200).json({ message: "Song added to playlist successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong", error: error });
    }
}));
playlistRouter.delete('/:playlistId/remove-song', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { playlistId } = req.params;
    const { songId } = req.body;
    try {
        yield db_1.prisma.playlistSong.delete({
            where: {
                playlistId_songId: {
                    playlistId: parseInt(playlistId),
                    songId: songId,
                },
            },
        });
        res.status(200).json({ message: "Song removed from playlist successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong", error: error });
    }
}));
playlistRouter.post('/like', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { songId } = req.body;
    const userId = req.userId;
    if (!userId) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
    }
    const user = yield db_1.prisma.user.findUnique({
        where: { id: userId }
    });
    if (!(user === null || user === void 0 ? void 0 : user.likedId)) {
        res.json({ message: "No Liked Playlist" });
        return;
    }
    try {
        yield db_1.prisma.playlistSong.delete({
            where: {
                playlistId_songId: {
                    playlistId: user.likedId,
                    songId: songId,
                },
            },
        });
        res.status(200).json({ message: "Song liked successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong", error: error });
    }
}));
playlistRouter.post('/dislike', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { songId } = req.body;
    const userId = req.userId;
    if (!userId) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
    }
    const user = yield db_1.prisma.user.findUnique({
        where: { id: userId }
    });
    if (!(user === null || user === void 0 ? void 0 : user.likedId)) {
        res.json({ message: "No Liked Playlist" });
        return;
    }
    try {
        yield db_1.prisma.playlistSong.delete({
            where: {
                playlistId_songId: {
                    playlistId: user.likedId,
                    songId: songId,
                },
            },
        });
        res.status(200).json({ message: "Song disliked successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong", error: error });
    }
}));
exports.default = playlistRouter;

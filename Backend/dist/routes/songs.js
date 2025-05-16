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
const songRouter = (0, express_1.Router)();
songRouter.use(auth_1.default);
// ToDOs: User Recent Songs, Recommended Songs. Both routes need to be authenticated.
songRouter.post('/findsong', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const songName = req.body.songName;
    try {
        const songs = yield db_1.prisma.song.findMany({
            where: {
                title: {
                    contains: songName,
                    mode: 'insensitive',
                },
            },
        });
        if (!songs) {
            res.status(400).json({ msg: "No songs found" });
        }
        res.status(200).json(songs);
    }
    catch (e) {
        res.status(500).json({ message: "Internal Server Error" });
    }
}));
// all songs ,
songRouter.get('/allsongs', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const allSongs = yield db_1.prisma.song.findMany();
    if (!allSongs)
        res.status(400).json({ msg: "No songs found" });
    res.status(200).json(allSongs);
}));
songRouter.get('/filter', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tags } = req.query;
    if (!tags || typeof tags !== 'string') {
        res.status(400).json({ error: 'Please provide a valid list of tags.' });
        return;
    }
    try {
        const tagList = tags.split(',').map((tag) => tag.trim());
        const songs = yield db_1.prisma.song.findMany({
            where: {
                tags: {
                    some: {
                        tag: {
                            tag: {
                                in: tagList,
                            },
                        },
                    },
                },
            },
            include: {
                tags: {
                    include: {
                        tag: true,
                    },
                },
            },
        });
        res.status(200).json(songs);
        return;
    }
    catch (error) {
        console.error('Error filtering songs by tags:', error);
        res.status(500).json({ error: 'Failed to fetch songs by tags.' });
        return;
    }
}));
/**
 * Get recommended songs for a user based on their listening history
 * Recommendation algorithm:
 * 1. Find the most common tags from user's recent streams
 * 2. Recommend songs that share these tags but haven't been streamed by the user recently
 */
songRouter.get('/recommendations', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    if (!userId) {
        res.status(400).json({ error: 'UserId is required and must be a string' });
        return;
    }
    try {
        // Get user's recently streamed songs (last 20)
        const recentStreams = yield db_1.prisma.streamLog.findMany({
            where: { userId: String(userId) },
            orderBy: { streamedAt: 'desc' },
            take: 20,
            include: {
                song: {
                    include: {
                        tags: {
                            include: {
                                tag: true
                            }
                        }
                    }
                }
            }
        });
        if (recentStreams.length === 0) {
            const popularSongs = yield db_1.prisma.song.findMany({
                take: 10,
                orderBy: {
                    streamLog: {
                        _count: 'desc'
                    }
                }
            });
            res.status(200).json(popularSongs);
            return;
        }
        // Extract tags from recently played songs
        const tagFrequency = {};
        recentStreams.forEach(stream => {
            stream.song.tags.forEach(tagRelation => {
                const tagId = tagRelation.tagId;
                tagFrequency[tagId] = (tagFrequency[tagId] || 0) + 1;
            });
        });
        // Sort tags by frequency
        const sortedTags = Object.entries(tagFrequency)
            .sort((a, b) => b[1] - a[1])
            .map(entry => parseInt(entry[0]));
        // Get top 3 tags (or less if user has fewer tags)
        const topTags = sortedTags.slice(0, 3);
        // Get recently played song IDs to exclude them from recommendations
        const recentSongIds = recentStreams.map(stream => stream.songId);
        // Find songs with similar tags that user hasn't recently played
        const recommendedSongs = yield db_1.prisma.song.findMany({
            where: {
                AND: [
                    {
                        tags: {
                            some: {
                                tagId: {
                                    in: topTags
                                }
                            }
                        }
                    },
                    {
                        id: {
                            notIn: recentSongIds
                        }
                    }
                ]
            },
            include: {
                tags: {
                    include: {
                        tag: true
                    }
                }
            },
            take: 10
        });
        res.status(200).json(recommendedSongs);
    }
    catch (error) {
        console.error('Error getting recommendations:', error);
        res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
}));
exports.default = songRouter;

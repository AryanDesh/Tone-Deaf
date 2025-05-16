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
const zod_1 = __importDefault(require("zod"));
const searchRouter = (0, express_1.Router)();
// Schema validation for search query
const SearchQuerySchema = zod_1.default.object({
    q: zod_1.default.string().min(1).max(100),
});
// Search endpoint - /api/search?q=searchterm
searchRouter.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate the search query
        const { q } = SearchQuerySchema.parse(req.query);
        const searchTerm = `%${q}%`; // Add wildcards for ILIKE search
        // Perform concurrent search across multiple tables
        const [songs, users, rooms] = yield Promise.all([
            // Search songs by title, artist, or album
            db_1.prisma.song.findMany({
                where: {
                    OR: [
                        { title: { contains: q, mode: "insensitive" } },
                        { artist: { contains: q, mode: "insensitive" } },
                        { album: { contains: q, mode: "insensitive" } },
                    ],
                },
                take: 10, // Limit results
            }),
            // Search users by username or email
            db_1.prisma.user.findMany({
                where: {
                    OR: [
                        { username: { contains: q, mode: "insensitive" } },
                        { email: { contains: q, mode: "insensitive" } },
                    ],
                },
                select: {
                    id: true,
                    username: true,
                    email: true,
                },
                take: 10, // Limit results
            }),
            // Search active rooms by name
            db_1.prisma.room.findMany({
                where: {
                    name: { contains: q, mode: "insensitive" },
                },
                select: {
                    id: true,
                    name: true,
                    code: true,
                    hostId: true,
                    host: {
                        select: {
                            username: true,
                        },
                    },
                },
                take: 10, // Limit results
            }),
        ]);
        // For users, filter out the current user from results
        const userId = req.userId;
        const filteredUsers = users.filter((user) => user.id !== userId);
        res.status(200).json({
            songs,
            users: filteredUsers,
            rooms,
        });
    }
    catch (error) {
        console.error("Search error:", error);
        if (error instanceof zod_1.default.ZodError) {
            res.status(400).json({ message: "Invalid search query", error: error.errors });
            return;
        }
        res.status(500).json({ message: "Error performing search" });
    }
}));
exports.default = searchRouter;

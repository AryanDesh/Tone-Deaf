import { Router } from "express";
import { prisma } from "../db";
import z from "zod";

const searchRouter = Router();

// Schema validation for search query
const SearchQuerySchema = z.object({
  q: z.string().min(1).max(100),
});

// Search endpoint - /api/search?q=searchterm
searchRouter.get("/", async (req, res) => {
  try {
    // Validate the search query
    const { q } = SearchQuerySchema.parse(req.query);
    const searchTerm = `%${q}%`; // Add wildcards for ILIKE search

    // Perform concurrent search across multiple tables
    const [songs, users, rooms] = await Promise.all([
      // Search songs by title, artist, or album
      prisma.song.findMany({
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
      prisma.user.findMany({
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
      prisma.room.findMany({
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
  } catch (error) {
    console.error("Search error:", error);
    
    if (error instanceof z.ZodError) {
    res.status(400).json({ message: "Invalid search query", error: error.errors });
      return
    }
    
    res.status(500).json({ message: "Error performing search" });
  }
});

export default searchRouter;